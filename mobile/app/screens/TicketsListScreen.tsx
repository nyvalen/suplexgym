import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authFetch } from "../utils/auth";
import { api_endpoints } from "../config/api";

interface PurchaseItem {
  itemName: string;
  qrCodeBase64: string;
  activatedAt: string;
  expiresAt: string;
}

interface Order {
  id: number;
  items: PurchaseItem[];
}

const C = {
  bg: "#0D1117",
  surface: "#161B22",
  surfaceHigh: "#21262D",
  border: "#30363D",
  text: "#F0F6FC",
  textSub: "#8B949E",
  textMuted: "#6E7681",
  accent: "#C4873A",
};

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function daysLeft(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// ─── Ticket Card ──────────────────────────────────────────────────────────────
function TicketCard({
  item,
  orderId,
  onPress,
}: {
  item: PurchaseItem;
  orderId: number;
  onPress: () => void;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const expired = isExpired(item.expiresAt);
  const days = daysLeft(item.expiresAt);
  const urgentColor =
    expired ? "#DA3633" : days <= 3 ? "#F0883E" : days <= 7 ? "#D29922" : "#3FB950";

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.95}
        style={[styles.ticket, expired && styles.ticketExpired]}
      >
        {/* ── Left stub ── */}
        <View style={styles.ticketLeft}>
          <View style={styles.ticketHole} />
          <View style={[styles.ticketStatus, { backgroundColor: urgentColor }]} />
          <Text style={styles.ticketOrderNo}>#{orderId}</Text>
          <Text style={styles.ticketStatusLabel}>
            {expired ? "LEJÁRT" : "AKTÍV"}
          </Text>
        </View>

        {/* ── Perforation ── */}
        <View style={styles.perforation}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={styles.perforationDot} />
          ))}
        </View>

        {/* ── Main body ── */}
        <View style={styles.ticketBody}>
          <Text style={styles.ticketName} numberOfLines={1}>
            {item.itemName}
          </Text>

          <View style={styles.ticketMeta}>
            <View style={styles.ticketMetaItem}>
              <Text style={styles.ticketMetaLabel}>Aktiválva</Text>
              <Text style={styles.ticketMetaValue}>{formatDate(item.activatedAt)}</Text>
            </View>
            <View style={styles.ticketMetaItem}>
              <Text style={styles.ticketMetaLabel}>Lejárat</Text>
              <Text style={[styles.ticketMetaValue, { color: urgentColor }]}>
                {formatDate(item.expiresAt)}
              </Text>
            </View>
          </View>

          {/* Days remaining pill */}
          <View style={[styles.daysPill, { backgroundColor: urgentColor + "22", borderColor: urgentColor + "44" }]}>
            <View style={[styles.daysDot, { backgroundColor: urgentColor }]} />
            <Text style={[styles.daysText, { color: urgentColor }]}>
              {expired ? "Lejárt" : `${days} nap van hátra`}
            </Text>
          </View>
        </View>

        {/* ── QR preview corner ── */}
        <View style={styles.ticketQrHint}>
          <Text style={styles.ticketQrIcon}>▦</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function TicketsListScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const res = await authFetch(api_endpoints.orders);
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (e) {
        console.error("Fetch orders error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const allItems = orders.flatMap((o) =>
    o.items.map((item) => ({ item, orderId: o.id }))
  );
  const active = allItems.filter((x) => !isExpired(x.item.expiresAt));
  const expired = allItems.filter((x) => isExpired(x.item.expiresAt));

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Jegyeim</Text>
        <Text style={styles.headerSub}>
          {active.length} aktív · {expired.length} lejárt
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ flex: 1 }} />
      ) : allItems.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🎫</Text>
          <Text style={styles.emptyTitle}>Nincs még jegyed</Text>
          <Text style={styles.emptySub}>Vásárolj bérletet vagy belépőt a Vásárlás fülön</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {active.length > 0 && (
            <>
              <Text style={styles.sectionLabel}>AKTÍV JEGYEK</Text>
              {active.map(({ item, orderId }, idx) => (
                <TicketCard
                  key={`${orderId}-${idx}`}
                  item={item}
                  orderId={orderId}
                  onPress={() =>
                    navigation.navigate("TicketsDetail" as never, { article: item } as never)
                  }
                />
              ))}
            </>
          )}
          {expired.length > 0 && (
            <>
              <Text style={[styles.sectionLabel, { marginTop: 20 }]}>LEJÁRT</Text>
              {expired.map(({ item, orderId }, idx) => (
                <TicketCard
                  key={`exp-${orderId}-${idx}`}
                  item={item}
                  orderId={orderId}
                  onPress={() =>
                    navigation.navigate("TicketsDetail" as never, { article: item } as never)
                  }
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: C.textSub, marginTop: 2 },

  scrollContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 1,
    marginBottom: 8,
  },

  ticket: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    overflow: "hidden",
    minHeight: 110,
  },
  ticketExpired: { opacity: 0.65 },

  ticketLeft: {
    width: 52,
    backgroundColor: C.surfaceHigh,
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    paddingVertical: 12,
    position: "relative",
  },
  ticketHole: {
    position: "absolute",
    top: -10,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: C.bg,
  },
  ticketStatus: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  ticketOrderNo: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    transform: [{ rotate: "-90deg" }],
    letterSpacing: 0.5,
  },
  ticketStatusLabel: {
    fontSize: 8,
    fontWeight: "700",
    color: C.textMuted,
    letterSpacing: 0.5,
  },

  perforation: {
    width: 12,
    justifyContent: "space-evenly",
    alignItems: "center",
    paddingVertical: 8,
  },
  perforationDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.bg,
    borderWidth: 1,
    borderColor: C.border,
  },

  ticketBody: { flex: 1, padding: 14, justifyContent: "space-between" },
  ticketName: { fontSize: 16, fontWeight: "800", color: C.text, letterSpacing: -0.3 },

  ticketMeta: { flexDirection: "row", gap: 20, marginTop: 8 },
  ticketMetaItem: { gap: 2 },
  ticketMetaLabel: { fontSize: 10, color: C.textMuted, fontWeight: "600", letterSpacing: 0.5 },
  ticketMetaValue: { fontSize: 12, color: C.textSub, fontWeight: "600" },

  daysPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 8,
  },
  daysDot: { width: 6, height: 6, borderRadius: 3 },
  daysText: { fontSize: 11, fontWeight: "700" },

  ticketQrHint: {
    width: 44,
    alignItems: "center",
    justifyContent: "center",
    borderLeftWidth: 1,
    borderLeftColor: C.border,
    borderStyle: "dashed",
  },
  ticketQrIcon: { fontSize: 22, color: C.textMuted },

  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: C.text },
  emptySub: { fontSize: 13, color: C.textSub, textAlign: "center", paddingHorizontal: 40 },
});
