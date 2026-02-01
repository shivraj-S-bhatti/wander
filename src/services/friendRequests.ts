import { API_BASE } from '../config';

export type FriendRequestReceived = {
  id: string;
  fromUserId: string;
  fromUsername: string | null;
  status: string;
  createdAt: string;
};

async function authFetch(
  token: string,
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  const res = await fetch(`${API_BASE}/api/friend-requests${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  return res;
}

async function handleResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { error?: string })?.error || res.statusText || 'Request failed';
    throw new Error(message);
  }
  return data as T;
}

export async function listReceived(token: string): Promise<FriendRequestReceived[]> {
  const res = await authFetch(token, '/received');
  return handleResponse<FriendRequestReceived[]>(res);
}

export async function acceptRequest(token: string, id: string): Promise<void> {
  const res = await authFetch(token, `/${id}/accept`, { method: 'POST' });
  await handleResponse(res);
}

export async function declineRequest(token: string, id: string): Promise<void> {
  const res = await authFetch(token, `/${id}/decline`, { method: 'POST' });
  await handleResponse(res);
}

export async function sendFriendRequest(token: string, toUserId: string): Promise<void> {
  const res = await authFetch(token, '', {
    method: 'POST',
    body: JSON.stringify({ toUserId }),
  });
  await handleResponse(res);
}
