import { API_ENDPOINTS } from "./api-config"

export interface AuthTokens {
  accessToken: string
  refreshToken: string
}

export interface RefreshResponse {
  accessToken: string
  refreshToken: string
  role: string
  userId: number
  username: string
}

export const authTokens = {
  getAccessToken: () => localStorage.getItem("accessToken"),
  getRefreshToken: () => localStorage.getItem("refreshToken"),
  setTokens: (accessToken: string, refreshToken: string) => {
    localStorage.setItem("accessToken", accessToken)
    localStorage.setItem("refreshToken", refreshToken)
  },
  clearTokens: () => {
    localStorage.setItem("accessToken", "")
    localStorage.removeItem("refreshToken")
  },
}

export const refreshAccessToken = async (): Promise<boolean> => {
  try {
    const refreshToken = authTokens.getRefreshToken()
    if (!refreshToken) {
      authTokens.clearTokens()
      return false
    }

    const response = await fetch(API_ENDPOINTS.refresh, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) {
      authTokens.clearTokens()
      return false
    }

    const data = (await response.json()) as RefreshResponse
    authTokens.setTokens(data.accessToken, data.refreshToken)
    return true
  } catch (error) {
    console.error("Token refresh failed:", error)
    authTokens.clearTokens()
    return false
  }
}

/** Wrapper around fetch that injects the Authorization header automatically */
export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  return fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${authTokens.getAccessToken()}`,
      ...options.headers,
    },
  })
}

// ─── First-admin failsafe ─────────────────────────────────────────────────────

export interface AdminUserSnapshot {
  id: number
  role: string
  isActive: boolean
}

export function getFoundingAdminId(users: AdminUserSnapshot[]): number | null {
  const admins = users.filter((u) => u.role === "admin")
  if (admins.length === 0) return null
  return admins.reduce((min, u) => (u.id < min ? u.id : min), admins[0].id)
}

export function isProtectedAction(
  userId: number,
  foundingAdminId: number | null,
  action: "role-change" | "deactivate"
): boolean {
  if (foundingAdminId === null) return false
  if (userId !== foundingAdminId) return false
  return action === "role-change" || action === "deactivate"
}
