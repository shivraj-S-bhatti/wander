#!/usr/bin/env node
/**
 * Local proxy for Directions + Gemini to avoid CORS when testing web on localhost.
 * Run: node scripts/proxy-server.mjs
 * Then set EXPO_PUBLIC_PROXY_BASE=http://localhost:3001 and restart Expo.
 */
import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

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

const env = loadEnv();
const DIRECTIONS_KEY = env.EXPO_PUBLIC_GOOGLE_DIRECTIONS_KEY || env.EXPO_PUBLIC_GOOGLE_MAPS_KEY || '';
const GEMINI_KEY = env.EXPO_PUBLIC_GEMINI_KEY || '';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function send(res, status, body, contentType = 'application/json') {
  res.writeHead(status, { ...CORS, 'Content-Type': contentType });
  res.end(typeof body === 'string' ? body : JSON.stringify(body));
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    send(res, 204, '');
    return;
  }

  const url = new URL(req.url || '', `http://${req.headers.host}`);
  const path = url.pathname;

  // GET /directions?origin=lat,lng&destination=lat,lng
  if (path === '/directions' && req.method === 'GET') {
    const origin = url.searchParams.get('origin');
    const destination = url.searchParams.get('destination');
    if (!origin || !destination || !DIRECTIONS_KEY) {
      send(res, 400, { error: 'Missing origin, destination, or key' });
      return;
    }
    try {
      const drivingUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=driving&key=${DIRECTIONS_KEY}`;
      const transitUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin}&destination=${destination}&mode=transit&key=${DIRECTIONS_KEY}`;
      const [drivingRes, transitRes] = await Promise.all([fetch(drivingUrl), fetch(transitUrl)]);
      const drivingJson = await drivingRes.json();
      const transitJson = await transitRes.json();
      send(res, 200, { driving: drivingJson, transit: transitJson });
    } catch (e) {
      send(res, 502, { error: String(e.message) });
    }
    return;
  }

  // POST /gemini — body: { contents, generationConfig }
  if (path === '/gemini' && req.method === 'POST') {
    if (!GEMINI_KEY) {
      send(res, 400, { error: 'No Gemini key' });
      return;
    }
    let body = '';
    for await (const chunk of req) body += chunk;
    try {
      const parsed = JSON.parse(body);
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(parsed),
        }
      );
      const data = await geminiRes.json();
      send(res, geminiRes.status, data);
    } catch (e) {
      send(res, 502, { error: String(e.message) });
    }
    return;
  }

  send(res, 404, { error: 'Not found' });
});

const PORT = 3001;
server.listen(PORT, () => {
  console.log(`Proxy running at http://localhost:${PORT}`);
  console.log('Set EXPO_PUBLIC_PROXY_BASE=http://localhost:3001 in .env and restart Expo for web.');
});
