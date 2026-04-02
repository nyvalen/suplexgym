/**
 * PurchaseFinalizationScreen
 *
 * Displays the cart for review, then calls POST /api/orders/checkout
 * The backend reads the authenticated user's server-side cart and creates the order.
 * CheckoutDto only needs { BillingAddressId? } — the body is optional.
 */
import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Animated, ActivityIndicator, StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authFetch, ENDPOINTS } from "../utils/auth";
import type { CartItem } from "./PurchaseTicketsScreen";

const C = {
  bg: "#0D1117", surface: "#161B22", surfaceHigh: "#21262D",
  border: "#30363D", text: "#F0F6FC", textSub: "#8B949E",
  textMuted: "#6E7681", accent: "#C4873A",
  green: "#3FB950", danger: "#DA3633",
};

const CATEGORY_COLORS: Record<number, string> = {
  1: "#C4873A", 2: "#5B8A6E", 3: "#8B5BA6",
};

export default function PurchaseFinalizationScreen({ route }: any) {
  const navigation = useNavigation();
  const cart: CartItem[] = route?.params?.cart ?? [];
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [errMsg, setErrMsg]     = useState("");

  const successScale   = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const total      = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const showSuccess = () => {
    setSuccess(true);
    Animated.parallel([
      Animated.spring(successScale,   { toValue: 1, useNativeDriver: true, tension: 60, friction: 8 }),
      Animated.timing(successOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
    ]).start();
    // Navigate to tickets tab after 2 s
    setTimeout(() => {
      navigation.navigate("NavTabs" as never, { screen: "Jegyek" } as never);
    }, 2200);
  };

  const handleCheckout = async () => {
    if (loading || cart.length === 0) return;
    setErrMsg("");
    setLoading(true);
    try {
      /**
       * The backend CheckoutDto is just { BillingAddressId?: int? }
       * Items come from the server-side cart — no need to send them.
       * We send an empty body (or null billingAddressId).
       */
      const res = await authFetch(ENDPOINTS.checkout, {
        method: "POST",
        body: JSON.stringify({}),
      });

      if (res.ok) {
        showSuccess();
      } else {
        const err = await res.json().catch(() => ({}));
        setErrMsg(err?.message ?? "Hiba a fizetés során. Próbáld újra.");
      }
    } catch (e: any) {
      console.error("checkout error:", e);
      setErrMsg(
        e?.message === "SESSION_EXPIRED"
          ? "Lejárt a munkamenet. Kérjük jelentkezz be újra."
          : "Hálózati hiba. Kérjük próbáld újra."
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    return (
      <View style={[styles.root, styles.successRoot]}>
        <StatusBar barStyle="light-content" backgroundColor={C.bg} />
        <Animated.View style={{ transform: [{ scale: successScale }], opacity: successOpacity, alignItems: "center" }}>
          <View style={styles.successIcon}><Text style={styles.successCheck}>✓</Text></View>
          <Text style={styles.successTitle}>Sikeres vásárlás!</Text>
          <Text style={styles.successSub}>{totalItems} db jegy hozzáadva a fiókodhoz</Text>
        </Animated.View>
      </View>
    );
  }

  // ── Main screen ─────────────────────────────────────────────────────────────
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Vissza</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rendelés összesítő</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>

        {cart.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>A kosarad üres</Text>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.emptyBtn}>
              <Text style={styles.emptyBtnText}>Böngészés</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.sectionLabel}>TÉTELEK</Text>
            {cart.map(item => (
              <View key={item.itemId} style={styles.orderItem}>
                <View style={[styles.orderItemAccent, { backgroundColor: CATEGORY_COLORS[item.type_id] ?? C.accent }]} />
                <View style={styles.orderItemBody}>
                  <Text style={styles.orderItemName}>{item.name}</Text>
                  <Text style={styles.orderItemSub}>
                    {item.price.toLocaleString("hu-HU")} Ft / db · {item.validityDays} nap
                  </Text>
                </View>
                <View style={styles.orderItemRight}>
                  <Text style={styles.orderItemQty}>× {item.quantity}</Text>
                  <Text style={styles.orderItemTotal}>
                    {(item.price * item.quantity).toLocaleString("hu-HU")} Ft
                  </Text>
                </View>
              </View>
            ))}

            {/* Summary */}
            <View style={styles.summaryBox}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tételek száma</Text>
                <Text style={styles.summaryValue}>{totalItems} db</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Összesen</Text>
                <Text style={styles.summaryTotalValue}>{total.toLocaleString("hu-HU")} Ft</Text>
              </View>
            </View>

            {errMsg ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{errMsg}</Text>
              </View>
            ) : null}
          </>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={styles.payRow}>
          <TouchableOpacity
            style={[styles.payBtn, loading && styles.payBtnDisabled]}
            onPress={handleCheckout} activeOpacity={0.85} disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.payBtnLabel}>Fizetés megerősítése</Text>
                <Text style={styles.payBtnAmount}>{total.toLocaleString("hu-HU")} Ft</Text>
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
  headerTitle: { fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: -0.5 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 130 },
  sectionLabel: { fontSize: 11, fontWeight: "700", color: C.textMuted, letterSpacing: 1, marginBottom: 12 },

  orderItem: {
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    flexDirection: "row", overflow: "hidden", marginBottom: 10,
  },
  orderItemAccent: { width: 4 },
  orderItemBody: { flex: 1, padding: 14 },
  orderItemName: { fontSize: 15, fontWeight: "700", color: C.text },
  orderItemSub: { fontSize: 12, color: C.textSub, marginTop: 3 },
  orderItemRight: { padding: 14, alignItems: "flex-end", justifyContent: "center", gap: 6 },
  orderItemQty: { fontSize: 12, color: C.textSub },
  orderItemTotal: { fontSize: 15, fontWeight: "700", color: C.text },

  summaryBox: {
    backgroundColor: C.surface, borderRadius: 14,
    borderWidth: 1, borderColor: C.border,
    padding: 16, marginTop: 16, gap: 10,
  },
  summaryRow: { flexDirection: "row", justifyContent: "space-between" },
  summaryLabel: { fontSize: 14, color: C.textSub },
  summaryValue: { fontSize: 14, color: C.text, fontWeight: "600" },
  summaryTotalRow: { borderTopWidth: 1, borderTopColor: C.border, paddingTop: 10, marginTop: 2 },
  summaryTotalLabel: { fontSize: 16, fontWeight: "700", color: C.text },
  summaryTotalValue: { fontSize: 20, fontWeight: "800", color: C.accent },

  errorBox: {
    backgroundColor: "rgba(218,54,51,0.1)", borderRadius: 10, padding: 12,
    marginTop: 16, borderWidth: 1, borderColor: "rgba(218,54,51,0.25)",
  },
  errorText: { color: "#f87171", fontSize: 13, textAlign: "center" },

  payRow: { position: "absolute", bottom: 24, left: 20, right: 20 },
  payBtn: {
    backgroundColor: C.accent, borderRadius: 18,
    paddingVertical: 18, paddingHorizontal: 24,
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    shadowColor: C.accent, shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35, shadowRadius: 16, elevation: 12,
  },
  payBtnDisabled: { opacity: 0.6 },
  payBtnLabel: { fontSize: 17, fontWeight: "700", color: "#fff" },
  payBtnAmount: { fontSize: 17, fontWeight: "800", color: "#fff" },

  emptyBox: { alignItems: "center", marginTop: 80, gap: 16 },
  emptyText: { fontSize: 18, color: C.textSub },
  emptyBtn: { backgroundColor: C.accent, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  emptyBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },

  successIcon: {
    width: 100, height: 100, borderRadius: 50,
    backgroundColor: C.green, alignItems: "center", justifyContent: "center",
    marginBottom: 24,
    shadowColor: C.green, shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  successCheck: { fontSize: 48, color: "#fff" },
  successTitle: { fontSize: 28, fontWeight: "800", color: C.text, marginBottom: 8 },
  successSub: { fontSize: 15, color: C.textSub },
});
