/**
 * PurchaseTicketsScreen
 *
 * PURCHASE FLOW (FIXED):
 * 1. User taps + on a ticket card
 * 2. We call POST /api/cart/add  { item_id, quantity } so the server cart is authoritative
 * 3. Local state mirrors the server cart for UI
 * 4. "Fizetés →" button navigates to PurchaseFinalizationScreen
 * 5. PurchaseFinalizationScreen calls POST /api/orders/checkout (server reads its own cart)
 */
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, Animated, StatusBar, ActivityIndicator, ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authFetch, ENDPOINTS } from "../utils/auth";

// ── Types ─────────────────────────────────────────────────────────────────────
interface TicketItem {
  id: number;
  name: string;
  description: string;
  price: number;
  validityDays: number;
  typeName: string;
  type_id: number;
}

export interface CartItem {
  itemId: number;
  name: string;
  price: number;
  validityDays: number;
  typeName: string;
  type_id: number;
  quantity: number;
}

type Category = "all" | "daily" | "monthly" | "yearly";
const TYPE_MAP: Record<number, Category> = { 1: "daily", 2: "monthly", 3: "yearly" };
const CATEGORY_LABELS: Record<Category, string> = { all: "Összes", daily: "Napi", monthly: "Havi", yearly: "Éves" };
const CATEGORY_COLORS: Record<Category, string> = {
  all: "#5B7FA6", daily: "#C4873A", monthly: "#5B8A6E", yearly: "#8B5BA6",
};

const C = {
  bg: "#0D1117", surface: "#161B22", surfaceHigh: "#21262D",
  border: "#30363D", text: "#F0F6FC", textSub: "#8B949E",
  textMuted: "#6E7681", accent: "#C4873A",
};

