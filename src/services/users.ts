import { API_BASE } from '../config';

export type ApiUser = {
  id: string;
  username: string;
  email: string;
  friends?: string[];
  civicPoints?: number;
  streak?: number;
};

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string })?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data as T;
}

export async function getMyFriends(token: string): Promise<ApiUser[]> {
  const res = await fetch(`${API_BASE}/api/users/me/friends`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handleResponse<ApiUser[]>(res);
}

export async function searchUsers(query: string, limit = 20): Promise<ApiUser[]> {
  const params = new URLSearchParams();
  if (query.trim()) params.set('q', query.trim());
  if (limit) params.set('limit', String(limit));
  const res = await fetch(`${API_BASE}/api/users/search?${params.toString()}`);
  return handleResponse<ApiUser[]>(res);
}
