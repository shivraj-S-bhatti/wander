// Gemini API — call from app (demo) or via proxy on web to avoid CORS
import { PROXY_BASE } from '../config';

export type MemorySummary = {
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  lastChosenPlaceIds: string[];
  vibe?: string;
  budget?: string;
};

export type GeminiRecItem = {
  placeId: string;
  reason: string;
  confidence: number;
  suggestedTime: string;
};

export type GeminiRecsResponse = {
  recs: GeminiRecItem[];
};

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

function buildPrompt(memory: MemorySummary, friendSummary: string, placesSummary: string): string {
  return `You are a local recommendations assistant. Given the user's preferences and recent friend activity, suggest up to 3 places for tonight.

User memory summary:
- Categories they like: ${JSON.stringify(memory.categoryCounts)}
- Tags they like: ${JSON.stringify(memory.tagCounts)}
- Recent places: ${memory.lastChosenPlaceIds.slice(0, 5).join(', ')}
- Vibe: ${memory.vibe || 'any'}
- Budget: ${memory.budget || 'any'}

Recent friend activity:
${friendSummary}

Candidate places (id, name, category, tags, priceTier):
${placesSummary}

Respond with ONLY a valid JSON object, no markdown or extra text, in this exact shape:
{"recs":[{"placeId":"p_1","reason":"...","confidence":0.9,"suggestedTime":"8:00 PM"}]}
Use the place ids from the candidate list. suggestedTime should be like "8:00 PM" or "6:30 PM".`;
}

export async function fetchRecommendations(
  apiKey: string,
  memory: MemorySummary,
  friendSummary: string,
  placesSummary: string
): Promise<GeminiRecsResponse> {
  const prompt = buildPrompt(memory, friendSummary, placesSummary);
  const body = {
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
      responseMimeType: 'application/json',
      thinkingConfig: { thinkingBudget: 0 },
    },
  };

  const url = PROXY_BASE ? `${PROXY_BASE}/gemini` : `${GEMINI_BASE}?key=${apiKey}`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) throw new Error(`Gemini ${res.status}`);
    const data = await res.json();
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!text) throw new Error('Empty Gemini response');
    const cleaned = text.replace(/^```json?\s*|\s*```$/g, '').trim();
    return JSON.parse(cleaned) as GeminiRecsResponse;
  } catch (e) {
    throw e;
  }
}
