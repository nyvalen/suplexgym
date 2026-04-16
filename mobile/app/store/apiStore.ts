// app/store/apiStore.ts
// Single source of truth for the API base URL.
// Reads the persisted IP from AsyncStorage on startup.
// When the user saves a new IP it updates in-memory and on disk immediately.

import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_IP_KEY, DEFAULT_PORT, saveApiIp } from "../utils/offline-storage";

const FALLBACK_IP = "192.168.0.209";

function buildUrl(ip: string) {
  return `http://${ip}:${DEFAULT_PORT}`;
}

interface ApiStore {
  ip: string;
  baseUrl: string;
  initialised: boolean;
  /** Call once on app startup to hydrate from AsyncStorage */
  initialise: () => Promise<void>;
  /**
   * Set a new IP from any source:
   *   - user manual input
   *   - auto-detected from device subnet
   * Persists to AsyncStorage.
   */
  setIp: (ip: string) => Promise<void>;
}

export const useApiStore = create<ApiStore>((set, get) => ({
  ip: FALLBACK_IP,
  baseUrl: buildUrl(FALLBACK_IP),
  initialised: false,

  initialise: async () => {
    if (get().initialised) return;
    const stored = await AsyncStorage.getItem(API_IP_KEY);
    const ip = stored ?? FALLBACK_IP;
    set({ ip, baseUrl: buildUrl(ip), initialised: true });
  },

  setIp: async (ip: string) => {
    const trimmed = ip.trim();
    await saveApiIp(trimmed);
    set({ ip: trimmed, baseUrl: buildUrl(trimmed) });
  },
}));
