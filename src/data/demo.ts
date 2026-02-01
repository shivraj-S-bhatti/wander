// Hardcoded demo data — timestamps are "recent" for demo feel (Date.now() - N hours)

export type User = { id: string; name: string; avatar?: string; handle?: string; memberSince?: string };
export type Place = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  priceTier: 1 | 2 | 3 | 4;
  tags: string[];
  isLocalBusiness?: boolean;
  /** Average rating 1–5 for display (e.g. from reviews) */
  averageRating?: number;
};
/** Pro-community badges e.g. Local business, Volunteer, Organized hangout */
export type CheckinBadge = 'Local business' | 'Volunteer' | 'Organized hangout' | 'Public transport';

export type Checkin = {
  id: string;
  userId: string;
  placeId: string;
  ts: number;
  type: 'hangout' | 'visited' | 'volunteer';
  rating?: number;
  note?: string;
  /** Badges for pro-community behaviour */
  badges?: CheckinBadge[];
};
export type Review = {
  id: string;
  userId: string;
  placeId: string;
  ts: number;
  rating: number;
  text: string;
};
export type Event = {
  id: string;
  title: string;
  description: string;
  lat: number;
  lng: number;
  startTs: number;
  endTs: number;
  pointsReward: number;
  joinedUserIds: string[];
};

export type Post = {
  id: string;
  userId: string;
  ts: number;
  what: string;
  whoWith: string;
  rating: number;
  experience: string;
  imageUris: string[];
  tags: string[];
  /** Hours spent on this activity (for heatmap intensity). One activity per day. */
  hoursSpent?: number;
};

export type Friend = {
  id: string;
  username: string;
  avatar?: string;
  civicScore: number;
  streak: number;
  rank: number;
};

const now = Date.now();
const hour = 60 * 60 * 1000;
const day = 24 * hour;

export const DEMO_ORIGIN = { lat: 37.7812, lng: -122.4112 };
export const DEMO_MAP_CENTER = { lat: 37.7849, lng: -122.4094 };

export const DEMO_USERS: User[] = [
  { id: 'u_me', name: 'Jordan Lee', avatar: 'guy4', handle: '@jordan_lee_2' },
  { id: 'u_1', name: 'Alex', avatar: 'guy1' },
  { id: 'u_2', name: 'Sam', avatar: 'guy2' },
  { id: 'u_3', name: 'Jordan', avatar: 'guy3' },
  { id: 'u_4', name: 'Riley', avatar: 'gal1' },
  { id: 'u_5', name: 'Casey', avatar: 'gal2' },
  { id: 'u_6', name: 'Morgan', avatar: 'gal3' },
];

export const DEMO_PLACES: Place[] = [
  {
    id: 'p_1',
    name: 'The Hive Coffee',
    category: 'cafe',
    lat: 37.7849,
    lng: -122.4094,
    priceTier: 2,
    tags: ['coffee', 'wifi', 'chill'],
    isLocalBusiness: true,
  },
  {
    id: 'p_2',
    name: 'Sunset Bar & Grill',
    category: 'bar',
    lat: 37.7865,
    lng: -122.408,
    priceTier: 3,
    tags: ['outdoor', 'cocktails', 'party'],
    isLocalBusiness: true,
  },
  {
    id: 'p_3',
    name: 'Marina Green',
    category: 'outdoors',
    lat: 37.8024,
    lng: -122.436,
    priceTier: 1,
    tags: ['park', 'views', 'chill'],
    isLocalBusiness: false,
  },
  {
    id: 'p_4',
    name: 'Luna Kitchen',
    category: 'restaurant',
    lat: 37.7812,
    lng: -122.4112,
    priceTier: 2,
    tags: ['local', 'dinner', 'quiet'],
    isLocalBusiness: true,
  },
  {
    id: 'p_5',
    name: 'Downtown Community Center',
    category: 'community',
    lat: 37.7798,
    lng: -122.4142,
    priceTier: 1,
    tags: ['volunteer', 'events', 'community'],
    isLocalBusiness: false,
  },
  {
    id: 'p_6',
    name: 'Neighborhood Cleanup Hub',
    category: 'community',
    lat: 37.777,
    lng: -122.418,
    priceTier: 1,
    tags: ['volunteer', 'cleanup', 'outdoors'],
    isLocalBusiness: false,
  },
];

