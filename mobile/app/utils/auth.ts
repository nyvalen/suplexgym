import AsyncStorage from "@react-native-async-storage/async-storage";

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://172.20.10.2:5103";

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

/** Save both tokens after login/register */
export async function saveTokens(access: string, refresh: string) {
  await AsyncStorage.multiSet([
    [AccessTokenKey, access],
    [RefreshTokenKey, refresh],
  ]);
}

export async function clearTokens() {
  await AsyncStorage.multiRemove([AccessTokenKey, RefreshTokenKey]);
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
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) {
    await clearTokens();
    throw new Error("SESSION_EXPIRED");
  }

  const refreshRes = await fetch(ENDPOINTS.refresh, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshRes.ok) {
    await clearTokens();
    throw new Error("SESSION_EXPIRED");
  }

  const { accessToken, refreshToken: newRefresh } = await refreshRes.json();
  await saveTokens(accessToken, newRefresh || refreshToken);

  return doFetch(accessToken);
}

export function decodeJwt(token: string): Record<string, string> | null {
  try {
    const payload = token.split(".")[1];
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}
