import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";

// ─── Base URL ─────────────────────────────────────────────────────────────────
const IS_DEV = __DEV__;

export const DEFAULT_DEV_IP = "192.168.0.216";
const DEFAULT_PORT = "5103";

export const IP_STORAGE_KEY = "dev_server_ip";

/** Get the current API base URL. */
export async function getApiBaseUrl(): Promise<string> {
  if (!IS_DEV) {
    const prodUrl = process.env.EXPO_PUBLIC_API_URL;
    if (!prodUrl) throw new Error("EXPO_PUBLIC_API_URL is not set for production");
    return prodUrl;
  }
  const stored = await AsyncStorage.getItem(IP_STORAGE_KEY);
  const ip = stored?.trim() || DEFAULT_DEV_IP;
  return `http://${ip}:${DEFAULT_PORT}`;
}

/** Synchronous version using a cached value */
let _cachedBase = `http://${DEFAULT_DEV_IP}:${DEFAULT_PORT}`;

export function getCachedApiBase(): string {
  if (!IS_DEV) {
    return process.env.EXPO_PUBLIC_API_URL || _cachedBase;
  }
  return _cachedBase;
}

export async function refreshCachedApiBase(): Promise<string> {
  _cachedBase = await getApiBaseUrl();
  return _cachedBase;
}

// ─── Endpoints ────────────────────────────────────────────────────────────────
export const ENDPOINTS = {
  get login() { return `${getCachedApiBase()}/api/auth/login` },
  get register() { return `${getCachedApiBase()}/api/auth/register` },
  get refresh() { return `${getCachedApiBase()}/api/auth/refresh` },
  get logout() { return `${getCachedApiBase()}/api/auth/logout` },
  get user() { return `${getCachedApiBase()}/api/user/profile` },
  get password() { return `${getCachedApiBase()}/api/user/change-password` },
  get billing() { return `${getCachedApiBase()}/api/user/billing-address` },
  get settings() { return `${getCachedApiBase()}/api/user/settings` },
  get cart() { return `${getCachedApiBase()}/api/cart` },
  get cartAdd() { return `${getCachedApiBase()}/api/cart/add` },
  get cartClear() { return `${getCachedApiBase()}/api/cart/clear` },
  cartItem: (id: number) => `${getCachedApiBase()}/api/cart/item/${id}`,
  get items() { return `${getCachedApiBase()}/api/items` },
  get itemTypes() { return `${getCachedApiBase()}/api/items/types` },
  get orders() { return `${getCachedApiBase()}/api/orders` },
  get checkout() { return `${getCachedApiBase()}/api/orders/checkout` },
  renew: (id: number) => `${getCachedApiBase()}/api/orders/renew/${id}`,
  get news() { return `${getCachedApiBase()}/api/news` },
  get deals() { return `${getCachedApiBase()}/api/deals` },
};

/**
 * Resolve an image path from the server.
 * Handles: null/empty, absolute URLs, /uploads/... paths.
 * FIXED: Never returns null or empty string that could cause URI parsing errors.
 */
const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&w=800&q=80";

export function resolveImageUrl(path: string | null | undefined): string {
  if (!path || path.trim() === "") return FALLBACK_IMAGE;
  
  const trimmed = path.trim();
  
  // Strip hardcoded localhost prefix
  const cleaned = trimmed.startsWith("http://localhost:5103")
    ? trimmed.replace("http://localhost:5103", "")
    : trimmed;

  // Already a full URL
  if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) {
    // Validate it's a proper URL - if not, return fallback
    try {
      new URL(cleaned);
      return cleaned;
    } catch {
      return FALLBACK_IMAGE;
    }
  }

  // Relative path - combine with API base
  const base = getCachedApiBase();
  const separator = cleaned.startsWith("/") ? "" : "/";
  return `${base}${separator}${cleaned}`;
}

// ─── Token storage ────────────────────────────────────────────────────────────
export const AccessTokenKey = "accessToken";
export const RefreshTokenKey = "refreshToken";
const RefreshTokenExpiryKey = "refreshTokenExpiry";

export async function saveTokens(
  access: string,
  refresh: string,
  refreshExpiryDays = 7,
) {
  const expiryMs = Date.now() + refreshExpiryDays * 24 * 60 * 60 * 1000;
  await AsyncStorage.multiSet([
    [AccessTokenKey, access],
    [RefreshTokenKey, refresh],
    [RefreshTokenExpiryKey, String(expiryMs)],
  ]);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([
    AccessTokenKey,
    RefreshTokenKey,
    RefreshTokenExpiryKey,
  ]);
}

export async function isRefreshTokenValid(): Promise<boolean> {
  const expiryStr = await AsyncStorage.getItem(RefreshTokenExpiryKey);
  if (!expiryStr) return false;
  const expiry = Number(expiryStr);
  return Date.now() < expiry - 5 * 60 * 1000;
}

export async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = await AsyncStorage.getItem(RefreshTokenKey);
  if (!refreshToken) return false;

  const valid = await isRefreshTokenValid();
  if (!valid) {
    await clearTokens();
    return false;
  }

  try {
    const res = await fetch(ENDPOINTS.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });

    if (!res.ok) {
      await clearTokens();
      return false;
    }

    const data = await res.json();
    await saveTokens(data.accessToken, data.refreshToken || refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  // Guard: never fetch an invalid URL
  if (!url || url.trim() === "" || url.includes("undefined") || url.includes("null")) {
    throw new Error(`Invalid URL: "${url}"`);
  }

  const token = await AsyncStorage.getItem(AccessTokenKey);

  const doFetch = (t: string) =>
    fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
        Authorization: `Bearer ${t}`,
      },
    });

  let res = await doFetch(token ?? "");
  if (res.status !== 401) return res;

  const refreshed = await tryRefreshToken();
  if (!refreshed) throw new Error("SESSION_EXPIRED");

  const newToken = await AsyncStorage.getItem(AccessTokenKey);
  return doFetch(newToken ?? "");
}

export async function checkAndRefreshSession(): Promise<boolean> {
  const accessToken = await AsyncStorage.getItem(AccessTokenKey);
  if (!accessToken) return false;

  try {
    const decoded = decodeJwt(accessToken);
    if (!decoded) return tryRefreshToken();

    const expSec = decoded.exp ? Number(decoded.exp) : 0;
    const nowSec = Math.floor(Date.now() / 1000);

    if (expSec - nowSec > 120) return true;
    return tryRefreshToken();
  } catch {
    return tryRefreshToken();
  }
}

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function registerSessionRefreshListener(onExpired: () => void): () => void {
  if (appStateSubscription) appStateSubscription.remove();

  const handleAppStateChange = async (nextState: AppStateStatus) => {
    if (nextState === "active") {
      const stillValid = await checkAndRefreshSession();
      if (!stillValid) {
        await clearTokens();
        onExpired();
      }
    }
  };

  appStateSubscription = AppState.addEventListener("change", handleAppStateChange);
  return () => {
    appStateSubscription?.remove();
    appStateSubscription = null;
  };
}

export function decodeJwt(token: string): Record<string, string | number> | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const payload = parts[1];
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
