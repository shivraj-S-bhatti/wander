import { metersToMiles } from './geo';

export function rideshareCostMeters(meters: number): number {
  const miles = metersToMiles(meters);
  return Math.round((3 + miles * 2.2) * 100) / 100;
}

export const TRANSIT_FIXED_COST = 2.9;
