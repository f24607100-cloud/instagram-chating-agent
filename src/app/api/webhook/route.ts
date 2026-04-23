import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { sendInstagramMessage, fetchInstagramProfile } from "@/lib/instagram";
import { getAIResponse } from "@/lib/ai";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token === process.env.INSTAGRAM_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 });
  }

  return new Response("Forbidden", { status: 403 });
}

export async function POST(request: NextRequest) {
  const body = await request.json();

  // Only process instagram events
  if (body.object !== "instagram") {
    return Response.json({ status: "ignored" });
  }

  const entry = body.entry?.[0];
  const messaging = entry?.messaging?.[0];

  if (!messaging) {
    return Response.json({ status: "no_messaging" });
  }

  // Skip echo messages (sent by our own page)
  if (messaging.message?.is_echo) {
    return Response.json({ status: "echo_ignored" });
  }

  // Only handle text messages
  if (!messaging.message?.text) {
    return Response.json({ status: "non_text" });
  }

  const igsid = messaging.sender.id;
  const text = messaging.message.text;
  const instagramMsgId = messaging.message.mid;

  console.log(`Received message from ${igsid}: ${text}`);

  try {
    // Find or create conversation
    let { data: conversation } = await supabase
      .from("instagram_conversations")
      .select("*")
      .eq("igsid", igsid)
      .single();

    if (!conversation) {
      // Fetch profile info on first message
      console.log(`Fetching profile for new igsid: ${igsid}`);
      const profile = await fetchInstagramProfile(igsid);
      console.log(`Profile fetched:`, profile);
      const { data: newConvo } = await supabase
        .from("instagram_conversations")
        .insert({ igsid, ...profile })
        .select()
        .single();
      conversation = newConvo;
    } else {
      // Refresh profile on every message to keep data up to date
      console.log(`Refreshing profile for existing igsid: ${igsid}`);
      const profile = await fetchInstagramProfile(igsid);
      console.log(`Profile fetched:`, profile);
      await supabase
        .from("instagram_conversations")
        .update(profile)
        .eq("id", conversation.id);
      conversation = { ...conversation, ...profile };
    }

    if (!conversation) {
      console.error("Conversation is null after attempt to fetch/create.");
      return Response.json({ error: "Failed to create conversation" }, { status: 500 });
    }

    // Store user message (ignore duplicates)
    const { error: insertError } = await supabase.from("instagram_messages").insert({
      conversation_id: conversation.id,
      role: "user",
      content: text,
      instagram_msg_id: instagramMsgId,
    });

    if (insertError?.code === "23505") {
      // Duplicate message, ignore
      return Response.json({ status: "duplicate" });
    }

    // Lead Detection (Email or Phone)
    const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
    const phoneRegex = /(\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
    
    if (emailRegex.test(text) || phoneRegex.test(text)) {
      await supabase.from("instagram_analytics_events").insert({
        conversation_id: conversation.id,
        event_type: "lead_captured",
        metadata: { 
          text_snippet: text.substring(0, 50),
          detected_at: new Date().toISOString()
        }
      });
      console.log(`Lead captured from ${igsid}!`);
    }

    // Update conversation timestamp
    await supabase
      .from("instagram_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation.id);

    // If mode is 'human', don't auto-reply
    if (conversation.mode === "human") {
      return Response.json({ status: "stored_for_human" });
    }

    // Fetch conversation history (last 6 messages for context)
    const { data: history } = await supabase
      .from("instagram_messages")
      .select("role, content")
      .eq("conversation_id", conversation.id)
      .order("created_at", { ascending: false })
      .limit(6);

    // Reverse to maintain chronological order for AI
    const chronologicalHistory = (history || []).reverse();

    // Get AI response
    console.log(`Getting AI response for convo ${conversation.id}...`);
    console.log(`History count: ${chronologicalHistory.length}`);
    if (chronologicalHistory.length > 0) {
      console.log(`Last message in history: ${chronologicalHistory[chronologicalHistory.length-1].content}`);
    }

    const aiResponse = await getAIResponse(
      chronologicalHistory.map((m) => ({
        role: m.role as "user" | "assistant",
        // Strip legacy [GPT-4o] debug prefix that was accidentally stored in old messages
        content: m.content.replace(/^\[GPT-4o\]\s*/i, "").trim(),
      }))
    );

    // Send response via Instagram
    await sendInstagramMessage(igsid, aiResponse.text);

    // Store AI response
    await supabase.from("instagram_messages").insert({
      conversation_id: conversation.id,
      role: "assistant",
      content: aiResponse.text,
    });

    // Update conversation timestamp again
    await supabase
      .from("instagram_conversations")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", conversation.id);

    console.log(`AI responded: ${aiResponse.text}`);
    return Response.json({ status: "replied" });
  } catch (error) {
    console.error("Webhook error details:", error);
    return Response.json({ status: "error", message: error instanceof Error ? error.message : "Unknown error" }, { status: 500 });
  }
}
