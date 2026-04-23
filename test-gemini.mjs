// Quick Gemini API key tester — run with: node test-gemini.mjs
import { readFileSync } from "fs";
import { GoogleGenerativeAI } from "@google/generative-ai";

// Read GEMINI_API_KEY from .env file
let apiKey = "";
try {
  const envContent = readFileSync(".env", "utf8");
  const match = envContent.match(/^GEMINI_API_KEY=(.+)$/m);
  apiKey = match?.[1]?.trim() || "";
} catch (e) {
  console.error("❌ Could not read .env file:", e.message);
  process.exit(1);
}

if (!apiKey || apiKey === "PASTE_YOUR_GEMINI_API_KEY_HERE") {
  console.error("❌ GEMINI_API_KEY is not set in .env file!");
  console.error("   Open .env and replace PASTE_YOUR_GEMINI_API_KEY_HERE with your actual key.");
  console.error("   Get a free key at: https://aistudio.google.com/apikey");
  process.exit(1);
}

console.log(`✅ API key found: ${apiKey.substring(0, 8)}...${apiKey.slice(-4)}`);
console.log("🔄 Testing gemini-2.5-flash model...\n");

const genAI = new GoogleGenerativeAI(apiKey);

try {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 80,
    },
  });

  const result = await model.generateContent("Say hello in exactly one short sentence.");
  const text = result.response.text();
  console.log("✅ Gemini 2.5 Flash works!");
  console.log(`   Response: "${text.trim()}"\n`);
  console.log("🎉 Everything is working. Your API key is valid.");
} catch (err) {
  console.error("❌ Gemini API error:", err.message || err);
  if (err.message?.includes("API_KEY_INVALID")) {
    console.error("   → Your API key is invalid. Generate a new one at https://aistudio.google.com/apikey");
  } else if (err.message?.includes("PERMISSION_DENIED")) {
    console.error("   → API key doesn't have Gemini access. Make sure it's enabled in Google AI Studio.");
  } else if (err.message?.includes("not found")) {
    console.error("   → Model name not found. Falling back to gemini-2.0-flash...");
    
    // Try fallback model
    try {
      const model2 = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result2 = await model2.generateContent("Say hello in one sentence.");
      console.log("✅ gemini-2.0-flash works as fallback!");
      console.log(`   Response: "${result2.response.text().trim()}"`);
    } catch (e2) {
      console.error("❌ Fallback also failed:", e2.message);
    }
  }
  process.exit(1);
}
