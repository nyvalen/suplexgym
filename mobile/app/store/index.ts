import { create } from "zustand";

// ─── News ─────────────────────────────────────────────────────────────────────

export interface NewsArticle {
  id: number;
  title: string;
  content: string;
  imagePath: string;
  createdAt?: string;
}

interface NewsStore {
  selectedArticle: NewsArticle | null;
  setSelectedArticle: (article: NewsArticle) => void;
  clearSelectedArticle: () => void;
}

export const useNewsStore = create<NewsStore>((set) => ({
  selectedArticle: null,
  setSelectedArticle: (article) => set({ selectedArticle: article }),
  clearSelectedArticle: () => set({ selectedArticle: null }),
}));

// ─── Tickets ──────────────────────────────────────────────────────────────────

export interface TicketItem {
  id: number;
  itemName: string;
  qrCodeBase64: string;
  activatedAt: string;
  expiresAt: string;
  isUsed: boolean;
  quantity: number;
  price: number;
}

interface TicketStore {
  selectedTicket: TicketItem | null;
  selectedOrderId: number | null;
  setSelectedTicket: (ticket: TicketItem, orderId: number) => void;
  clearSelectedTicket: () => void;
}

export const useTicketStore = create<TicketStore>((set) => ({
  selectedTicket: null,
  selectedOrderId: null,
  setSelectedTicket: (ticket, orderId) =>
    set({ selectedTicket: ticket, selectedOrderId: orderId }),
  clearSelectedTicket: () =>
    set({ selectedTicket: null, selectedOrderId: null }),
}));

// ─── Cart ─────────────────────────────────────────────────────────────────────

export interface CartItem {
  itemId: number;
  name: string;
  price: number;
  validityDays: number;
  typeName: string;
  type_id: number;
  quantity: number;
}

interface CartStore {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addItem: (item: CartItem) => void;
  removeItem: (itemId: number) => void;
  decrementItem: (itemId: number) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  cart: [],
  setCart: (cart) => set({ cart }),
  addItem: (item) =>
    set((state) => {
      const existing = state.cart.find((c) => c.itemId === item.itemId);
      if (existing) {
        return {
          cart: state.cart.map((c) =>
            c.itemId === item.itemId
              ? { ...c, quantity: c.quantity + 1 }
              : c,
          ),
        };
      }
      return { cart: [...state.cart, item] };
    }),
  removeItem: (itemId) =>
    set((state) => ({ cart: state.cart.filter((c) => c.itemId !== itemId) })),
  decrementItem: (itemId) =>
    set((state) => {
      const existing = state.cart.find((c) => c.itemId === itemId);
      if (!existing) return state;
      if (existing.quantity <= 1) {
        return { cart: state.cart.filter((c) => c.itemId !== itemId) };
      }
      return {
        cart: state.cart.map((c) =>
          c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c,
        ),
      };
    }),
  clearCart: () => set({ cart: [] }),
}));
