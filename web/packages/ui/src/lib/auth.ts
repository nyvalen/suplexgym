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

const API_BASE_URL = "http://localhost:5103"

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

    const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
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
// The "first admin" is determined by the lowest user ID among all admin-role
// users. This is a pure frontend guard. The backend should also enforce this.

export interface AdminUserSnapshot {
  id: number
  role: string
  isActive: boolean
}

/**
 * Given the full user list (already fetched), returns the id of the
 * "founding admin" — the admin account with the lowest id.
 */
export function getFoundingAdminId(users: AdminUserSnapshot[]): number | null {
  const admins = users.filter((u) => u.role === "admin")
  if (admins.length === 0) return null
  return admins.reduce((min, u) => (u.id < min ? u.id : min), admins[0].id)
}

/**
 * Returns true when the proposed action would be blocked for the founding admin:
 * - Changing their role away from "admin"
 * - Deactivating their account
 */
export function isProtectedAction(
  userId: number,
  foundingAdminId: number | null,
  action: "role-change" | "deactivate"
): boolean {
  if (foundingAdminId === null) return false
  if (userId !== foundingAdminId) return false
  return action === "role-change" || action === "deactivate"
}