export const DEMO_CHECKINS: Checkin[] = [
  { id: 'c_1', userId: 'u_1', placeId: 'p_1', ts: now - 2 * hour, type: 'hangout', rating: 5, note: 'Great oat latte', badges: ['Local business', 'Organized hangout'] },
  { id: 'c_2', userId: 'u_2', placeId: 'p_2', ts: now - 5 * hour, type: 'visited', rating: 4, badges: ['Local business'] },
  { id: 'c_3', userId: 'u_3', placeId: 'p_3', ts: now - 1 * day, type: 'hangout', note: 'Sunset was amazing', badges: ['Organized hangout'] },
  { id: 'c_4', userId: 'u_4', placeId: 'p_5', ts: now - 3 * hour, type: 'volunteer', note: 'Food distribution', badges: ['Volunteer'] },
  { id: 'c_5', userId: 'u_1', placeId: 'p_4', ts: now - 1 * day - 2 * hour, type: 'visited', rating: 5, badges: ['Local business'] },
  { id: 'c_6', userId: 'u_2', placeId: 'p_6', ts: now - 2 * day, type: 'volunteer', badges: ['Volunteer'] },
];

export const DEMO_REVIEWS: Review[] = [
  { id: 'r_1', userId: 'u_1', placeId: 'p_1', ts: now - 2 * hour, rating: 5, text: 'Best coffee in the neighborhood.' },
  { id: 'r_2', userId: 'u_2', placeId: 'p_2', ts: now - 5 * hour, rating: 4, text: 'Solid drinks, great patio.' },
  { id: 'r_3', userId: 'u_3', placeId: 'p_3', ts: now - 1 * day, rating: 5, text: 'Perfect for a quiet evening walk.' },
  { id: 'r_4', userId: 'u_4', placeId: 'p_5', ts: now - 3 * hour, rating: 5, text: 'Love volunteering here.' },
];

export const DEMO_EVENTS: Event[] = [
  {
    id: 'e_1',
    title: 'Weekend Cleanup — Marina Green',
    description: 'Pick up litter and tidy the park. Gloves and bags provided.',
    lat: 37.8024,
    lng: -122.436,
    startTs: now + 1 * day,
    endTs: now + 1 * day + 3 * hour,
    pointsReward: 25,
    joinedUserIds: ['u_2'],
  },
  {
    id: 'e_2',
    title: 'Community Kitchen — Meal Prep',
    description: 'Help prep and pack meals for distribution.',
    lat: 37.7798,
    lng: -122.4142,
    startTs: now + 2 * day,
    endTs: now + 2 * day + 4 * hour,
    pointsReward: 30,
    joinedUserIds: [],
  },
  {
    id: 'e_3',
    title: 'Clothing Drive — Downtown Center',
    description: 'Sort and organize donated clothes.',
    lat: 37.7798,
    lng: -122.4142,
    startTs: now + 3 * day,
    endTs: now + 3 * day + 2 * hour,
    pointsReward: 20,
    joinedUserIds: ['u_4'],
  },
];

export const DEMO_FRIENDS: Friend[] = [
  { id: 'u_1', username: 'Alex', avatar: 'guy1', civicScore: 320, streak: 7, rank: 1 },
  { id: 'u_2', username: 'Sam', avatar: 'guy2', civicScore: 280, streak: 5, rank: 2 },
  { id: 'u_3', username: 'Jordan', avatar: 'guy3', civicScore: 245, streak: 12, rank: 3 },
  { id: 'u_4', username: 'Riley', avatar: 'gal1', civicScore: 190, streak: 3, rank: 4 },
  { id: 'u_5', username: 'Casey', avatar: 'gal2', civicScore: 165, streak: 2, rank: 5 },
  { id: 'u_6', username: 'Morgan', avatar: 'gal3', civicScore: 120, streak: 1, rank: 6 },
];

export const CURRENT_USER_ID = 'u_me';

// Fallback recommendations when Gemini is unavailable
export const DEMO_RECS = [
  { placeId: 'p_1', reason: 'Friends loved the coffee here recently.', confidence: 0.9, suggestedTime: '3:00 PM' },
  { placeId: 'p_2', reason: 'Great for a night out — matches your vibe.', confidence: 0.85, suggestedTime: '8:00 PM' },
  { placeId: 'p_3', reason: 'Chill outdoor spot your crew enjoys.', confidence: 0.8, suggestedTime: '6:00 PM' },
];
