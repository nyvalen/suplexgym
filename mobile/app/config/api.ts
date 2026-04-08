const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://10.224.48.186:5103";

export const api_endpoints = {
  login: `${API_BASE_URL}/api/auth/login`,
  register: `${API_BASE_URL}/api/auth/register`,
  refresh: `${API_BASE_URL}/api/auth/refresh`,
  logout: `${API_BASE_URL}/api/auth/logout`,
  user: `${API_BASE_URL}/api/user/profile`,
  password: `${API_BASE_URL}/api/user/change-password`,
  billingaddress: `${API_BASE_URL}/api/user/billing-address`,
  cart: `${API_BASE_URL}/api/cart`,
  news: `${API_BASE_URL}/api/news`,
  orders: `${API_BASE_URL}/api/orders`,
  items: `${API_BASE_URL}/api/items`,
  checkout: `${API_BASE_URL}/api/orders/checkout`,
  renew: `${API_BASE_URL}/api/orders/renew/{purchaseItemId}`,
};
