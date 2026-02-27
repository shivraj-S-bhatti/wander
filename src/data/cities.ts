/**
 * Hardcoded cities for "Wander [City]" — San Francisco, Boston, Providence (Brown hackathon).
 * Each city has center, origin (home), places (5–10), and events.
 */

import type { Event, Place, Review } from './demo';

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

export type City = {
  id: string;
  name: string;
  /** Short label for "Wander San Fran", "Wander Boston", "Wander Providence" */
  displayName: string;
  center: { lat: number; lng: number };
  /** Home / you marker position */
  origin: { lat: number; lng: number };
  places: Place[];
  events: Event[];
};

/** Brown University (Providence) — used for "At my location" post celebration. */
export const BROWN_UNIVERSITY_COORDS = { lat: 41.8262, lng: -71.4032 };

// ——— San Francisco (existing demo data)
const SF_PLACES: Place[] = [
  { id: 'p_1', name: 'The Hive Coffee', category: 'cafe', lat: 37.7849, lng: -122.4094, priceTier: 2, tags: ['coffee', 'wifi', 'chill'], isLocalBusiness: true, averageRating: 4.8 },
  { id: 'p_2', name: 'Sunset Bar & Grill', category: 'bar', lat: 37.7865, lng: -122.408, priceTier: 3, tags: ['outdoor', 'cocktails', 'party'], isLocalBusiness: true, averageRating: 4.2 },
  { id: 'p_3', name: 'Marina Green', category: 'outdoors', lat: 37.8024, lng: -122.436, priceTier: 1, tags: ['park', 'views', 'chill'], isLocalBusiness: false, averageRating: 4.9 },
  { id: 'p_4', name: 'Luna Kitchen', category: 'restaurant', lat: 37.7812, lng: -122.4112, priceTier: 2, tags: ['local', 'dinner', 'quiet'], isLocalBusiness: true, averageRating: 4.5 },
  { id: 'p_5', name: 'Downtown Community Center', category: 'community', lat: 37.7798, lng: -122.4142, priceTier: 1, tags: ['volunteer', 'events', 'community'], isLocalBusiness: false, averageRating: 4.7 },
  { id: 'p_6', name: 'Neighborhood Cleanup Hub', category: 'community', lat: 37.777, lng: -122.418, priceTier: 1, tags: ['volunteer', 'cleanup', 'outdoors'], isLocalBusiness: false, averageRating: 4.4 },
];

const SF_EVENTS: Event[] = [
  { id: 'e_1', title: 'Weekend Cleanup — Marina Green', description: 'Pick up litter and tidy the park.', lat: 37.8024, lng: -122.436, startTs: now + 1 * day, endTs: now + 1 * day + 3 * hour, pointsReward: 25, joinedUserIds: ['u_2'] },
  { id: 'e_2', title: 'Community Kitchen — Meal Prep', description: 'Help prep and pack meals.', lat: 37.7798, lng: -122.4142, startTs: now + 2 * day, endTs: now + 2 * day + 4 * hour, pointsReward: 30, joinedUserIds: [] },
  { id: 'e_3', title: 'Clothing Drive — Downtown Center', description: 'Sort and organize donated clothes.', lat: 37.7798, lng: -122.4142, startTs: now + 3 * day, endTs: now + 3 * day + 2 * hour, pointsReward: 20, joinedUserIds: ['u_4'] },
];

