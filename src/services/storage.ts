import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PROFILE = '@wander/profile';
const KEY_POSTS = '@wander/posts';

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
