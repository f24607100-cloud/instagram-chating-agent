import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (body.mode && !["agent", "human"].includes(body.mode)) {
    return Response.json({ error: "Invalid mode" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("instagram_conversations")
    .update({ mode: body.mode })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (body.mode === "human") {
    // Log handoff event
    await supabase.from("instagram_analytics_events").insert({
      conversation_id: id,
      event_type: "handoff_to_human",
      metadata: { source: "dashboard_toggle" }
    });
  }

  return Response.json(data);
}
