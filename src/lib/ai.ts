// ============================================================
//  Awais Sabir — Instagram AI Agent  |  ai-agent.ts
//  Fixed: 9 improvements over original
// ============================================================

import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// ── Types ────────────────────────────────────────────────────

export type MessageRole = "user" | "assistant";

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

// ── Constants ────────────────────────────────────────────────

const MAX_TOKENS = 180;   // FIX #3 — was 120, caused cut-off replies
const MAX_HISTORY_MSGS = 20;    // FIX #5 — cap context window to save tokens
const IG_CHAR_LIMIT = 950;   // Instagram DM hard cap (1000 - safety buffer)

// ── System Prompts ───────────────────────────────────────────

/**
 * FIX #1 — Root cause of the "Hey, give me a sec" loop.
 * The original code imported these from an external file that was
 * either missing, exporting an empty string, or undefined — causing
 * OpenAI to fall back to a default / hallucinated response on every turn.
 *
 * Both prompts are now defined directly in this file so the agent
 * always has a valid, personalised system prompt — no external dependency.
 */

const SYSTEM_PROMPT_FIRST_MESSAGE = `
You are Awais Sabir's Instagram DM assistant. Your job is to sound exactly
like Awais — bold, motivational, technically sharp, and always real.

WHO YOU REPRESENT:
Awais Sabir is a solo freelance developer, AI student at NUTECH Islamabad,
entrepreneur, and futures trader based in Rawalpindi/Islamabad, Pakistan.

HIS SERVICES:
1. AI/ML Development — custom ML models, LLM-powered apps, automation
   pipelines. Stack: Python, PyTorch, FastAPI, Ollama. DM "AI PROJECT".
2. Full-Stack Development — React + Vite, Node.js, Flutter, PostgreSQL.
   Fast and solid. DM "BUILD".
3. ClientHunter AI — AI-powered outbound sales SaaS (early access).
   WhatsApp voice agent, CSV leads, full funnel. DM "CLIENTHUNTER".
4. GoldSignal Pro — Telegram trading bot for XAU/USD, XAG/USD, DXY
   using Smart Money Concepts. DM "GOLD".

PERSONALITY RULES:
- Bold, direct, encouraging — never robotic or corporate
- Mirror what the client said before answering
- Under 4 sentences per reply — Instagram is NOT email
- Max 2 emojis only when they add punch
- Forbidden words: "absolutely", "certainly", "of course", "delighted"
- Never make promises Awais hasn't confirmed

YOUR FIRST MESSAGE GOAL:
Greet them warmly, mirror their opening message to show you read it,
then ask ONE focused question to understand their real need.
Do NOT introduce yourself with a generic opener.
`.trim();

const SYSTEM_PROMPT_FOLLOWUP = `
You are Awais Sabir's Instagram DM assistant. Sound exactly like Awais —
bold, direct, technically credible, and always motivational.

CONVERSATION RULES:
- You are mid-conversation. Do NOT re-introduce yourself.
- Do NOT say "Hey, give me a sec" or "I'll get back to you" unless
  you are genuinely escalating to Awais for a complex decision.
- Read the full conversation history and give a DIRECT, HELPFUL reply.
- Under 4 sentences. Max 2 emojis.
- End with ONE clear call to action.

TRIGGER RESPONSES:
- "price/cost/rates"       → explain pricing or ask them to DM "PRICE"
- "ClientHunter/sales AI"  → explain ClientHunter AI, invite to waitlist
- "collab/partner"         → escalate: "Let me get Awais on this directly"
- "signal/gold/XAU"        → explain GoldSignal Pro
- "hire/call/book"         → send booking CTA
- "not happy/issue"        → empathy first, then escalate

ESCALATE (say "Let me get Awais on this directly") for:
contract discussions, pricing negotiations, partnership proposals,
refund disputes, legal/financial questions.

AWAIS'S VALUES:
"Let's build." · "Real ones execute." · "Done > perfect."
`.trim();

// ── Helpers ──────────────────────────────────────────────────

/**
 * FIX #2 — Clean legacy debug prefixes AND defensive null/empty guard.
 * Original only stripped [GPT-4o] but didn't guard against null content.
 */
function cleanMessages(messages: ChatMessage[]): ChatMessage[] {
  return messages
    .filter((m) => m.content && m.content.trim().length > 0) // drop empty msgs
    .map((m) => ({
      role: m.role,
      content: m.content
        .replace(/^\[GPT-4o\]\s*/i, "")
        .replace(/^\[.*?\]\s*/, "")  // strip any other debug prefix formats
        .trim(),
    }));
}

