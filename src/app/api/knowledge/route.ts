import { NextResponse } from "next/server";
import { addKnowledge } from "@/lib/knowledge";

export async function POST(req: Request) {
  try {
    const { content, metadata } = await req.json();
    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    await addKnowledge(content, metadata || {});
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("Error adding knowledge:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// Optional: Add a GET method to list knowledge (without embeddings)
import { createClient } from "@supabase/supabase-js";
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("knowledge_base")
      .select("id, content, metadata, created_at")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    const { error } = await supabase.from("knowledge_base").delete().eq("id", id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
