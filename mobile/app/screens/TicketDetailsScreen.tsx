import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Animated,
  StatusBar,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");
const QR_SIZE = width - 80;

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

function isExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}

function daysLeft(expiresAt: string): number {
  const diff = new Date(expiresAt).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsDetailsScreen({ route }: any) {
  const navigation = useNavigation();
  const { article } = route.params;

  const expired = isExpired(article.expiresAt);
  const days = daysLeft(article.expiresAt);
  const statusColor = expired ? C.danger : days <= 3 ? "#F0883E" : C.green;

  // Entrance animation
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 10, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <Text style={styles.backBtnText}>← Vissza</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Belépőjegy</Text>
      </View>

      <Animated.View
        style={{ flex: 1, opacity: fadeIn, transform: [{ translateY: slideUp }] }}
      >
        {/* ── QR Card ── */}
        <View style={styles.qrCard}>
          {/* Top strip */}
          <View style={[styles.qrCardStrip, { backgroundColor: statusColor }]} />

          {/* Venue / name */}
          <Text style={styles.qrCardVenue}>SUPLEX GYM</Text>
          <Text style={styles.qrCardName}>{article.itemName}</Text>

          {/* Status chip */}
          <View style={[styles.statusChip, { backgroundColor: statusColor + "22", borderColor: statusColor + "66" }]}>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {expired ? "Lejárt" : `${days} nap van hátra`}
            </Text>
          </View>

          {/* Perforation line */}
          <View style={styles.perforationLine}>
            {Array.from({ length: 18 }).map((_, i) => (
              <View key={i} style={styles.perforationDash} />
            ))}
          </View>

          {/* QR Code */}
          {article.qrCodeBase64 ? (
            <View style={styles.qrContainer}>
              <Image
                source={{ uri: `data:image/png;base64,${article.qrCodeBase64}` }}
                style={[styles.qrImage, expired && styles.qrExpired]}
                resizeMode="contain"
              />
              {expired && (
                <View style={styles.qrOverlay}>
                  <Text style={styles.qrOverlayText}>LEJÁRT</Text>
                </View>
              )}
            </View>
          ) : (
            <View style={[styles.qrContainer, styles.qrPlaceholder]}>
              <Text style={styles.qrPlaceholderText}>▦</Text>
            </View>
          )}

          <Text style={styles.qrHint}>Mutasd be a belépéshez</Text>
        </View>

        {/* ── Details card ── */}
        <View style={styles.detailCard}>
          <DetailRow label="Aktiválva" value={formatDateTime(article.activatedAt)} />
          <View style={styles.detailDivider} />
          <DetailRow
            label="Lejárat"
            value={formatDateTime(article.expiresAt)}
            valueColor={statusColor}
          />
        </View>
      </Animated.View>
    </View>
  );
}

function DetailRow({
  label,
  value,
  valueColor,
}: {
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueColor ? { color: valueColor } : {}]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },

  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  backBtn: { marginBottom: 10 },
  backBtnText: { color: C.accent, fontSize: 15, fontWeight: "600" },
  headerTitle: { fontSize: 26, fontWeight: "800", color: C.text, letterSpacing: -0.5 },

  qrCard: {
    marginHorizontal: 20,
    backgroundColor: C.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: C.border,
    overflow: "hidden",
    alignItems: "center",
    paddingBottom: 24,
  },
  qrCardStrip: { width: "100%", height: 6, marginBottom: 20 },
  qrCardVenue: {
    fontSize: 11,
    fontWeight: "800",
    color: C.textMuted,
    letterSpacing: 3,
  },
  qrCardName: {
    fontSize: 22,
    fontWeight: "800",
    color: C.text,
    letterSpacing: -0.5,
    marginTop: 4,
    marginBottom: 12,
    textAlign: "center",
    paddingHorizontal: 20,
  },

  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 16,
  },
  statusDot: { width: 7, height: 7, borderRadius: 3.5 },
  statusText: { fontSize: 12, fontWeight: "700" },

  perforationLine: {
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 0,
    marginBottom: 20,
    gap: 4,
    justifyContent: "center",
  },
  perforationDash: {
    width: 10,
    height: 2,
    backgroundColor: C.border,
    borderRadius: 1,
  },

  qrContainer: {
    width: QR_SIZE,
    height: QR_SIZE,
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  qrImage: { width: QR_SIZE - 16, height: QR_SIZE - 16 },
  qrExpired: { opacity: 0.25 },
  qrOverlay: {
    position: "absolute",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    width: "100%",
    height: "100%",
    borderRadius: 16,
  },
  qrOverlayText: {
    fontSize: 32,
    fontWeight: "900",
    color: "#DA3633",
    letterSpacing: 4,
  },
  qrPlaceholder: { backgroundColor: C.surfaceHigh },
  qrPlaceholderText: { fontSize: 80, color: C.textMuted },
  qrHint: { fontSize: 12, color: C.textMuted, marginTop: 14, letterSpacing: 0.5 },

  detailCard: {
    marginHorizontal: 20,
    marginTop: 16,
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 6,
  },
  detailDivider: { height: 1, backgroundColor: C.border, marginVertical: 4 },
  detailLabel: { fontSize: 13, color: C.textMuted, fontWeight: "600" },
  detailValue: { fontSize: 13, color: C.text, fontWeight: "600", textAlign: "right", flex: 1, marginLeft: 12 },
});
