// app/store/offlineTicketStore.ts
import { create } from "zustand";
import { OfflineTicket } from "../utils/offline-storage";

interface OfflineTicketStore {
  selectedTicket: OfflineTicket | null;
  setSelectedTicket: (ticket: OfflineTicket) => void;
  clearSelectedTicket: () => void;
}

export const useOfflineTicketStore = create<OfflineTicketStore>((set) => ({
  selectedTicket: null,
  setSelectedTicket: (ticket) => set({ selectedTicket: ticket }),
  clearSelectedTicket: () => set({ selectedTicket: null }),
}));