/**
 * FIX #5 — Trim conversation history to the last N messages.
 * Prevents token overflow and keeps context tight for Instagram DMs.
 */
function trimHistory(messages: ChatMessage[], maxMessages: number): ChatMessage[] {
  if (messages.length <= maxMessages) return messages;
  return messages.slice(messages.length - maxMessages);
}

/**
 * FIX #6 — Detect if the agent is stuck in a repetitive loop.
 * If the last 2 assistant replies are identical, flag it.
 */
function isStuckInLoop(messages: ChatMessage[]): boolean {
  const assistantMsgs = messages
    .filter((m) => m.role === "assistant")
    .map((m) => m.content.trim());

  if (assistantMsgs.length < 2) return false;

  const last = assistantMsgs[assistantMsgs.length - 1];
  const prev = assistantMsgs[assistantMsgs.length - 2];
  return last === prev;
}

/**
 * FIX #7 — Enforce Instagram char limit with clean sentence boundary cut,
 * not a raw mid-word substring like the original did.
 */
function enforceCharLimit(text: string, limit: number): string {
  if (text.length <= limit) return text;

  // Try to cut at the last sentence boundary before the limit
  const truncated = text.substring(0, limit);
  const lastPeriod = Math.max(
    truncated.lastIndexOf("."),
    truncated.lastIndexOf("!"),
    truncated.lastIndexOf("?")
  );

  if (lastPeriod > limit * 0.6) {
    return truncated.substring(0, lastPeriod + 1);
  }

  // Fallback: cut at last space to avoid mid-word break
  const lastSpace = truncated.lastIndexOf(" ");
  return truncated.substring(0, lastSpace > 0 ? lastSpace : limit) + "…";
}

// ── Main Export ──────────────────────────────────────────────

/**
 * FIX #4 — Improved return type. Original returned a bare string with
 * no metadata. Now returns structured object so callers can log/debug.
 */
export interface AIResponse {
  text: string;
  isFirstMessage: boolean;
  model: string;
  tokensUsed?: number;
}

export async function getAIResponse(
  messages: ChatMessage[]
): Promise<AIResponse> {

  // FIX #2 — Clean before anything else
  const cleaned = cleanMessages(messages);

  // Determine conversation state
  const isFirstMessage = cleaned.filter((m) => m.role === "assistant").length === 0;
  const systemPrompt = isFirstMessage
    ? SYSTEM_PROMPT_FIRST_MESSAGE
    : SYSTEM_PROMPT_FOLLOWUP;

  // FIX #5 — Trim history to prevent token overflow
  const trimmed = trimHistory(cleaned, MAX_HISTORY_MSGS);

  // FIX #6 — Break out of repetitive loop before calling API
  if (!isFirstMessage && isStuckInLoop(cleaned)) {
    console.warn("[Agent] Loop detected — injecting recovery prompt");
    trimmed.push({
      role: "user",
      content: "__INTERNAL: You repeated yourself. Give a fresh, direct response to the client's actual request above.__",
    });
  }

  const payload = [
    { role: "system" as const, content: systemPrompt },
    ...trimmed,
  ];

  // FIX #8 — Structured logging with request ID for easier debugging
  const reqId = Date.now().toString(36).toUpperCase();
  console.log(
    `[Agent:${reqId}] isFirst=${isFirstMessage} | history=${cleaned.length} msgs | trimmed=${trimmed.length}`
  );

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: payload,
      temperature: 0.55,   // FIX #9 — was 0.4 (too rigid/robotic). 0.55 keeps
      //           it consistent but sounds more human.
      max_tokens: MAX_TOKENS,
    });

    const raw = completion.choices[0]?.message?.content?.trim() ?? "";
    const text = enforceCharLimit(raw, IG_CHAR_LIMIT) // FIX #7
      || "What can I help you build today?";

    console.log(`[Agent:${reqId}] Reply (${text.length} chars): ${text.substring(0, 100)}`);

    return {
      text,
      isFirstMessage,
      model: "gpt-4o",
      tokensUsed: completion.usage?.total_tokens,
    };

  } catch (err: unknown) {
    // FIX #8 — typed error handling instead of bare `any`
    const message = err instanceof Error ? err.message : String(err);
    console.error(`[Agent:${reqId}] OpenAI error: ${message}`);

    return {
      text: "Awais is heads-down right now — drop your question and he'll get back to you shortly!",
      isFirstMessage,
      model: "gpt-4o",
    };
  }
}