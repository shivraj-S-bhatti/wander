// API keys from .env (see .env.example). Never commit .env.
export const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
export const GOOGLE_DIRECTIONS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_KEY || GOOGLE_MAPS_API_KEY;
// On web, set EXPO_PUBLIC_PROXY_BASE=http://localhost:3001 and run `node scripts/proxy-server.mjs` to avoid CORS.
export const PROXY_BASE = process.env.EXPO_PUBLIC_PROXY_BASE || '';
// Backend API base for auth and other API calls. Optional; defaults to localhost:3000.
export const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';