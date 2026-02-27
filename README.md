# Wander — Strava Meets Beli for Social Discovery

![Wander demo](wander.gif)

Wander is a social discovery app in the spirit of Strava + Beli: track where you go, discover what to do next, and coordinate real-world plans with friends through short quests.

[Blog: UI/UX + engineering deep dive](BLOG.md)

## Mission

The product mission is to reduce social isolation by helping people build real connections through shared, real-world moments.

## Product Framing (Gamified Quests)

Wander runs a participation loop:

- Discover places and activities on map/feed
- Coordinate a quest (AI-assisted plans based on vibe, budget, and time)
- Execute in real life (check-ins, meetup flow, outings)
- Reinforce with points, badges, streaks, and leaderboard rank

Retention is tied to participation, not notifications.

## Product Focus: Quest Participation Optimization

This codebase is built around realtime social coordination quality:

- Keep users in the quest flow from intent to completion
- Prevent state glitches across planning and execution states
- Minimize drop-off with low-latency, structured AI outputs
- Tie product behavior to measurable outcomes (completion and retention)

## Technical Bits (From the Blog)

- Compact LLM context for speed and reliability: summarized user memory, capped friend activity, and candidate places by ID (not raw history)
- Strict JSON outputs from Gemini for parse-safe recommendations and itinerary options
- State-driven quest UX: one plan surface with `form -> results -> view` modes
- Fallback-first behavior when keys or model calls fail, so the app remains usable
- Split state architecture: Redux for auth; Context + reducer for product state with AsyncStorage persistence

## Stack

- Expo 52, React 18, React Native, TypeScript
- React Navigation (stack + tabs)
- Node + Express + MongoDB (auth + social APIs)
- Google Maps + Directions + Gemini 2.5 Flash

## Quick Start

```bash
git clone https://github.com/shivraj-S-bhatti/wander.git
cd wander
npm install
```

1. Copy env template: `cp .env.example .env`
2. Add keys (optional but recommended):
- `EXPO_PUBLIC_GOOGLE_MAPS_KEY`
- `EXPO_PUBLIC_GOOGLE_DIRECTIONS_KEY`
- `EXPO_PUBLIC_GEMINI_KEY`
- `MONGO_URI`
- `JWT_SECRET`

3. Run backend:

```bash
cd backend
npm install
npm run dev
```

4. Run app:

```bash
# Web
npx expo start --web

# iOS
npx expo start --ios
```

5. Web-only proxy for CORS-safe Directions/Gemini:

```bash
node scripts/proxy-server.mjs
```

Set `EXPO_PUBLIC_PROXY_BASE=http://localhost:3001` in `.env` for web.