// ── Category chip ─────────────────────────────────────────────────────────────
function CategoryChip({ cat, active, onPress }: { cat: Category; active: boolean; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.92, duration: 70, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={press} activeOpacity={0.85}
        style={[styles.chip, active
          ? { backgroundColor: CATEGORY_COLORS[cat], borderColor: CATEGORY_COLORS[cat] }
          : { backgroundColor: C.surfaceHigh, borderColor: C.border }]}>
        <Text style={[styles.chipText, { color: active ? "#fff" : C.textSub }]}>
          {CATEGORY_LABELS[cat]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Ticket card ───────────────────────────────────────────────────────────────
function TicketCard({
  item, qty, onAdd, adding,
}: { item: TicketItem; qty: number; onAdd: () => void; adding: boolean }) {
  const cat: Category = TYPE_MAP[item.type_id] ?? "all";
  const color = CATEGORY_COLORS[cat];
  return (
    <View style={styles.card}>
      <View style={[styles.cardStripe, { backgroundColor: color }]} />
      <View style={styles.cardBody}>
        <View style={styles.cardTop}>
          <View style={styles.cardBadge}>
            <Text style={[styles.cardBadgeText, { color }]}>{CATEGORY_LABELS[cat].toUpperCase()}</Text>
          </View>
          <Text style={styles.cardPrice}>{item.price.toLocaleString("hu-HU")} Ft</Text>
        </View>
        <Text style={styles.cardName}>{item.name}</Text>
        <Text style={styles.cardDesc} numberOfLines={2}>
          {item.description || `Érvényes ${item.validityDays} napig`}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={styles.cardDays}>⏱ {item.validityDays} nap</Text>
          <TouchableOpacity onPress={onAdd} disabled={adding}
            activeOpacity={0.85} style={[styles.addBtn, { backgroundColor: color, opacity: adding ? 0.6 : 1 }]}>
            {qty > 0 && (
              <View style={styles.addBtnBadge}>
                <Text style={styles.addBtnBadgeText}>{qty}</Text>
              </View>
            )}
            {adding
              ? <ActivityIndicator size="small" color="#fff" />
              : <Text style={styles.addBtnText}>+</Text>
            }
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ── Floating cart bar ─────────────────────────────────────────────────────────
function CartBar({ cart, onCheckout }: { cart: CartItem[]; onCheckout: () => void }) {
  const translateY = useRef(new Animated.Value(100)).current;
  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s, i) => s + i.quantity, 0);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: cart.length > 0 ? 0 : 100, useNativeDriver: true, tension: 80, friction: 12,
    }).start();
  }, [cart.length]);

  return (
    <Animated.View style={[styles.cartBar, { transform: [{ translateY }] }]}
      pointerEvents={cart.length > 0 ? "auto" : "none"}>
      <View>
        <Text style={styles.cartLabel}>KOSÁR ÖSSZESEN</Text>
        <Text style={styles.cartTotal}>{total.toLocaleString("hu-HU")} Ft</Text>
      </View>
      <TouchableOpacity onPress={onCheckout} style={styles.cartBtn} activeOpacity={0.85}>
        <View style={styles.cartBtnBadge}>
          <Text style={styles.cartBtnBadgeText}>{count}</Text>
        </View>
        <Text style={styles.cartBtnText}>Fizetés →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ── Main screen ───────────────────────────────────────────────────────────────
export default function PurchaseTicketsScreen() {
  const [items, setItems]     = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [cart, setCart]       = useState<CartItem[]>([]);
  const [adding, setAdding]   = useState<Record<number, boolean>>({});
  const navigation = useNavigation();

  // Load items
  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(ENDPOINTS.items);
        if (res.ok) setItems(await res.json());
      } catch (e) { console.error("fetchItems:", e); }
      finally { setLoading(false); }
    })();
  }, []);

  // Add to BOTH server cart and local state
  const addToCart = useCallback(async (item: TicketItem) => {
    if (adding[item.id]) return;
    setAdding(prev => ({ ...prev, [item.id]: true }));
    try {
      const res = await authFetch(ENDPOINTS.cartAdd, {
        method: "POST",
        body: JSON.stringify({ item_id: item.id, quantity: 1 }),
      });
      if (res.ok) {
        setCart(prev => {
          const existing = prev.find(c => c.itemId === item.id);
          if (existing) return prev.map(c => c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c);
          return [...prev, {
            itemId: item.id, name: item.name, price: item.price,
            validityDays: item.validityDays, typeName: item.typeName,
            type_id: item.type_id, quantity: 1,
          }];
        });
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("addToCart error:", err.message);
      }
    } catch (e) { console.error("addToCart:", e); }
    finally { setAdding(prev => ({ ...prev, [item.id]: false })); }
  }, [adding]);

  const cartQty = (id: number) => cart.find(c => c.itemId === id)?.quantity ?? 0;

  const filtered = items.filter(item => {
    const catMatch = category === "all" || TYPE_MAP[item.type_id] === category;
    const q = search.toLowerCase();
    const searchMatch = !q || item.name.toLowerCase().includes(q)
      || (item.description ?? "").toLowerCase().includes(q);
    return catMatch && searchMatch;
  });

  const goCheckout = () => {
    if (cart.length === 0) return;
    // Pass cart for display only — checkout reads server-side cart
    navigation.navigate("PurchaseFinalization" as never, { cart } as never);
  };

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jegyvásárlás</Text>
        <Text style={styles.headerSub}>Válassz bérletet vagy belépőt</Text>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput} placeholder="Keresés..."
          placeholderTextColor={C.textMuted} value={search} onChangeText={setSearch}
        />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}
        style={styles.chipRow} contentContainerStyle={styles.chipRowContent}>
        {(["all", "daily", "monthly", "yearly"] as Category[]).map(cat => (
          <CategoryChip key={cat} cat={cat} active={category === cat} onPress={() => setCategory(cat)} />
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ flex: 1 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => String(i.id)}
          renderItem={({ item }) => (
            <TicketCard
              item={item}
              qty={cartQty(item.id)}
              adding={!!adding[item.id]}
              onAdd={() => addToCart(item)}
            />
          )}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Nincs találat</Text>}
        />
      )}

      <CartBar cart={cart} onCheckout={goCheckout} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 12 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 14, color: C.textSub, marginTop: 2 },
  searchRow: { paddingHorizontal: 20, paddingBottom: 12 },
  searchInput: {
    backgroundColor: C.surfaceHigh, borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    color: C.text, fontSize: 15,
  },
  chipRow: { flexGrow: 0, paddingBottom: 12 },
  chipRowContent: { paddingHorizontal: 20, gap: 8, flexDirection: "row" },
  chip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontWeight: "600" },
  listContent: { paddingHorizontal: 20, paddingBottom: 130, gap: 12 },
  card: {
    backgroundColor: C.surface, borderRadius: 16,
    borderWidth: 1, borderColor: C.border,
    flexDirection: "row", overflow: "hidden",
  },
  cardStripe: { width: 4 },
  cardBody: { flex: 1, padding: 16, gap: 6 },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardBadge: { backgroundColor: C.surfaceHigh, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  cardBadgeText: { fontSize: 10, fontWeight: "700", letterSpacing: 0.5 },
  cardPrice: { fontSize: 16, fontWeight: "700", color: C.text },
  cardName: { fontSize: 17, fontWeight: "700", color: C.text },
  cardDesc: { fontSize: 13, color: C.textSub, lineHeight: 18 },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  cardDays: { fontSize: 12, color: C.textMuted },
  addBtn: {
    width: 36, height: 36, borderRadius: 10,
    alignItems: "center", justifyContent: "center", position: "relative",
  },
  addBtnBadge: {
    position: "absolute", top: -6, right: -6,
    backgroundColor: "#DA3633", width: 18, height: 18, borderRadius: 9,
    alignItems: "center", justifyContent: "center", zIndex: 1,
  },
  addBtnBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  addBtnText: { color: "#fff", fontSize: 22, fontWeight: "400", lineHeight: 26 },
  emptyText: { textAlign: "center", color: C.textSub, marginTop: 60, fontSize: 15 },
  cartBar: {
    position: "absolute", bottom: 24, left: 20, right: 20,
    backgroundColor: C.accent, borderRadius: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 16, paddingHorizontal: 20,
    shadowColor: C.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 16,
  },
  cartLabel: { fontSize: 11, color: "rgba(255,255,255,0.7)", fontWeight: "600", letterSpacing: 0.5 },
  cartTotal: { fontSize: 20, fontWeight: "800", color: "#fff" },
  cartBtn: {
    backgroundColor: "rgba(0,0,0,0.25)", borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 10,
    flexDirection: "row", alignItems: "center", gap: 8,
  },
  cartBtnBadge: {
    backgroundColor: "#fff", width: 22, height: 22,
    borderRadius: 11, alignItems: "center", justifyContent: "center",
  },
  cartBtnBadgeText: { color: C.accent, fontSize: 12, fontWeight: "800" },
  cartBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
