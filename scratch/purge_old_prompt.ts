import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function purgeOldPrompt() {
  const { data, error } = await supabase
    .from("knowledge_base")
    .select("id, content")
    .ilike("content", "%DM assistant for Awais Sabir%");

  if (error) {
    console.error(error);
    return;
  }

  if (data && data.length > 0) {
    console.log(`Found ${data.length} old prompt entries in Knowledge Base. Purging...`);
    for (const item of data) {
      const { error: delError } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", item.id);
      if (delError) console.error(`Failed to delete ${item.id}:`, delError);
      else console.log(`Deleted ${item.id}`);
    }
  } else {
    console.log("No old prompt entries found in Knowledge Base.");
  }
}

purgeOldPrompt();
