import { createClient } from "@supabase/supabase-js";
import OpenAI from "openai";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENROUTER_API_KEY,
  baseURL: process.env.OPENAI_API_KEY ? undefined : "https://openrouter.ai/api/v1",
});

// We'll use this model for embeddings. If using OpenRouter, we hope they support it or a compatible one.
// If the user has an OpenAI key, it works perfectly.
const EMBEDDING_MODEL = "text-embedding-3-small";

export async function generateEmbedding(text: string) {
  const response = await openai.embeddings.create({
    model: EMBEDDING_MODEL,
    input: text.replace(/\n/g, " "),
  });
  return response.data[0].embedding;
}

export async function addKnowledge(content: string, metadata: any = {}) {
  const embedding = await generateEmbedding(content);
  
  const { error } = await supabase.from("knowledge_base").insert({
    content,
    metadata,
    embedding,
  });

  if (error) throw error;
}

export async function searchKnowledge(query: string, limit: number = 3) {
  const embedding = await generateEmbedding(query);

  const { data, error } = await supabase.rpc("match_knowledge", {
    query_embedding: embedding,
    match_threshold: 0.5,
    match_count: limit,
  });

  if (error) throw error;
  return data as { content: string; metadata: any; similarity: number }[];
}
