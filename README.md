# Wander

**Wander is Strava for joymaxxing:** track where you go and who you’re with, share outings with friends, earn points for community involvement, and get AI-powered suggestions so you can maximize real-world joy instead of just miles.

📝 **[Blog: UI/UX & engineering deep dive](BLOG.md)** — screenshots, technical challenges, LLM context design, take-aways.

---

## What it is (Strava for joymaxxing)

Wander is a **social life-logging and discovery app** focused on **maximizing real-world happiness**. Like Strava tracks runs and cycling, Wander tracks **where you go, what you did, who you were with, and how it felt**—then turns that into streaks, civic points, and personalized recommendations.

- **Feed & friends** — See friends’ check-ins, volunteer events, and hangouts; tap into place details.
- **Map** — Explore places, tap markers for details, “Get there” for routes and transport cost.
- **Community** — Join volunteer events; earn civic points and badges (Local Supporter, Cleanup Crew, etc.).
- **Profile** — Points, badges, preferences, and **“Tonight’s recommendations”** (Gemini or fallback).
- **Plan** — AI-generated day plans (itineraries) from your vibe, budget, and hours outside.

So: **Strava for joymaxxing** = track and share life satisfaction, not just fitness; earn rewards for community; use AI to plan better outings.

**Read more:** [Blog — UI/UX and mobile dev deep dive](BLOG.md) (screenshots, technical challenges, context management for LLM).

---

## Development phases (31 Jan – 1 Feb)

Phases are framed by **what we achieved** (user-facing outcome), then the **tech** that got us there.

---

### Phase 1 — Profile gets “Tonight’s recommendations”

**Achievement:** Users see personalized place suggestions on Profile (vibe + budget), tap through to place detail; fallback recs when no API key.

**Tech:** `EXPO_PUBLIC_GEMINI_KEY` in config. Store: `friendSummary` from demo check-ins/places/users; `refreshRecs`, `loadingRecs`, `recsError`, `lastGeminiRecs`. ProfileLayout: vibe/budget preference chips + Recommendations block with PlaceCard → PlaceDetail.

---

### Phase 2 — “Plan my day” from the map

**Achievement:** From Explore, users open a modal, set location/vibe/budget/hours, hit Generate, and get AI itinerary options.

**Tech:** Store: `activePlan`, `openPlanModal`, persist plan in AsyncStorage. Gemini: `fetchItineraryOptions`, itinerary types. MapScreen: “Plan my day” FAB, modal (constraints form) → Generate → fetch options.

---

### Phase 3 — Dedicated “Your plan” and clear nav

**Achievement:** One place to see the current plan (steps list + End plan); plan presence visible in header (icon + pulse when active). Post is back as the center tab.

**Tech:** MakePost restored as center tab; Plan removed as tab. Itinerary as stack screen (“Your plan”). AppHeader: plan indicator (navigate icon; grey inactive, orange + pulse when active). ItineraryScreen: steps list + End plan.

---

### Phase 4 — Choose or reject itinerary options before committing

**Achievement:** After Generate, users see options in the same modal: cross out ones they don’t want, Accept one to set as active plan; Try again / Cancel. Works even when API fails (fallback options).

**Tech:** Modal shows option list (circle + name + X to cross out); Accept uses first non–crossed-out option as `activePlan`. Fallback options on API failure; Gemini response parsing hardened (envelope + direct `{ options }`).

---

### Phase 5 — Plan flow works on web

**Achievement:** Web users get the same plan flow: form → results → view plan; plan indicator appears in the header.

**Tech:** MapScreen.web: modal body branched on `generatedOptions` (results step). AppHeader: `centerElement={planHeaderButton}` so plan indicator renders on web.

---

### Phase 6 — One modal for plan: create, confirm, view

**Achievement:** Single entry point: FAB = “Plan your day” form; header (when plan active) = “Your plan” steps + End plan. No separate screens for create vs view.

**Tech:** One modal, three modes: **form** (constraints), **results** (cross-out + Accept), **viewPlan** (steps + End plan). FAB opens form; header with active plan opens viewPlan; content switches by mode.

---

### Phase 7 — Calmer plan indicator and less clutter

**Achievement:** Plan indicator is a simple pulsing icon (no glow box); “Plan my day” FAB is hidden when a plan is already active.

**Tech:** Icon-only pulse (arrow opacity animation); FAB visibility gated on `activePlan == null`.

---

## Tech stack (current)

Stack that supports the phases above. See **Architecture** for layout and **Prompts** for Gemini.

