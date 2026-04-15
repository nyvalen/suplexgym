import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, AppStateStatus } from "react-native";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://192.168.0.143:5103";

export const ENDPOINTS = {
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  refresh: `${API_BASE_URL}/api/auth/refresh`,
  logout: `${API_BASE_URL}/api/auth/logout`,
  user: `${API_BASE_URL}/api/user/profile`,
  password: `${API_BASE_URL}/api/user/change-password`,
  billing: `${API_BASE_URL}/api/user/billing-address`,
  settings: `${API_BASE_URL}/api/user/settings`,
  cart: `${API_BASE_URL}/api/cart`,
  cartAdd: `${API_BASE_URL}/api/cart/add`,
  cartClear: `${API_BASE_URL}/api/cart/clear`,
  cartItem: (id: number) => `${API_BASE_URL}/api/cart/item/${id}`,
  items: `${API_BASE_URL}/api/items`,
  itemTypes: `${API_BASE_URL}/api/items/types`,
  orders: `${API_BASE_URL}/api/orders`,
  checkout: `${API_BASE_URL}/api/orders/checkout`,
  renew: (id: number) => `${API_BASE_URL}/api/orders/renew/${id}`,
  news: `${API_BASE_URL}/api/news`,
};

export const AccessTokenKey = "accessToken";
export const RefreshTokenKey = "refreshToken";
// Store the expiry time so we can proactively refresh before the token expires
const RefreshTokenExpiryKey = "refreshTokenExpiry";

/** Save both tokens after login/register */
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

/** Check whether the stored refresh token is still within its validity window */
export async function isRefreshTokenValid(): Promise<boolean> {
  const expiryStr = await AsyncStorage.getItem(RefreshTokenExpiryKey);
  if (!expiryStr) return false;
  const expiry = Number(expiryStr);
  // Consider expired if within 5 minutes of expiry
  return Date.now() < expiry - 5 * 60 * 1000;
}

/**
 * Try to get a new access token using the stored refresh token.
 * Returns true on success, false if the session has fully expired.
 */
export async function tryRefreshToken(): Promise<boolean> {
  const refreshToken = await AsyncStorage.getItem(RefreshTokenKey);
  if (!refreshToken) return false;

  // Check stored expiry first to avoid unnecessary network calls
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

/**
 * Authenticated fetch with automatic token refresh on 401.
 * Throws "SESSION_EXPIRED" if refresh also fails.
 */
export async function authFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
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

  // Try refresh
  const refreshed = await tryRefreshToken();
  if (!refreshed) {
    throw new Error("SESSION_EXPIRED");
  }

  const newToken = await AsyncStorage.getItem(AccessTokenKey);
  return doFetch(newToken ?? "");
}

/**
 * Call this on app startup / foreground to verify the session is still valid.
 * Returns true if the user is authenticated, false if they need to log in again.
 */
export async function checkAndRefreshSession(): Promise<boolean> {
  const accessToken = await AsyncStorage.getItem(AccessTokenKey);
  if (!accessToken) return false;

  // Decode the JWT to check its expiry
  try {
    const decoded = decodeJwt(accessToken);
    if (!decoded) {
      // Token is malformed — try refresh
      return tryRefreshToken();
    }

    const expSec = decoded.exp ? Number(decoded.exp) : 0;
    const nowSec = Math.floor(Date.now() / 1000);

    // If access token has more than 2 minutes left, we're good
    if (expSec - nowSec > 120) return true;

    // Otherwise try to refresh proactively
    return tryRefreshToken();
  } catch {
    return tryRefreshToken();
  }
}

/** Register a listener that checks the session whenever the app comes to foreground */
let appStateSubscription: ReturnType<typeof AppState.addEventListener> | null =
  null;

export function registerSessionRefreshListener(
  onExpired: () => void,
): () => void {
  // Remove any existing listener
  if (appStateSubscription) {
    appStateSubscription.remove();
  }

  const handleAppStateChange = async (nextState: AppStateStatus) => {
    if (nextState === "active") {
      const stillValid = await checkAndRefreshSession();
      if (!stillValid) {
        await clearTokens();
        onExpired();
      }
    }
  };

  appStateSubscription = AppState.addEventListener(
    "change",
    handleAppStateChange,
  );

  return () => {
    appStateSubscription?.remove();
    appStateSubscription = null;
  };
}

export function decodeJwt(
  token: string,
): Record<string, string | number> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
