// app/utils/offline-storage.ts

import AsyncStorage from "@react-native-async-storage/async-storage";

const OFFLINE_TICKETS_KEY = "offline_tickets";
export const API_IP_KEY = "api_ip_address";
export const DEFAULT_PORT = "5001";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface OfflineTicket {
  id: number;
  itemName: string;
  qrCodeBase64: string;
  activatedAt: string;
  expiresAt: string;
  isUsed: boolean;
  quantity: number;
  price: number;
  orderId: number;
  savedAt: string;
}

// ─── Expired ticket cleanup ───────────────────────────────────────────────────
// Rules:
//   - Keep at most 10 expired tickets (good for visual history)
//   - Hard-delete anything expired for more than 90 days

const MAX_EXPIRED_KEPT = 10;
const EXPIRED_TTL_MS = 90 * 24 * 60 * 60 * 1000; // 90 days

function pruneExpired(tickets: OfflineTicket[]): OfflineTicket[] {
  const now = Date.now();
  const active = tickets.filter((t) => new Date(t.expiresAt).getTime() > now);
  let expired = tickets.filter((t) => new Date(t.expiresAt).getTime() <= now);

  // Hard-delete anything expired for >90 days
  expired = expired.filter(
    (t) => now - new Date(t.expiresAt).getTime() < EXPIRED_TTL_MS,
  );

  // Sort most-recently-expired first, keep top MAX_EXPIRED_KEPT
  expired.sort(
    (a, b) => new Date(b.expiresAt).getTime() - new Date(a.expiresAt).getTime(),
  );
  expired = expired.slice(0, MAX_EXPIRED_KEPT);

  return [...active, ...expired];
}

// ─── Ticket Storage ───────────────────────────────────────────────────────────

export async function saveTicketsOffline(
  tickets: OfflineTicket[],
): Promise<void> {
  try {
    const existing = await getOfflineTickets();
    const map = new Map(existing.map((t) => [t.id, t]));
    for (const ticket of tickets) {
      map.set(ticket.id, { ...ticket, savedAt: new Date().toISOString() });
    }
    const pruned = pruneExpired(Array.from(map.values()));
    await AsyncStorage.setItem(OFFLINE_TICKETS_KEY, JSON.stringify(pruned));
  } catch (e) {
    console.warn("Failed to save tickets offline:", e);
  }
}

export async function getOfflineTickets(): Promise<OfflineTicket[]> {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_TICKETS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as OfflineTicket[];
    const pruned = pruneExpired(parsed);
    if (pruned.length !== parsed.length) {
      await AsyncStorage.setItem(OFFLINE_TICKETS_KEY, JSON.stringify(pruned));
    }
    return pruned;
  } catch {
    return [];
  }
}

export async function clearOfflineTickets(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_TICKETS_KEY);
}

// ─── API IP helpers ───────────────────────────────────────────────────────────

export async function saveApiIp(ip: string): Promise<void> {
  await AsyncStorage.setItem(API_IP_KEY, ip.trim());
}

export async function getApiIp(): Promise<string | null> {
  return AsyncStorage.getItem(API_IP_KEY);
}

/**
 * Given the device's own LAN IP, return the /24 subnet prefix.
 * e.g. "192.168.0.47" → "192.168.0."
 * The user only has to confirm/change the last octet for their laptop.
 */
export function subnetPrefix(deviceIp: string): string {
  const parts = deviceIp.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.${parts[2]}.`;
  return "";
}
