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

export type ItineraryConstraints = {
  startLocation?: string;
  vibe?: string;
  budget?: string;
  hoursOutside?: number;
};

export type ItineraryOption = {
  placeIds: string[];
  name?: string;
  priceBreakdown?: string;
};

export type ItineraryOptionsResponse = {
  options: ItineraryOption[];
};

const DEMO_ITINERARY_OPTIONS: ItineraryOption[] = [
  { name: 'Demo route', placeIds: ['p_1', 'p_3', 'p_4'] },
];

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

function buildItineraryPrompt(constraints: ItineraryConstraints, placesSummary: string): string {
  return `You are a local day-planning assistant. Given the user's constraints, suggest 1–3 itinerary options: each is an ordered list of place ids (2–4 stops) from the candidate list. For each option, add a brief priceBreakdown estimating total cost from priceTier and typical meal/activity costs (e.g. "~$18 total: coffee $4, park free, lunch ~$14"). Transit can be omitted or noted as "transit ~$3".

Constraints:
- Starting location: ${constraints.startLocation || 'any'}
- Vibe: ${constraints.vibe || 'any'}
- Budget: ${constraints.budget || 'any'}
- Hours outside: ${constraints.hoursOutside ?? 3}

Candidate places (id, name, category, tags, priceTier):
${placesSummary}

Respond with ONLY a valid JSON object, no markdown or extra text, in this exact shape:
{"options":[{"name":"Coffee then park","placeIds":["p_1","p_3"],"priceBreakdown":"~$15 total: coffee $4, park free, lunch ~$11"},{"name":"Bar hop","placeIds":["p_2","p_4"],"priceBreakdown":"~$35 total: drinks ~$15, dinner ~$20"}]}
Use only place ids from the candidate list. Each option should have 2–4 placeIds in a logical order (e.g. morning cafe, then park, then dinner). Include priceBreakdown for each option.`;
}

export async function fetchItineraryOptions(
  apiKey: string,
  constraints: ItineraryConstraints,
  placesSummary: string
): Promise<ItineraryOptionsResponse> {
  if (!apiKey) {
    return { options: DEMO_ITINERARY_OPTIONS };
  }
  const prompt = buildItineraryPrompt(constraints, placesSummary);
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

    // Direct body: proxy or client returns { options: [...] }
    if (Array.isArray(data?.options) && data.options.length > 0) {
      return data as ItineraryOptionsResponse;
    }

    // Raw Gemini envelope: extract text from candidates
    const text =
      data.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || '';
    if (!text) throw new Error('Empty Gemini response');
    const cleaned = text.replace(/^```json?\s*|\s*```$/g, '').trim();
    const parsed = JSON.parse(cleaned) as ItineraryOptionsResponse;
    if (!Array.isArray(parsed?.options) || parsed.options.length === 0) {
      return { options: DEMO_ITINERARY_OPTIONS };
    }
    return parsed;
  } catch {
    return { options: DEMO_ITINERARY_OPTIONS };
  }
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
