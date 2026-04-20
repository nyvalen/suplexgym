// web/packages/ui/src/lib/api-config.ts
// Central API configuration for the web app.
// Mirrors the mobile app's dev IP approach — stores the server IP in
// localStorage so the web app works from any machine on the same network.

export const DEFAULT_PORT = "5103"
export const API_IP_KEY = "web_server_ip"

let _cachedBase: string | null = null

function buildUrl(ip: string): string {
  return `http://${ip}:${DEFAULT_PORT}`
}

export function getCachedApiBase(): string {
  if (_cachedBase) return _cachedBase
  const stored = localStorage.getItem(API_IP_KEY)
  if (stored) {
    _cachedBase = buildUrl(stored)
    return _cachedBase
  }
  // Fallback: same host as the web app (works when API and web are on the same machine)
  _cachedBase = `http://${window.location.hostname}:${DEFAULT_PORT}`
  return _cachedBase
}

export function setApiIp(ip: string): void {
  const trimmed = ip.trim()
  localStorage.setItem(API_IP_KEY, trimmed)
  _cachedBase = buildUrl(trimmed)
}

export function getStoredApiIp(): string {
  return localStorage.getItem(API_IP_KEY) ?? window.location.hostname
}

export function resolveImageUrl(path: string | null | undefined): string {
  if (!path) return ""
  // Strip any hardcoded localhost prefix (legacy data)
  if (path.startsWith("http://localhost:5103")) {
    path = path.replace("http://localhost:5103", "")
  }
  if (path.startsWith("http://") || path.startsWith("https://")) return path
  return `${getCachedApiBase()}${path}`
}

export const API_ENDPOINTS = {
  get login() { return `${getCachedApiBase()}/api/auth/login` },
  get register() { return `${getCachedApiBase()}/api/auth/register` },
  get refresh() { return `${getCachedApiBase()}/api/auth/refresh` },
  get logout() { return `${getCachedApiBase()}/api/auth/logout` },
  get news() { return `${getCachedApiBase()}/api/news` },
  get items() { return `${getCachedApiBase()}/api/items` },
  get itemTypes() { return `${getCachedApiBase()}/api/items/types` },
  get orders() { return `${getCachedApiBase()}/api/orders` },
  get checkout() { return `${getCachedApiBase()}/api/orders/checkout` },
  get cart() { return `${getCachedApiBase()}/api/cart` },
  get cartAdd() { return `${getCachedApiBase()}/api/cart/add` },
  get cartClear() { return `${getCachedApiBase()}/api/cart/clear` },
  cartItem: (id: number) => `${getCachedApiBase()}/api/cart/item/${id}`,
  renew: (id: number) => `${getCachedApiBase()}/api/orders/renew/${id}`,
  get user() { return `${getCachedApiBase()}/api/user/profile` },
  get password() { return `${getCachedApiBase()}/api/user/change-password` },
  get billing() { return `${getCachedApiBase()}/api/user/billing-address` },
  get settings() { return `${getCachedApiBase()}/api/user/settings` },
  get upload() { return `${getCachedApiBase()}/api/upload` },
  // Admin
  get adminUsers() { return `${getCachedApiBase()}/api/admin/users` },
  get adminRoles() { return `${getCachedApiBase()}/api/admin/roles` },
  get adminItems() { return `${getCachedApiBase()}/api/admin/items` },
  get adminEquipment() { return `${getCachedApiBase()}/api/admin/equipment` },
  // Discounts & Deals
  get deals() { return `${getCachedApiBase()}/api/deals` },
  get adminDeals() { return `${getCachedApiBase()}/api/admin/deals` },
}
