import { GoogleGenAI } from "@google/genai";
import { readFileSync } from "fs";

const env = readFileSync(".env", "utf8");
const key = env.match(/GEMINI_API_KEY="([^"]+)"/)?.[1];
console.log("API Key:", key ? key.substring(0, 15) + "..." : "NOT FOUND");

const ai = new GoogleGenAI({ apiKey: key });

// Teste 1: geocode simples sem googleSearch
console.log("\n[1] Testando modelo gemini-2.0-flash (sem tools)...");
try {
  const r = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: 'Return JSON only: {"lat": -23.5505, "lng": -46.6333}',
    config: { responseMimeType: "application/json" }
  });
  console.log("OK:", r.text?.substring(0, 100));
} catch (e) {
  console.error("ERRO:", e.message);
}

// Teste 2: com googleSearch
console.log("\n[2] Testando com googleSearch tool...");
try {
  const r = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: "Find 1 real dentist in São Paulo, Brazil. Return JSON: {\"companies\":[{\"name\":\"string\",\"phone\":\"string\",\"address\":\"string\"}]}",
    config: {
      responseMimeType: "application/json",
      tools: [{ googleSearch: {} }],
      temperature: 0.1,
    }
  });
  console.log("OK:", r.text?.substring(0, 300));
} catch (e) {
  console.error("ERRO:", e.message);
}
