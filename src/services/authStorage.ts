import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthUser } from '../state/authSlice';

const AUTH_KEY = '@wander/auth';

export type StoredAuth = { token: string; user: AuthUser };

export async function getStoredAuth(): Promise<StoredAuth | null> {
  try {
    const raw = await AsyncStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as StoredAuth;
    if (!data?.token || !data?.user) return null;
    return data;
  } catch {
    return null;
  }
}

export async function setStoredAuth(auth: StoredAuth): Promise<void> {
  await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export async function clearStoredAuth(): Promise<void> {
  await AsyncStorage.removeItem(AUTH_KEY);
}
