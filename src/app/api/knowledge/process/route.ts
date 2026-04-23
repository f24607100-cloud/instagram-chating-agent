import { NextResponse } from "next/server";
import { addKnowledge } from "@/lib/knowledge";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    let extractedText = "";
    const filename = file.name;
    const extension = filename.split(".").pop()?.toLowerCase();

    if (extension === "pdf") {
      // Use dynamic require to avoid ESM build-time default export errors
      const pdf = require("pdf-parse");
      const data = await pdf(buffer);
      extractedText = data.text;
    } else if (extension === "docx") {
      const mammoth = require("mammoth");
      const result = await mammoth.extractRawText({ buffer });
      extractedText = result.value;
    } else if (extension === "txt") {
      extractedText = buffer.toString("utf8");
    } else {
      return NextResponse.json({ error: "Unsupported file format" }, { status: 400 });
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "No text could be extracted from this file" }, { status: 400 });
    }

    const chunks = extractedText.split(/\n\s*\n/).filter(c => c.trim().length > 50);
    
    if (chunks.length > 0) {
        for (const chunk of chunks) {
            if (chunk.trim().length < 20) continue;
            await addKnowledge(chunk.trim(), { filename, source: 'file_upload' });
        }
    } else {
        await addKnowledge(extractedText.trim(), { filename, source: 'file_upload' });
    }

    return NextResponse.json({ success: true, count: chunks.length || 1 });
  } catch (err: any) {
    console.error("Error processing file upload:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
