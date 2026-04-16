// app/utils/auth.ts
// Dynamic base URL: driven by the apiStore (Zustand).
// On first load we read the persisted IP from AsyncStorage via the store.

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";
import { useApiStore } from "../store/apiStore";

const DEFAULT_PORT = "5103";
const FALLBACK_IP = "192.168.0.209";

// Synchronously read the cached base URL from the Zustand store.
// This works because Zustand's in-memory state is always available after
// the store module is imported, and the store hydrates from AsyncStorage
// on first mount via its initialise() call in the provider.
function getBase(): string {
  return useApiStore.getState().baseUrl;
}

function ep(path: string): string {
  return `${getBase()}${path}`;
}

// ─── ENDPOINTS (Proxy — always reads latest base URL) ─────────────────────────

export const ENDPOINTS = new Proxy(
  {} as {
    login: string;
    register: string;
    refresh: string;
    logout: string;
    user: string;
    password: string;
    billing: string;
    settings: string;
    cart: string;
    cartAdd: string;
    cartClear: string;
    cartItem: (id: number) => string;
    items: string;
    itemTypes: string;
    orders: string;
    checkout: string;
    renew: (id: number) => string;
    news: string;
  },
  {
    get(_t, prop: string) {
      switch (prop) {
        case "login":      return ep("/api/auth/login");
        case "register":   return ep("/api/auth/register");
        case "refresh":    return ep("/api/auth/refresh");
        case "logout":     return ep("/api/auth/logout");
        case "user":       return ep("/api/user/profile");
        case "password":   return ep("/api/user/change-password");
        case "billing":    return ep("/api/user/billing-address");
        case "settings":   return ep("/api/user/settings");
        case "cart":       return ep("/api/cart");
        case "cartAdd":    return ep("/api/cart/add");
        case "cartClear":  return ep("/api/cart/clear");
        case "cartItem":   return (id: number) => ep(`/api/cart/item/${id}`);
        case "items":      return ep("/api/items");
        case "itemTypes":  return ep("/api/items/types");
        case "orders":     return ep("/api/orders");
        case "checkout":   return ep("/api/orders/checkout");
        case "renew":      return (id: number) => ep(`/api/orders/renew/${id}`);
        case "news":       return ep("/api/news");
        default:           return undefined;
      }
    },
  }
);

// ─── Token helpers ────────────────────────────────────────────────────────────

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
  await AsyncStorage.multiRemove([AccessTokenKey, RefreshTokenKey, RefreshTokenExpiryKey]);
}

export async function isRefreshTokenValid(): Promise<boolean> {
  const expiryStr = await AsyncStorage.getItem(RefreshTokenExpiryKey);
  if (!expiryStr) return false;
  return Date.now() < Number(expiryStr) - 5 * 60 * 1000;
}

export async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = await AsyncStorage.getItem(RefreshTokenKey);
  if (!refreshToken) return false;
  if (!(await isRefreshTokenValid())) { await clearTokens(); return false; }
  try {
    const res = await fetch(ENDPOINTS.refresh, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) { await clearTokens(); return false; }
    const data = await res.json();
    await saveTokens(data.accessToken, data.refreshToken || refreshToken);
    return true;
  } catch {
    return false;
  }
}

export async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
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
    if (expSec - Math.floor(Date.now() / 1000) > 120) return true;
    return tryRefreshToken();
  } catch {
    return tryRefreshToken();
  }
}

let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null = null;

export function registerSessionRefreshListener(onExpired: () => void): () => void {
  appStateSubscription?.remove();
  const handleAppStateChange = async (nextState: AppStateStatus) => {
    if (nextState === "active") {
      const stillValid = await checkAndRefreshSession();
      if (!stillValid) { await clearTokens(); onExpired(); }
    }
  };
  appStateSubscription = AppState.addEventListener("change", handleAppStateChange);
  return () => { appStateSubscription?.remove(); appStateSubscription = null; };
}

export function decodeJwt(token: string): Record<string, string | number> | null {
  try { return JSON.parse(atob(token.split(".")[1])); } catch { return null; }
}
