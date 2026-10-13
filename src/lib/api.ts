import * as SecureStore from "expo-secure-store";
import { getDeviceId } from "./device";

const ACCESS_TOKEN_KEY = "prisms_access_token";
const REFRESH_TOKEN_KEY = "prisms_refresh_token";

export type ApiEnvelope<T> = {
  data: T | null;
  meta: Record<string, unknown> | null;
  error: { code: string; message: string; details?: Record<string, unknown> } | null;
};

// Base is the PRISMS API root (the Next.js app serves /api/* itself).
// Dev default targets a local server; production sets EXPO_PUBLIC_API_BASE_URL.
const API_BASE = (
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  (__DEV__ ? "http://localhost:3000/api" : "")
).replace(/\/+$/, "");

let memoryAccessToken: string | null = null;
let refreshInFlight: Promise<boolean> | null = null;
const authExpiryListeners = new Set<() => void>();

function apiUrl(path: string): string {
  if (!API_BASE) {
    throw new Error("Set EXPO_PUBLIC_API_BASE_URL for this production build.");
  }
  if (!__DEV__ && !API_BASE.startsWith("https://")) {
    throw new Error("The production API URL must use HTTPS.");
  }
  return `${API_BASE}${path}`;
}

function notifyAuthExpired(): void {
  for (const listener of authExpiryListeners) listener();
}

export function onAuthExpired(listener: () => void): () => void {
  authExpiryListeners.add(listener);
  return () => {
    authExpiryListeners.delete(listener);
  };
}

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = 15_000,
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, {
      ...init,
      signal: init.signal ?? controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function setTokens(access: string, refresh: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh);
    await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, access);
    memoryAccessToken = access;
  } catch (error) {
    await clearTokens();
    throw error;
  }
}

export async function clearTokens(): Promise<void> {
  memoryAccessToken = null;
  await Promise.allSettled([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY),
  ]);
}

export async function logoutSession(): Promise<void> {
  try {
    const [access, refresh] = await Promise.all([
      getAccessToken(),
      SecureStore.getItemAsync(REFRESH_TOKEN_KEY),
    ]);
    await fetchWithTimeout(apiUrl("/v1/mobile/auth/logout"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(access ? { Authorization: `Bearer ${access}` } : {}),
      },
      body: JSON.stringify({ refreshToken: refresh }),
    }, 2500);
  } catch {
    // Always remove local credentials, even when the device is offline.
  } finally {
    await clearTokens();
  }
}

export async function getAccessToken(): Promise<string | null> {
  if (memoryAccessToken) return memoryAccessToken;
  memoryAccessToken = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
  return memoryAccessToken;
}

async function refreshAccessToken(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const refresh = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
      if (!refresh) {
        await clearTokens();
        notifyAuthExpired();
        return false;
      }

      const res = await fetchWithTimeout(apiUrl("/v1/mobile/auth/refresh"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          refreshToken: refresh,
          deviceId: await getDeviceId(),
        }),
      });
      if (!res.ok) {
        if (res.status === 401) {
          await clearTokens();
          notifyAuthExpired();
        }
        return false;
      }
      const json = (await res.json()) as ApiEnvelope<{
        accessToken: string;
        refreshToken: string;
      }>;
      if (!json.data?.accessToken || !json.data.refreshToken) {
        await clearTokens();
        notifyAuthExpired();
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

  const res = await fetchWithTimeout(apiUrl(path), { ...init, headers });

  if (res.status === 401) {
    if (!retried) {
      const ok = await refreshAccessToken();
      if (ok) return apiFetch<T>(path, init, true);
    } else {
      await clearTokens();
      notifyAuthExpired();
    }
  }

  const json: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const payload = json as
      | { error?: unknown; message?: unknown; code?: unknown; [key: string]: unknown }
      | null;
    return {
      data: null,
      meta: null,
      error: {
        code: typeof payload?.code === "string" ? payload.code : `HTTP_${res.status}`,
        message:
          typeof payload?.error === "string"
            ? payload.error
            : typeof payload?.message === "string"
              ? payload.message
              : `Request failed (${res.status})`,
        ...(payload ? { details: payload } : {}),
      },
    };
  }

  if (json && typeof json === "object" && "data" in json) {
    return json as ApiEnvelope<T>;
  }

  // Some existing parent endpoints return their payload directly instead of
  // using the { data, meta, error } envelope used by the mobile endpoints.
  return { data: json as T, meta: null, error: null };
}
