import { haversineMeters } from '../utils/geo';
import { rideshareCostMeters, TRANSIT_FIXED_COST } from '../utils/pricing';

const GOOGLE_DIRECTIONS_BASE = 'https://maps.googleapis.com/maps/api/directions/json';

export type RouteLeg = {
  distanceMeters: number;
  durationSeconds: number;
  costRideshare?: number;
  costTransit?: number;
};

export type DirectionsResult = {
  driving?: RouteLeg;
  transit?: RouteLeg;
  fallback?: boolean;
};

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
  const hasKey = !!apiKey && apiKey !== 'no-key' && !apiKey.startsWith('YOUR_');
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;

  let driving: RouteLeg | undefined;
  let transit: RouteLeg | undefined;

  if (hasKey) try {
    const drivingRes = await fetch(
      `${GOOGLE_DIRECTIONS_BASE}?origin=${originStr}&destination=${destStr}&mode=driving&key=${apiKey}`
    );
    const drivingJson = await drivingRes.json();
    if (drivingJson.status === 'OK' && drivingJson.routes?.[0]?.legs?.[0]) {
      const leg = parseLegFromResponse(drivingJson.routes[0].legs[0]);
      if (leg) {
        driving = { ...leg, costRideshare: rideshareCostMeters(leg.distanceMeters), costTransit: undefined };
      }
    }
  } catch (_) {
    // ignore
  }

  if (hasKey) try {
    const transitRes = await fetch(
      `${GOOGLE_DIRECTIONS_BASE}?origin=${originStr}&destination=${destStr}&mode=transit&key=${apiKey}`
    );
    const transitJson = await transitRes.json();
    if (transitJson.status === 'OK' && transitJson.routes?.[0]?.legs?.[0]) {
      const leg = parseLegFromResponse(transitJson.routes[0].legs[0]);
      if (leg) {
        transit = { ...leg, costTransit: TRANSIT_FIXED_COST, costRideshare: undefined };
      }
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
    fallback: usedFallback,
  };
}
