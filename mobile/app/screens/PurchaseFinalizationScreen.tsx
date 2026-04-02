import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authFetch } from "../utils/auth";
import { api_endpoints } from "../config/api";
import type { CartItem } from "./PurchaseTicketsScreen";

const C = {
  bg: "#0D1117",
  surface: "#161B22",
  surfaceHigh: "#21262D",
  border: "#30363D",
  text: "#F0F6FC",
  textSub: "#8B949E",
  textMuted: "#6E7681",
  accent: "#C4873A",
  green: "#3FB950",
  danger: "#DA3633",
};

const CATEGORY_COLORS: Record<string, string> = {
  daily: "#C4873A",
  monthly: "#5B8A6E",
  yearly: "#8B5BA6",
};
const TYPE_MAP: Record<number, string> = {
  1: "daily",
  2: "monthly",
  3: "yearly",
};

function QuantityControl({
  qty,
  onInc,
  onDec,
}: {
  qty: number;
  onInc: () => void;
  onDec: () => void;
}) {
  return (
    <View style={styles.qtyRow}>
      <TouchableOpacity
        style={styles.qtyBtn}
        onPress={onDec}
        activeOpacity={0.8}
      >
        <Text style={styles.qtyBtnText}>−</Text>
      </TouchableOpacity>
      <Text style={styles.qtyValue}>{qty}</Text>
      <TouchableOpacity
        style={styles.qtyBtn}
        onPress={onInc}
        activeOpacity={0.8}
      >
        <Text style={styles.qtyBtnText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function PurchaseFinalizationScreen({ route }: any) {
  const navigation = useNavigation();
  const rawCart: CartItem[] = route?.params?.cart ?? [];
  const [cart, setCart] = useState<CartItem[]>(rawCart);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const inc = (itemId: number) =>
    setCart((prev) =>
      prev.map((c) =>
        c.itemId === itemId ? { ...c, quantity: c.quantity + 1 } : c,
      ),
    );

  const dec = (itemId: number) =>
    setCart((prev) =>
      prev
        .map((c) =>
          c.itemId === itemId ? { ...c, quantity: c.quantity - 1 } : c,
        )
        .filter((c) => c.quantity > 0),
    );

  const showSuccess = () => {
    setSuccess(true);
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => {
      navigation.navigate("NavTabs" as never, { screen: "Jegyek" } as never);
    }, 2200);
  };

  const checkout = async () => {
    if (cart.length === 0 || loading) return;
    setLoading(true);
    try {
      // Build the correct request body — array of { itemId, quantity }
      const orderItems = cart.map((c) => ({
        itemId: c.itemId,
        quantity: c.quantity,
      }));

      const res = await authFetch(api_endpoints.checkout, {
        method: "POST",
        body: JSON.stringify({ items: orderItems }),
      });

      if (res.ok) {
        showSuccess();
      } else {
        const err = await res.json().catch(() => ({}));
        console.error("Checkout error:", err);
        alert(err?.message ?? "Hiba történt a fizetés során. Próbáld újra.");
      }
    } catch (e) {
      console.error(e);
      alert("Hálózati hiba. Kérjük próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View style={[styles.root, styles.successRoot]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <Animated.View
          style={{
            transform: [{ scale: successScale }],
            opacity: successOpacity,
            alignItems: "center",
          }}
        >
          <View style={styles.successIcon}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Sikeres vásárlás!</Text>
          <Text style={styles.successSub}>
            {totalItems} db jegy hozzáadva a fiókodhoz
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← Vissza</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rendelés összesítő</Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Items */}
        {cart.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>A kosarad üres</Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.emptyBtn}
            >
              <Text style={styles.emptyBtnText}>Böngészés</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>TÉTELEK</Text>
            {cart.map((item) => {
              const cat = TYPE_MAP[item.type_id] ?? "daily";
              const color = CATEGORY_COLORS[cat] ?? C.accent;
              return (
                <View key={item.itemId} style={styles.orderItem}>
                  <View
                    style={[styles.orderItemAccent, { backgroundColor: color }]}
                  />
                  <View style={styles.orderItemBody}>
                    <Text style={styles.orderItemName}>{item.name}</Text>
                    <Text style={styles.orderItemSub}>
                      {item.price.toLocaleString()} Ft / db ·{" "}
                      {item.validityDays} nap
                    </Text>
                  </View>
                  <View style={styles.orderItemRight}>
                    <QuantityControl
                      qty={item.quantity}
                      onInc={() => inc(item.itemId)}
                      onDec={() => dec(item.itemId)}
                    />
                    <Text style={styles.orderItemTotal}>
                      {(item.price * item.quantity).toLocaleString()} Ft
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Summary */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tételek száma</Text>
                <Text style={styles.summaryValue}>{totalItems} db</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Összesen</Text>
                <Text style={styles.summaryTotalValue}>
                  {total.toLocaleString()} Ft
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      {/* Pay button */}
      {cart.length > 0 && (
        <View style={styles.payRow}>
          <TouchableOpacity
            style={[styles.payBtn, loading && styles.payBtnDisabled]}
            onPress={checkout}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.payBtnLabel}>Fizetés</Text>
                <Text style={styles.payBtnAmount}>
                  {total.toLocaleString()} Ft
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  successRoot: { alignItems: "center", justifyContent: "center" },

  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  backBtn: { marginBottom: 12 },
  backBtnText: { color: C.accent, fontSize: 15, fontWeight: "600" },
  headerTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
  },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 120 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1,
    marginBottom: 12,
  },

  orderItem: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    overflow: "hidden",
    marginBottom: 10,
  },
  orderItemAccent: { width: 4 },
  orderItemBody: { flex: 1, padding: 14 },
  orderItemName: { fontSize: 15, fontWeight: "700", color: C.text },
  orderItemSub: { fontSize: 12, color: C.textSub, marginTop: 3 },
  orderItemRight: {
    padding: 14,
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  orderItemTotal: { fontSize: 14, fontWeight: "700", color: C.text },

  qtyRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: C.surfaceHigh,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyBtnText: {
    color: C.text,
    fontSize: 16,
    fontWeight: "600",
    lineHeight: 20,
  },
  qtyValue: {
    fontSize: 15,
    fontWeight: "700",
    color: C.text,
    minWidth: 20,
    textAlign: "center",
  },

  summaryBox: {
    backgroundColor: C.surface,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginTop: 16,
    gap: 10,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14, color: C.textSub },
  summaryValue: { fontSize: 14, color: C.text, fontWeight: "600" },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    marginTop: 2,
  },
  summaryTotalLabel: { fontSize: 16, fontWeight: "700", color: C.text },
  summaryTotalValue: { fontSize: 20, fontWeight: "800", color: C.accent },

  payRow: {
    position: "absolute",
    bottom: 24,
    left: 20,
    right: 20,
  },
  payBtn: {
    backgroundColor: C.accent,
    borderRadius: 18,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: C.accent,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 12,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnLabel: { fontSize: 17, fontWeight: "700", color: "#fff" },
  payBtnAmount: { fontSize: 17, fontWeight: "800", color: "#fff" },

  emptyBox: { alignItems: "center", marginTop: 80, gap: 16 },
  emptyText: { fontSize: 18, color: C.textSub },
  emptyBtn: {
    backgroundColor: C.accent,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  successIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: C.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
    shadowColor: C.green,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 12,
  },
  successCheck: { fontSize: 48, color: "#fff" },
  successTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: C.text,
    marginBottom: 8,
  },
  successSub: { fontSize: 15, color: C.textSub },
});
