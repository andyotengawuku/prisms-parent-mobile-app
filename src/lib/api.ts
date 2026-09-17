import * as SecureStore from "expo-secure-store";

const ACCESS_TOKEN_KEY = "prisms_access_token";
const REFRESH_TOKEN_KEY = "prisms_refresh_token";

export type ApiEnvelope<T> = {
  data: T | null;
  meta: Record<string, unknown> | null;
  error: { code: string; message: string } | null;
};

// Base is the PRISMS API root (the Next.js app serves /api/* itself).
// Dev default targets a local server; production sets EXPO_PUBLIC_API_BASE_URL.
const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";

let memoryAccessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;

export async function setTokens(access: string, refresh: string): Promise<void> {
  memoryAccessToken = access;
  await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
  await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
}

export async function clearTokens(): Promise<void> {
  memoryAccessToken = null;
  await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
  await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
}

export async function getAccessToken(): Promise<string | null> {
  if (memoryAccessToken) return memoryAccessToken;
  memoryAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  return memoryAccessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_BASE}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: refresh }),
      });
      if (!res.ok) {
        await clearTokens();
        return false;
      }
      const json = (await res.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
      }>;
      if (!json.data?.accessToken || !json.data.refreshToken) {
        await clearTokens();
        return false;
      }
      await setTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    } catch {
      return false;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
  retried = false,
): Promise<ApiEnvelope<T>> {
  const token = await getAccessToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const res = await fetch(`${API_BASE}${path}`, { ...init, headers });

  if (res.status === 401 && !retried) {
    const ok = await refreshAccessToken();
    if (ok) return apiFetch<T>(path, init, true);
  }

  const json = (await res.json()) as ApiEnvelope<T>;
  return json;
}
