import OpenAI from "openai";
import { INSTAGRAM_SYSTEM_PROMPT } from "@/lib/system-prompt";
import { searchKnowledge } from "./knowledge";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const FALLBACK_MODELS = [
  process.env.AI_MODEL,
  "meta-llama/llama-3.3-70b-instruct:free",
  "qwen/qwen-2.5-72b-instruct:free",
  "google/gemini-2.5-flash:free",
  "google/gemma-3-12b-it:free",
].filter(Boolean) as string[];

export async function getAIResponse(
  messages: { role: "user" | "assistant"; content: string }[]
) {
  // RAG: Search for relevant context
  const lastUserMessage = [...messages].reverse().find(m => m.role === 'user')?.content || "";
  let context = "";
  
  if (lastUserMessage) {
    try {
      const searchResults = await searchKnowledge(lastUserMessage);
      if (searchResults.length > 0) {
        context = "\n\nADDITIONAL CONTEXT FROM KNOWLEDGE BASE:\n" + 
          searchResults.map(r => r.content).join("\n---\n") +
          "\n\nUse the above context to answer accurately if relevant.";
      }
    } catch (err) {
      console.error("Knowledge base search failed:", err);
    }
  }

  const payload = [
    { role: "system" as const, content: INSTAGRAM_SYSTEM_PROMPT + context },
    ...messages,
  ];

  for (const model of FALLBACK_MODELS) {
    try {
      const completion = await openai.chat.completions.create({ model, messages: payload });
      return completion.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
    } catch (err: unknown) {
      const status = (err as { status?: number }).status;
      if (status !== 429 && status !== 404) throw err;
      console.warn(`Model ${model} failed with ${status}, trying next...`);
    }
  }

  return "Sorry, I'm temporarily unavailable. Please try again shortly.";
}