// ——— Boston
const BOSTON_PLACES: Place[] = [
  { id: 'b_p_1', name: 'Tatte Back Bay', category: 'cafe', lat: 42.3505, lng: -71.0764, priceTier: 2, tags: ['coffee', 'pastries', 'wifi'], isLocalBusiness: true, averageRating: 4.6 },
  { id: 'b_p_2', name: 'Fenway Park Area', category: 'outdoors', lat: 42.3467, lng: -71.0972, priceTier: 2, tags: ['sports', 'walk', 'views'], isLocalBusiness: false, averageRating: 4.8 },
  { id: 'b_p_3', name: 'Trident Booksellers', category: 'cafe', lat: 42.3512, lng: -71.0865, priceTier: 2, tags: ['books', 'coffee', 'chill'], isLocalBusiness: true, averageRating: 4.5 },
  { id: 'b_p_4', name: 'Legal Sea Foods', category: 'restaurant', lat: 42.3581, lng: -71.0506, priceTier: 3, tags: ['seafood', 'dinner', 'local'], isLocalBusiness: true, averageRating: 4.3 },
  { id: 'b_p_5', name: 'Boston Common', category: 'outdoors', lat: 42.3551, lng: -71.0654, priceTier: 1, tags: ['park', 'walk', 'quiet'], isLocalBusiness: false, averageRating: 4.7 },
  { id: 'b_p_6', name: 'Harvard Square Cafe', category: 'cafe', lat: 42.3736, lng: -71.1097, priceTier: 2, tags: ['coffee', 'study', 'wifi'], isLocalBusiness: true, averageRating: 4.4 },
  { id: 'b_p_7', name: 'MIT Museum', category: 'community', lat: 42.3611, lng: -71.0921, priceTier: 2, tags: ['museum', 'tech', 'family'], isLocalBusiness: false, averageRating: 4.6 },
  { id: 'b_p_8', name: 'North End Pizza', category: 'restaurant', lat: 42.3644, lng: -71.0542, priceTier: 2, tags: ['pizza', 'italian', 'casual'], isLocalBusiness: true, averageRating: 4.5 },
];

const BOSTON_EVENTS: Event[] = [
  { id: 'b_e_1', title: 'Boston Common Cleanup', description: 'Community cleanup in the park.', lat: 42.3551, lng: -71.0654, startTs: now + 1 * day, endTs: now + 1 * day + 2 * hour, pointsReward: 20, joinedUserIds: [] },
  { id: 'b_e_2', title: 'Food Drive — Back Bay', description: 'Collect and sort food donations.', lat: 42.3505, lng: -71.0764, startTs: now + 2 * day, endTs: now + 2 * day + 3 * hour, pointsReward: 25, joinedUserIds: [] },
];

// ——— Providence (Brown University hackathon)
const PROVIDENCE_PLACES: Place[] = [
  { id: 'pr_p_1', name: 'Blue State Coffee', category: 'cafe', lat: 41.8268, lng: -71.4035, priceTier: 2, tags: ['coffee', 'wifi', 'study'], isLocalBusiness: true, averageRating: 4.6 },
  { id: 'pr_p_2', name: 'Brown University Campus', category: 'outdoors', lat: 41.8262, lng: -71.4032, priceTier: 1, tags: ['campus', 'walk', 'hackathon'], isLocalBusiness: false, averageRating: 4.9 },
  { id: 'pr_p_3', name: 'Thayer Street Eats', category: 'restaurant', lat: 41.8275, lng: -71.4012, priceTier: 2, tags: ['casual', 'quick', 'variety'], isLocalBusiness: true, averageRating: 4.4 },
  { id: 'pr_p_4', name: 'RISD Museum', category: 'community', lat: 41.8256, lng: -71.4102, priceTier: 2, tags: ['art', 'museum', 'quiet'], isLocalBusiness: false, averageRating: 4.7 },
  { id: 'pr_p_5', name: 'WaterFire Pavilion', category: 'outdoors', lat: 41.8234, lng: -71.4108, priceTier: 1, tags: ['waterfire', 'views', 'chill'], isLocalBusiness: false, averageRating: 4.8 },
  { id: 'pr_p_6', name: 'Hackathon Hub — Sayles', category: 'community', lat: 41.8265, lng: -71.4028, priceTier: 1, tags: ['hackathon', 'events', 'wifi'], isLocalBusiness: false, averageRating: 5.0 },
  { id: 'pr_p_7', name: 'Federal Hill Pizza', category: 'restaurant', lat: 41.8189, lng: -71.4142, priceTier: 2, tags: ['pizza', 'italian', 'dinner'], isLocalBusiness: true, averageRating: 4.5 },
  { id: 'pr_p_8', name: 'Brown Bookstore Cafe', category: 'cafe', lat: 41.8260, lng: -71.4038, priceTier: 2, tags: ['coffee', 'books', 'study'], isLocalBusiness: true, averageRating: 4.3 },
  { id: 'pr_p_9', name: 'Providence Geeks Meetup', category: 'community', lat: 41.8240, lng: -71.4080, priceTier: 1, tags: ['tech', 'meetup', 'community'], isLocalBusiness: false, averageRating: 4.6 },
];

