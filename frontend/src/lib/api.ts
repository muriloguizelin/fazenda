import { useAuthStore } from '../stores/auth';

const BASE_URL = (import.meta as any).env.VITE_API_URL || '/api/v1';

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = useAuthStore.getState().accessToken;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include',
  });
  if (!res.ok) {
    let err: any = { code: res.status, message: res.statusText };
    try { err = await res.json(); } catch {}
    throw err;
  }
  if (res.status === 204) return undefined as unknown as T;
  return res.json();
}