| Layer | Choices |
|-------|--------|
| **App** | Expo 52 (managed), React 18, TypeScript |
| **Config** | `app.config.js` — loads Maps + Gemini keys from env, injects into `extra` and iOS `config.googleMapsApiKey` |
| **Navigation** | React Navigation — native stack (auth, PlaceDetail, ProfileDetail, Leaderboard, **Itinerary**) + bottom tabs (Explore, Community, **Post**, Friends, Profile) |
| **State** | Redux Toolkit (auth token + hydration); React Context + `useReducer` (profile, plan, events, posts, Gemini recs) |
| **Persistence** | `@react-native-async-storage/async-storage` — profile, plan, posts (no backend for these yet) |
| **Map** | Web: Google Maps JavaScript API (`MapScreen.web.tsx`); native: `react-native-maps` (`MapScreen.tsx`) |
| **Directions** | Google Directions API (driving + transit); cost surfaced in UI |
| **AI** | Google Gemini 2.5 Flash — recommendations (Profile) + itinerary options (Map “Plan a route” / Itinerary screen); `responseMimeType: application/json` |
| **Backend** | Node + Express, MongoDB; JWT auth; routes: `/api/auth`, `/api/users`, `/api/friend-requests` |
| **Web CORS** | Optional proxy (`scripts/proxy-server.mjs`) — forwards Directions + Gemini so browser doesn’t hit CORS |

---

## Architecture

```
wander/
├── app.config.js             # Expo config: injects GOOGLE_MAPS_KEY, GEMINI_KEY from env into extra + iOS
├── app.json                  # Expo name, slug, version, orientation, scheme
├── App.tsx                   # Redux + StoreProvider, NavigationContainer; stack + tabs
├── src/
│   ├── config.ts             # Env: GOOGLE_MAPS_KEY, DIRECTIONS_KEY, GEMINI_KEY, PROXY_BASE, API_BASE
│   ├── theme.ts              # colors (accent #FF4136, white, black, borders, text)
│   ├── state/
│   │   ├── reduxStore.ts     # Auth slice (token, user)
│   │   ├── authSlice.ts
│   │   ├── AuthHydration.tsx # Restore token from storage → Redux
│   │   └── store.tsx         # App state: profile, plan, events, posts; reducers + context
│   ├── services/
│   │   ├── gemini.ts         # buildPrompt, buildItineraryPrompt; fetchRecommendations, fetchItineraryOptions
│   │   ├── auth.ts           # login/signup/me → backend API_BASE
│   │   ├── authStorage.ts    # token persistence
│   │   ├── directions.ts     # getDirections (proxy or direct)
│   │   ├── storage.ts        # load/save profile, plan, posts (AsyncStorage)
│   │   └── users.ts, friendRequests.ts
│   ├── data/demo.ts          # DEMO_PLACES, DEMO_USERS, DEMO_CHECKINS, DEMO_EVENTS, DEMO_RECS; types
│   ├── screens/
│   │   # Tabs: MapScreen, CommunityScreen, MakePostScreen, FriendsScreen, ProfileScreen
│   │   # Stack: PlaceDetail, ProfileDetail, Leaderboard, Itinerary ("Your plan")
│   │   # Platform: MapScreen.web.tsx, ItineraryScreen.web.tsx (web); MapScreen.tsx, ItineraryScreen.tsx (native)
│   │   # FeedScreen.tsx exists (feed UI) but is not in nav; CommunityScreen shows checkins + events
│   └── components/           # ActivityCard, AppHeader, CommunityFeedCard, EventCard, RouteSheet, etc.
├── backend/                  # Express, MongoDB, JWT
│   ├── routes/               # auth, users, friend-requests
│   ├── controllers/, middleware/auth.js, models/
│   └── db.js
└── scripts/
    ├── proxy-server.mjs      # GET /directions, POST /gemini (CORS-safe for web)
    └── test-apis.mjs         # Ping Directions, Maps, Gemini from .env
```

**Design choices:**

- **Dual state:** Auth in Redux (global, persisted); app data (profile, plan, events, posts) in Context so it stays in one place and is easy to persist to AsyncStorage.
- **Demo-first:** Places, events, check-ins, and fallback recs live in `src/data/demo.ts`; backend is for auth and friend requests only.
- **Gemini JSON:** Both prompts ask for JSON only; `responseMimeType: 'application/json'` and strip markdown so parsing is reliable.
- **Web vs native:** Same codebase; platform-specific screens (e.g. `MapScreen.web.tsx`, `ItineraryScreen.web.tsx`) for map and itinerary on web; native uses `MapScreen.tsx` / `ItineraryScreen.tsx`. Web uses Google Maps JS + proxy for Directions/Gemini; native can call Directions/Gemini directly (no proxy).
- **Itinerary flow:** Itinerary is a **stack screen** (“Your plan”), not a tab. Map screen can generate itinerary options (Gemini); user can open Itinerary from navigation to view/use the plan.

---

## Prompts used (Gemini)

All prompts are in `src/services/gemini.ts`. They are **user-only** (no system message); the role is described inside the prompt text.

### 1. Recommendations (“Tonight’s recommendations”)

