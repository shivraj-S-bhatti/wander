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
   - `EXPO_PUBLIC_GOOGLE_MAPS_KEY` — enable **Maps JavaScript API** (web map) and **Directions API** (route/cost)
   - `EXPO_PUBLIC_GEMINI_KEY` — enable **Generative Language API** (recommendations)
3. Never commit `.env` (it’s in `.gitignore`).

## Run

```bash
# Web
npx expo start --web

# iOS (Xcode required)
npx expo start --ios
```

- **Feed** — Friend check-ins → tap for place detail.
- **Map** — Map (web: Google Maps JS; native: react-native-maps). Tap marker → place detail; “Get there” → route + cost.
- **Community** — Volunteer events; Join → civic points.
- **Profile** — Points, badges, prefs, “Tonight’s recommendations” (Gemini or fallback).

## Tech

Expo (managed) + TypeScript. Nav: React Navigation (tabs + stack). Map: web = Google Maps JS; native = react-native-maps. Directions + Gemini from env keys; fallbacks when keys missing. Data: hardcoded in `src/data/demo.ts`.
