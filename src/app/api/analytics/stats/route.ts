import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET() {
  try {
    // 1. Core KPIs
    const { count: totalMessages } = await supabase
      .from("instagram_messages")
      .select("*", { count: "exact", head: true });

    const { count: leadsCaptured } = await supabase
      .from("instagram_analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "lead_captured");

    const { count: totalHandoffs } = await supabase
      .from("instagram_analytics_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "handoff_to_human");

    const { count: totalConvos } = await supabase
      .from("instagram_conversations")
      .select("*", { count: "exact", head: true });

    // 2. Chart Data: Messages over the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const { data: recentMessages } = await supabase
      .from("instagram_messages")
      .select("created_at")
      .gte("created_at", sevenDaysAgo.toISOString());

    const dailyStats = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = recentMessages?.filter(m => m.created_at.startsWith(dateStr)).length || 0;
      return { name: dateStr, messages: count };
    }).reverse();

    // 3. Client Breakdown: Top 5 most active conversations
    const { data: topClients } = await supabase
      .from("instagram_conversations")
      .select("name, username, id");

    const clientActivity = await Promise.all((topClients || []).map(async (client) => {
        const { count } = await supabase
            .from("instagram_messages")
            .select("*", { count: "exact", head: true })
            .eq("conversation_id", client.id);
        return { name: client.name || client.username, value: count || 0 };
    }));

    const sortedClients = clientActivity
        .sort((a, b) => b.value - a.value)
        .slice(0, 5);

    const handoffRate = totalConvos && totalConvos > 0 
      ? Math.round(((totalHandoffs || 0) / totalConvos) * 100) 
      : 0;

    return NextResponse.json({
      totalMessages: totalMessages || 0,
      leadsCaptured: leadsCaptured || 0,
      handoffRate: `${handoffRate}%`,
      totalHandoffs: totalHandoffs || 0,
      totalConversations: totalConvos || 0,
      dailyStats,
      topClients: sortedClients
    });
  } catch (err: any) {
    console.error("Analytics Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
