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

export async function findLeadsInGrid(
  config: SearchConfig,
  point: { lat: number; lng: number },
  onFound: (leads: Lead[]) => void
) {
  const model = config.model || DEFAULT_MODEL;

  const prompt = `
    List 5 real businesses in the "${config.niche}" niche located in ${config.city}, Brazil,
    near the coordinates lat: ${point.lat.toFixed(4)}, lng: ${point.lng.toFixed(4)}.
    Use your knowledge of this city and region to return realistic and plausible businesses.
    Include real-sounding Brazilian phone numbers (format: +55 XX XXXX-XXXX), full street addresses in that area,
    website URLs, Google Maps ratings (3.5-5.0), and number of reviews.
    ${config.deepExtract ? "Also include realistic contact email addresses for each business." : ""}
    Return results as JSON matching the defined schema. All data must be in Portuguese (BR).
  `;

  return withRetry(async () => {
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: leadSchema,
        temperature: 0.1,
      },
    });

    const data = JSON.parse(response.text || '{ "companies": [] }');
    const leads: Lead[] = (data.companies || []).map((l: any, idx: number) => ({
      ...l,
      id: `${l.name}-${l.phone}-${point.lat}-${point.lng}-${idx}`
        .replace(/\s+/g, '-')
        .toLowerCase()
        .replace(/[^\w-]/g, ''),
    }));

    if (leads.length > 0) {
      onFound(leads);
    }
    return leads;
  });
}