const PROVIDENCE_EVENTS: Event[] = [
  { id: 'pr_e_1', title: 'Brown Hackathon — Main Event', description: 'Hackathon at Brown University. Build something awesome!', lat: 41.8265, lng: -71.4028, startTs: now, endTs: now + 2 * day, pointsReward: 50, joinedUserIds: [] },
  { id: 'pr_e_2', title: 'Tech Talk — Sayles Hall', description: 'Guest speaker on campus.', lat: 41.8262, lng: -71.4032, startTs: now + 1 * day, endTs: now + 1 * day + 1 * hour, pointsReward: 10, joinedUserIds: [] },
  { id: 'pr_e_3', title: 'WaterFire Night', description: 'Community gathering at WaterFire.', lat: 41.8234, lng: -71.4108, startTs: now + 2 * day, endTs: now + 2 * day + 3 * hour, pointsReward: 15, joinedUserIds: [] },
];

export const CITIES: City[] = [
  {
    id: 'san_francisco',
    name: 'San Francisco',
    displayName: 'San Fran',
    center: { lat: 37.7849, lng: -122.4094 },
    origin: { lat: 37.7812, lng: -122.4112 },
    places: SF_PLACES,
    events: SF_EVENTS,
  },
  {
    id: 'boston',
    name: 'Boston',
    displayName: 'Boston',
    center: { lat: 42.3551, lng: -71.0654 },
    origin: { lat: 42.3505, lng: -71.0764 },
    places: BOSTON_PLACES,
    events: BOSTON_EVENTS,
  },
  {
    id: 'providence',
    name: 'Providence',
    displayName: 'Providence',
    center: { lat: 41.8262, lng: -71.4032 },
    origin: { lat: 41.8268, lng: -71.4035 },
    places: PROVIDENCE_PLACES,
    events: PROVIDENCE_EVENTS,
  },
];

export const DEFAULT_CITY_ID = 'san_francisco';

export function getCityById(id: string): City | undefined {
  return CITIES.find((c) => c.id === id);
}

export function getAllPlaces(): Place[] {
  return CITIES.flatMap((c) => c.places);
}

export function getPlaceById(placeId: string): Place | undefined {
  return getAllPlaces().find((p) => p.id === placeId);
}

/** Reviews for all cities (SF from demo + Boston + Providence) */
export const ALL_REVIEWS: Review[] = [
  { id: 'r_1', userId: 'u_1', placeId: 'p_1', ts: now - 2 * hour, rating: 5, text: 'Best coffee in the neighborhood.' },
  { id: 'r_2', userId: 'u_2', placeId: 'p_2', ts: now - 5 * hour, rating: 4, text: 'Solid drinks, great patio.' },
  { id: 'r_3', userId: 'u_3', placeId: 'p_3', ts: now - 1 * day, rating: 5, text: 'Perfect for a quiet evening walk.' },
  { id: 'r_4', userId: 'u_4', placeId: 'p_5', ts: now - 3 * hour, rating: 5, text: 'Love volunteering here.' },
  { id: 'b_r_1', userId: 'u_1', placeId: 'b_p_1', ts: now - 4 * hour, rating: 5, text: 'Great lattes and pastries.' },
  { id: 'b_r_2', userId: 'u_2', placeId: 'b_p_4', ts: now - 1 * day, rating: 4, text: 'Classic Boston seafood.' },
  { id: 'pr_r_1', userId: 'u_1', placeId: 'pr_p_1', ts: now - 2 * hour, rating: 5, text: 'Perfect for hacking. Fast wifi.' },
  { id: 'pr_r_2', userId: 'u_3', placeId: 'pr_p_6', ts: now - 1 * hour, rating: 5, text: 'Hackathon HQ is awesome!' },
  { id: 'pr_r_3', userId: 'u_4', placeId: 'pr_p_2', ts: now - 5 * hour, rating: 5, text: 'Beautiful campus. Great for a walk.' },
];
