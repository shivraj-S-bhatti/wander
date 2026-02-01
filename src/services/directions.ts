import { haversineMeters } from '../utils/geo';
import { rideshareCostMeters, TRANSIT_FIXED_COST } from '../utils/pricing';
import { PROXY_BASE } from '../config';

const GOOGLE_DIRECTIONS_BASE = 'https://maps.googleapis.com/maps/api/directions/json';

export type RouteLeg = {
  distanceMeters: number;
  durationSeconds: number;
  costRideshare?: number;
  costTransit?: number;
};

export type DirectionStep = {
  type: 'walk' | 'transit';
  instruction: string;
  durationMinutes?: number;
  lineShortName?: string;
  lineName?: string;
  vehicleType?: string;
  departureStop?: string;
  arrivalStop?: string;
  numStops?: number;
};

export type DirectionsResult = {
  driving?: RouteLeg;
  transit?: RouteLeg;
  transitSteps?: DirectionStep[];
  fallback?: boolean;
};

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

type GoogleStep = {
  travel_mode?: string;
  html_instructions?: string;
  duration?: { value: number };
  transit_details?: {
    line?: { short_name?: string; name?: string; vehicle?: { name?: string } };
    departure_stop?: { name?: string };
    arrival_stop?: { name?: string };
    num_stops?: number;
  };
};

function parseStep(step: GoogleStep): DirectionStep | null {
  if (!step?.duration?.value) return null;
  const durationMinutes = Math.round(step.duration.value / 60);
  const mode = step.travel_mode === 'TRANSIT' ? 'transit' : 'walk';
  const td = step.transit_details;

  if (mode === 'transit' && td?.line) {
    const lineShort = td.line.short_name ?? td.line.name ?? '';
    const vehicle = td.line.vehicle?.name ?? 'Transit';
    const arrival = td.arrival_stop?.name ?? '';
    const instruction = lineShort
      ? `Take ${vehicle} ${lineShort}${arrival ? ` to ${arrival}` : ''}`
      : (step.html_instructions ? stripHtml(step.html_instructions) : `Take ${vehicle}`);
    return {
      type: 'transit',
      instruction,
      durationMinutes,
      lineShortName: td.line.short_name,
      lineName: td.line.name,
      vehicleType: td.line.vehicle?.name,
      departureStop: td.departure_stop?.name,
      arrivalStop: td.arrival_stop?.name,
      numStops: td.num_stops,
    };
  }

  const instruction = step.html_instructions ? stripHtml(step.html_instructions) : 'Walk';
  return { type: 'walk', instruction, durationMinutes };
}

function parseTransitSteps(transitJson: { routes?: { legs?: { steps?: GoogleStep[] }[] }[] }): DirectionStep[] {
  const steps = transitJson?.routes?.[0]?.legs?.[0]?.steps;
  if (!Array.isArray(steps) || steps.length === 0) return [];
  const parsed: DirectionStep[] = [];
  for (const s of steps) {
    const step = parseStep(s);
    if (step) parsed.push(step);
  }
  return parsed;
}

function parseLegFromResponse(leg: { distance?: { value: number }; duration?: { value: number } }): RouteLeg | null {
  if (!leg?.distance?.value || !leg?.duration?.value) return null;
  return {
    distanceMeters: leg.distance.value,
    durationSeconds: leg.duration.value,
    costRideshare: rideshareCostMeters(leg.distance.value),
    costTransit: TRANSIT_FIXED_COST,
  };
}

export async function getDirections(
  origin: { lat: number; lng: number },
  destination: { lat: number; lng: number },
  apiKey: string
): Promise<DirectionsResult> {
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  let driving: RouteLeg | undefined;
  let transit: RouteLeg | undefined;
  let transitSteps: DirectionStep[] | undefined;

  // Use proxy on web to avoid CORS (proxy has the key)
  if (PROXY_BASE) {
    try {
      const res = await fetch(
        `${PROXY_BASE}/directions?origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}`
      );
      if (!res.ok) throw new Error(`Proxy ${res.status}`);
      const { driving: drivingJson, transit: transitJson } = await res.json();
      if (drivingJson?.status === 'OK' && drivingJson.routes?.[0]?.legs?.[0]) {
        const leg = parseLegFromResponse(drivingJson.routes[0].legs[0]);
        if (leg) driving = { ...leg, costRideshare: rideshareCostMeters(leg.distanceMeters), costTransit: undefined };
      }
      if (transitJson?.status === 'OK' && transitJson.routes?.[0]?.legs?.[0]) {
        const leg = parseLegFromResponse(transitJson.routes[0].legs[0]);
        if (leg) transit = { ...leg, costTransit: TRANSIT_FIXED_COST, costRideshare: undefined };
        const steps = parseTransitSteps(transitJson);
        if (steps.length > 0) transitSteps = steps;
      }
    } catch (_) {
      // fall through to direct or haversine
    }
  }

  const hasKey = !!apiKey && apiKey !== 'no-key' && !apiKey.startsWith('YOUR_');
  if (!driving && hasKey) try {
    const drivingRes = await fetch(
      `${GOOGLE_DIRECTIONS_BASE}?origin=${originStr}&destination=${destStr}&mode=driving&key=${apiKey}`
    );
    const drivingJson = await drivingRes.json();
    if (drivingJson.status === 'OK' && drivingJson.routes?.[0]?.legs?.[0]) {
      const leg = parseLegFromResponse(drivingJson.routes[0].legs[0]);
      if (leg) driving = { ...leg, costRideshare: rideshareCostMeters(leg.distanceMeters), costTransit: undefined };
    }
  } catch (_) {
    // ignore
  }

  if (!transit && hasKey) try {
    const transitRes = await fetch(
      `${GOOGLE_DIRECTIONS_BASE}?origin=${originStr}&destination=${destStr}&mode=transit&key=${apiKey}`
    );
    const transitJson = await transitRes.json();
    if (transitJson.status === 'OK' && transitJson.routes?.[0]?.legs?.[0]) {
      const leg = parseLegFromResponse(transitJson.routes[0].legs[0]);
      if (leg) transit = { ...leg, costTransit: TRANSIT_FIXED_COST, costRideshare: undefined };
    }
  } catch (_) {
    // ignore
  }

  // Fallback: haversine + assumed 20 mph avg for driving (no key or API failed)
  let usedFallback = false;
  if (!driving) {
    usedFallback = true;
    const meters = haversineMeters(origin.lat, origin.lng, destination.lat, destination.lng);
    const durationSeconds = (meters / 1609.34 / 20) * 3600; // 20 mph
    driving = {
      distanceMeters: meters,
      durationSeconds,
      costRideshare: rideshareCostMeters(meters),
    };
  }

  return {
    driving,
    transit: transit || undefined,
    transitSteps,
    fallback: usedFallback,
  };
}
