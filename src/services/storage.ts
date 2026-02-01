import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PROFILE = '@wander/profile';
const KEY_POSTS = '@wander/posts';
const KEY_PLAN = '@wander/plan';
const KEY_DEMO_FRIENDS = '@wander/demo_friends';

export type StoredProfile = {
  prefs?: { vibe?: string; budget?: string; categories?: string[] };
  civicPoints: number;
  joinedEventIds?: string[];
  memoryCounters?: Record<string, number>;
  tagCounts?: Record<string, number>;
  lastChosenPlaceIds?: string[];
  lastGeminiRecs?: unknown;
};

export async function loadProfile(): Promise<StoredProfile | null> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PROFILE);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveProfile(profile: StoredProfile): Promise<void> {
  await AsyncStorage.setItem(KEY_PROFILE, JSON.stringify(profile));
}

export type StoredPost = {
  id: string;
  userId: string;
  ts: number;
  what: string;
  whoWith: string;
  rating: number;
  experience: string;
  imageUris: string[];
  tags: string[];
  hoursSpent?: number;
};

export async function loadPosts(): Promise<StoredPost[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_POSTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function savePosts(posts: StoredPost[]): Promise<void> {
  await AsyncStorage.setItem(KEY_POSTS, JSON.stringify(posts));
}

export type StoredPlan = { placeIds: string[]; name?: string } | null;

export async function loadPlan(): Promise<StoredPlan> {
  try {
    const raw = await AsyncStorage.getItem(KEY_PLAN);
    if (!raw) return null;
    const data = JSON.parse(raw);
    if (!Array.isArray(data?.placeIds)) return null;
    return { placeIds: data.placeIds, name: data.name };
  } catch {
    return null;
  }
}

export async function savePlan(plan: StoredPlan): Promise<void> {
  if (!plan) await AsyncStorage.removeItem(KEY_PLAN);
  else await AsyncStorage.setItem(KEY_PLAN, JSON.stringify(plan));
}

export async function loadDemoFriends(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_DEMO_FRIENDS);
    if (!raw) return [];
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function saveDemoFriends(ids: string[]): Promise<void> {
  await AsyncStorage.setItem(KEY_DEMO_FRIENDS, JSON.stringify(ids));
}
