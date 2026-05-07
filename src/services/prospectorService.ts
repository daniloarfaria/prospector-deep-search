/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from "@google/genai";
import { Lead, SearchConfig } from "../types";

const DEFAULT_MODEL = "gemini-3-flash-preview";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 3, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    if (error?.status === 429 && retries > 0) {
      console.warn(`Quota exceeded. Retrying in ${delay / 1000}s... (${retries} attempts left)`);
      await sleep(delay);
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

const leadSchema = {
  type: Type.OBJECT,
  properties: {
    companies: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          phone: { type: Type.STRING },
          address: { type: Type.STRING },
          website: { type: Type.STRING },
          rating: { type: Type.NUMBER },
          reviews: { type: Type.INTEGER },
          category: { type: Type.STRING },
          emails: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["name", "phone", "address"]
      }
    }
  },
  required: ["companies"]
};

export async function geocodeCity(city: string): Promise<{ lat: number; lng: number }> {
  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: `Return the geographic center coordinates (latitude and longitude) of: ${city}. Return only valid JSON: { "lat": number, "lng": number }`,
      config: {
        responseMimeType: "application/json",
      },
    });

    const result = JSON.parse(response.text || "{}");
    return {
      lat: result.lat || -23.5505,
      lng: result.lng || -46.6333,
    };
  });
}

function normalizeId(name: string, phone: string): string {
  const n = name.toLowerCase()
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]/g, '');
  const p = phone.replace(/\D/g, '');
  return `${n}-${p}`;
}

export async function findLeadsInGrid(
  config: SearchConfig,
  point: { lat: number; lng: number },
  seenNames: string[],
  onFound: (leads: Lead[]) => void
) {
  const model = config.model || DEFAULT_MODEL;

  const exclusion = seenNames.length > 0
    ? `\nDo NOT return any of these already-found businesses: ${seenNames.slice(0, 30).join(', ')}.`
    : '';

  const prompt = `
    List 10 real, existing businesses in the "${config.niche}" niche located in ${config.city}, Brazil,
    near the coordinates lat: ${point.lat.toFixed(4)}, lng: ${point.lng.toFixed(4)}.
    Only include businesses you have actual knowledge of — real names, real addresses, real phone numbers.
    Do NOT invent, fabricate, or guess any field. If you do not know the website, email, or social media of a business, leave that field empty or omit it entirely.
    Include Google Maps ratings (3.5-5.0) and review counts only if known.
    ${config.deepExtract ? "Include email addresses only if you have actual confirmed knowledge of them. Do not generate or guess emails." : ""}
    Prioritize businesses near the given coordinates, not just the most famous ones in the city.${exclusion}
    Return results as JSON matching the defined schema. All data must be in Portuguese (BR).
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: leadSchema,
        temperature: 0.3,
      },
    });

    const data = JSON.parse(response.text || '{ "companies": [] }');
    const leads: Lead[] = (data.companies || []).map((l: any) => ({
      ...l,
      website: l.website || "",
      emails: l.emails?.filter((e: string) => e && e.includes("@")) ?? [],
      id: normalizeId(l.name ?? '', l.phone ?? ''),
    }));

    if (leads.length > 0) {
      onFound(leads);
    }
    return leads;
  });
}
