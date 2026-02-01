import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_PROFILE = '@wander/profile';

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
