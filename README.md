# Wander

Beli-like app: friends’ activities, places, map, transport cost, Gemini recs + memory, civic points, community events.

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

- **Feed** — Friend check-ins → tap for place detail.
- **Map** — Map (web: Google Maps JS; native: react-native-maps). Tap marker → place detail; “Get there” → route + cost.
- **Community** — Volunteer events; Join → civic points.
- **Profile** — Points, badges, prefs, “Tonight’s recommendations” (Gemini or fallback).

**Test API keys:** `node scripts/test-apis.mjs` (reads `.env`, pings Directions, Maps/Geocoding, Gemini).

## Tech

Expo (managed) + TypeScript. Nav: React Navigation (tabs + stack). Map: web = Google Maps JS; native = react-native-maps. Directions + Gemini from env keys; fallbacks when keys missing. Data: hardcoded in `src/data/demo.ts`.
