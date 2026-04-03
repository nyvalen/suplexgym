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
    localStorage.removeItem("accessToken")
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

export const fetchWithAuth = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  let accessToken = authTokens.getAccessToken()

  if (!accessToken) {
    throw new Error("No authentication token available. Please log in.")
  }

  const headers = new Headers(options.headers || {})
  headers.set("Authorization", `Bearer ${accessToken}`)
  headers.set("Content-Type", "application/json")

  let response = await fetch(url, { ...options, headers })

  // If 401, try to refresh token and retry
  if (response.status === 401) {
    const refreshed = await refreshAccessToken()
    if (!refreshed) {
      throw new Error("Session expired. Please log in again.")
    }

    accessToken = authTokens.getAccessToken()
    if (!accessToken) {
      throw new Error("Failed to refresh token. Please log in again.")
    }

    const retryHeaders = new Headers(options.headers || {})
    retryHeaders.set("Authorization", `Bearer ${accessToken}`)
    retryHeaders.set("Content-Type", "application/json")

    response = await fetch(url, { ...options, headers: retryHeaders })
  }

  return response
}