**Function:** `buildPrompt(memory, friendSummary, placesSummary)`  
**Used by:** `fetchRecommendations()` → Profile “Tonight’s recommendations”.

**Purpose:** Suggest up to 3 places for “tonight” using the user’s preference summary, recent friend activity, and a candidate list of places.

**Prompt text (template):**

```text
You are a local recommendations assistant. Given the user's preferences and recent friend activity, suggest up to 3 places for tonight.

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
Use the place ids from the candidate list. suggestedTime should be like "8:00 PM" or "6:30 PM".
```

**Output shape:** `{ recs: [{ placeId, reason, confidence, suggestedTime }] }`.

---

### 2. Itinerary options (day plan)

**Function:** `buildItineraryPrompt(constraints, placesSummary)`  
**Used by:** `fetchItineraryOptions()` → Plan / Itinerary flow.

**Purpose:** Suggest 1–3 itinerary options, each an ordered list of 2–4 place IDs from the candidate list, given vibe/budget/hours/start.

**Prompt text (template):**

```text
You are a local day-planning assistant. Given the user's constraints, suggest 1–3 itinerary options: each is an ordered list of place ids (2–4 stops) from the candidate list.

Constraints:
- Starting location: ${constraints.startLocation || 'any'}
- Vibe: ${constraints.vibe || 'any'}
- Budget: ${constraints.budget || 'any'}
- Hours outside: ${constraints.hoursOutside ?? 3}

Candidate places (id, name, category, tags, priceTier):
${placesSummary}

Respond with ONLY a valid JSON object, no markdown or extra text, in this exact shape:
{"options":[{"name":"Coffee then park","placeIds":["p_1","p_3"]},{"name":"Bar hop","placeIds":["p_2","p_4"]}]}
Use only place ids from the candidate list. Each option should have 2–4 placeIds in a logical order (e.g. morning cafe, then park, then dinner).
```

**Output shape:** `{ options: [{ name?, placeIds: string[] }] }`.

---

**Gemini config (shared):** `temperature: 0.3`, `maxOutputTokens: 1024`, `responseMimeType: 'application/json'`, `thinkingConfig: { thinkingBudget: 0 }`. Model: `gemini-2.5-flash`.

---

## Setup (collaborators)

```bash
git clone https://github.com/shivraj-S-bhatti/wander.git
cd wander
npm install
```

**API keys (optional — app works with fallbacks):**

1. Copy env template: `cp .env.example .env`
2. Add your keys to `.env` (from [Google Cloud Console](https://console.cloud.google.com/)):
   - `EXPO_PUBLIC_GOOGLE_MAPS_KEY` — enable **Maps JavaScript API** (web map)
   - `EXPO_PUBLIC_GOOGLE_DIRECTIONS_KEY` — enable **Directions API** (route/cost)
   - `EXPO_PUBLIC_GEMINI_KEY` — enable **Generative Language API** (recommendations)
   - For the backend (auth/user APIs): `MONGO_URI` and `JWT_SECRET` (see `.env.example`)
3. **Web only:** The browser blocks Directions and Gemini (CORS). Run the proxy, then set `EXPO_PUBLIC_PROXY_BASE=http://localhost:3001` in `.env` and restart Expo:
   ```bash
   node scripts/proxy-server.mjs
   ```
4. Never commit `.env` (it’s in `.gitignore`).

## Run

**Start the backend** (auth and user APIs use MongoDB; backend reads `MONGO_URI` and `JWT_SECRET` from the root `.env`):

```bash
cd backend
npm install
npm run dev
```

The API runs at `http://localhost:3000` (override with `PORT` in `.env`). Keep this running in a separate terminal.

**Start the app:**

```bash
# Web
npx expo start --web

# iOS (Xcode required)
npx expo start --ios
```

**Run on iOS:** Use the same `.env` (no need for `EXPO_PUBLIC_PROXY_BASE` on iOS). Directions (“Get there”) and Gemini (“Tonight’s recommendations”) work directly — no proxy. For Google Map tiles on device (instead of Apple Maps in Expo Go), use a development build and keep `EXPO_PUBLIC_GOOGLE_MAPS_KEY` set.

- **Explore** — Map (web: Google Maps JS; native: react-native-maps). Tap marker → place detail; “Get there” → route + cost; “Plan a route” → Gemini itinerary options.
- **Community** — Checkins feed + volunteer events; Join → civic points; Leaderboard.
- **Post** — Make a post (what, who with, rating, experience, tags).
- **Friends** — Friends list; tap → profile detail.
- **Profile** — Points, badges, prefs, “Tonight’s recommendations” (Gemini or fallback). Navigate to “Your plan” (Itinerary stack screen) to view/use a saved plan.

**Test API keys:** `node scripts/test-apis.mjs` (reads `.env`, pings Directions, Maps/Geocoding, Gemini).
