#!/usr/bin/env node
/**
 * Test ping for Maps key, Directions key, and Gemini key.
 * Reads .env from project root. Run: node scripts/test-apis.mjs
 */
import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function loadEnv() {
  const path = join(root, '.env');
  if (!existsSync(path)) return {};
  const raw = readFileSync(path, 'utf8');
  const out = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (m) out[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
  }
  return out;
}

async function pingDirections(key) {
  if (!key) return { ok: false, error: 'No key' };
  const url = `https://maps.googleapis.com/maps/api/directions/json?origin=37.7849,-122.4094&destination=37.7865,-122.408&mode=driving&key=${key}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status === 'OK' && json.routes?.[0]?.legs?.[0]) return { ok: true };
  return { ok: false, error: json.status || res.status, message: json.error_message };
}

async function pingMaps(key) {
  if (!key) return { ok: false, error: 'No key' };
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=San+Francisco&key=${key}`;
  const res = await fetch(url);
  const json = await res.json();
  if (json.status === 'OK' && Array.isArray(json.results) && json.results.length) return { ok: true };
  return { ok: false, error: json.status || res.status, message: json.error_message };
}

async function pingGemini(key) {
  if (!key) return { ok: false, error: 'No key' };
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${key}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ role: 'user', parts: [{ text: 'Reply with exactly: OK' }] }],
      generationConfig: { maxOutputTokens: 10 },
    }),
  });
  const json = await res.json();
  if (res.ok && json.candidates?.[0]?.content?.parts?.[0]?.text) return { ok: true };
  const err = json.error?.message || json.error?.code || res.status;
  return { ok: false, error: err };
}

async function main() {
  const env = loadEnv();
  const mapsKey = env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
  const directionsKey = env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_KEY || env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
  const geminiKey = env.EXPO_PUBLIC_GEMINI_KEY || '';

  console.log('Testing API keys (from .env)\n');

  console.log('1. Directions API (EXPO_PUBLIC_GOOGLE_DIRECTIONS_KEY):');
  const d = await pingDirections(directionsKey);
  console.log(d.ok ? '   OK' : `   FAIL: ${d.error}${d.message ? ' — ' + d.message : ''}`);

  console.log('\n2. Maps / Geocoding (EXPO_PUBLIC_GOOGLE_MAPS_KEY):');
  const m = await pingMaps(mapsKey);
  console.log(m.ok ? '   OK' : `   FAIL: ${m.error}${m.message ? ' — ' + m.message : ''}`);

  console.log('\n3. Gemini (EXPO_PUBLIC_GEMINI_KEY):');
  const g = await pingGemini(geminiKey);
  console.log(g.ok ? '   OK' : `   FAIL: ${g.error}`);

  console.log('');
  process.exit(d.ok && m.ok && g.ok ? 0 : 1);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
