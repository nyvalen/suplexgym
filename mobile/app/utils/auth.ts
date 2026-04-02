import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_endpoints } from "../config/api";

/**
 * Makes an authenticated fetch request.
 * On 401, attempts a token refresh once, then retries.
 * If refresh fails, clears storage (forces re-login).
 */
export async function authFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = await AsyncStorage.getItem("accessToken");

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

  // ── Token expired: try to refresh ────────────────────────────────────────
  const refreshToken = await AsyncStorage.getItem("refreshToken");
  if (!refreshToken) {
    await clearTokens();
    throw new Error("SESSION_EXPIRED");
  }

  const refreshRes = await fetch(api_endpoints.refresh, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
  });

  if (!refreshRes.ok) {
    await clearTokens();
    throw new Error("SESSION_EXPIRED");
  }

  const { accessToken, refreshToken: newRefresh } = await refreshRes.json();
  await AsyncStorage.setItem("accessToken", accessToken);
  if (newRefresh) await AsyncStorage.setItem("refreshToken", newRefresh);

  // Retry original request with new token
  res = await doFetch(accessToken);
  return res;
}

export async function clearTokens() {
  await AsyncStorage.multiRemove(["accessToken", "refreshToken"]);
}

/** Save both tokens after login */
export async function saveTokens(accessToken: string, refreshToken: string) {
  await AsyncStorage.multiSet([
    ["accessToken", accessToken],
    ["refreshToken", refreshToken],
  ]);
}
