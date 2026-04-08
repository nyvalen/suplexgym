import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authFetch } from "../utils/auth";
import { api_endpoints } from "../config/api";
import { useTheme } from "../theme/ThemeContext";

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

function isExpired(e: string) {
  return new Date(e) < new Date();
}
function daysLeft(e: string) {
  return Math.max(
    0,
    Math.ceil((new Date(e).getTime() - Date.now()) / 86400000),
  );
}
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TicketCard({ item, orderId, onPress, isDark }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const expired = isExpired(item.expiresAt);
  const days = daysLeft(item.expiresAt);

  const statusColor = expired
    ? "#f87171"
    : days <= 3
      ? "#f97316"
      : days <= 7
        ? "#fbbf24"
        : isDark
          ? "#4ade80"
          : "#16a34a";
  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textMuted = isDark ? "#71717a" : "#a1a1aa";
  const bgColor = isDark ? "#09090b" : "#fafafa";
  const surfaceHigh = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.03)";

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.97,
        duration: 80,
        useNativeDriver: true,
      }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.95}
        style={{
          borderRadius: 20,
          flexDirection: "row",
          overflow: "hidden",
          minHeight: 116,
          borderWidth: 1,
          backgroundColor: surface,
          borderColor: surfaceBorder,
          opacity: expired ? 0.6 : 1,
        }}
      >
        {/* Left accent stub */}
        <View
          style={{
            width: 56,
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            paddingVertical: 14,
            backgroundColor: surfaceHigh,
          }}
        >
          <View
            style={{
              position: "absolute",
              top: -10,
              width: 20,
              height: 20,
              borderRadius: 10,
              backgroundColor: bgColor,
            }}
          />
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: statusColor,
            }}
          />
          <Text
            style={{
              fontSize: 11,
              fontWeight: "800",
              color: textMuted,
              transform: [{ rotate: "-90deg" }],
            }}
          >
            #{orderId}
          </Text>
          <Text style={{ fontSize: 8, fontWeight: "700", color: statusColor }}>
            {expired ? "LEJÁRT" : "AKTÍV"}
          </Text>
        </View>

        {/* Perforations */}
        <View
          style={{
            width: 12,
            justifyContent: "space-evenly",
            alignItems: "center",
            paddingVertical: 8,
          }}
        >
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              style={{
                width: 5,
                height: 5,
                borderRadius: 2,
                backgroundColor: bgColor,
                borderWidth: 1,
                borderColor: surfaceBorder,
              }}
            />
          ))}
        </View>

        {/* Body */}
        <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
          <Text
            style={{
              fontSize: 15,
              fontWeight: "800",
              letterSpacing: -0.3,
              color: textPrimary,
            }}
            numberOfLines={1}
          >
            {item.itemName}
          </Text>
          <View style={{ flexDirection: "row", gap: 20, marginTop: 8 }}>
            <View style={{ gap: 2 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  letterSpacing: 1,
                  color: textMuted,
                }}
              >
                AKTIVÁLVA
              </Text>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "600",
                  color: isDark ? "#a1a1aa" : "#52525b",
                }}
              >
                {fmtDate(item.activatedAt)}
              </Text>
            </View>
            <View style={{ gap: 2 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "600",
                  letterSpacing: 1,
                  color: textMuted,
                }}
              >
                LEJÁRAT
              </Text>
              <Text
                style={{ fontSize: 11, fontWeight: "600", color: statusColor }}
              >
                {fmtDate(item.expiresAt)}
              </Text>
            </View>
          </View>
          {/* Status pill */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              alignSelf: "flex-start",
              paddingHorizontal: 10,
              paddingVertical: 5,
              borderRadius: 12,
              marginTop: 8,
              backgroundColor: statusColor + "18",
              borderWidth: 1,
              borderColor: statusColor + "40",
            }}
          >
            <View
              style={{
                width: 6,
                height: 6,
                borderRadius: 3,
                backgroundColor: statusColor,
              }}
            />
            <Text
              style={{ fontSize: 11, fontWeight: "700", color: statusColor }}
            >
              {expired ? "Lejárt" : `${days} nap van hátra`}
            </Text>
          </View>
        </View>

        {/* QR hint */}
        <View
          style={{
            width: 44,
            alignItems: "center",
            justifyContent: "center",
            borderLeftWidth: 1,
            borderLeftColor: surfaceBorder,
          }}
        >
          <Text style={{ color: textMuted, fontSize: 22 }}>▦</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TicketsListScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isDark } = useTheme();

  useEffect(() => {
    authFetch(api_endpoints.orders)
      .then((r) => (r.ok ? r.json() : []))
      .then(setOrders)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const allItems = orders.flatMap((o) =>
    o.items.map((item) => ({ item, orderId: o.id })),
  );
  const active = allItems.filter((x) => !isExpired(x.item.expiresAt));
  const expired = allItems.filter((x) => isExpired(x.item.expiresAt));

  const bg = isDark ? "#09090b" : "#fafafa";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";
  const textMuted = isDark ? "#71717a" : "#a1a1aa";
  const successColor = isDark ? "#4ade80" : "#16a34a";
  const dangerColor = isDark ? "#f87171" : "#dc2626";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Blob */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      <View
        style={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 20 }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            letterSpacing: -0.5,
            color: textPrimary,
          }}
        >
          Jegyeim
        </Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: successColor,
              }}
            />
            <Text style={{ fontSize: 12, color: textSub }}>
              {active.length} aktív
            </Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: dangerColor,
              }}
            />
            <Text style={{ fontSize: 12, color: textSub }}>
              {expired.length} lejárt
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ flex: 1 }} />
      ) : allItems.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 14,
          }}
        >
          <Text style={{ fontSize: 20, fontWeight: "700", color: textPrimary }}>
            Nincs még jegyed
          </Text>
          <Text
            style={{
              fontSize: 12,
              textAlign: "center",
              paddingHorizontal: 40,
              color: textSub,
            }}
          >
            Vásárolj bérletet vagy belépőt a Vásárlás fülön
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          {active.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginBottom: 4,
                  color: textMuted,
                }}
              >
                Aktív jegyek
              </Text>
              {active.map(({ item, orderId }, idx) => (
                <TicketCard
                  key={`a-${orderId}-${idx}`}
                  item={item}
                  orderId={orderId}
                  isDark={isDark}
                  onPress={() =>
                    navigation.navigate(
                      "TicketsDetail" as never,
                      { article: item } as never,
                    )
                  }
                />
              ))}
            </>
          )}
          {expired.length > 0 && (
            <>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 2,
                  textTransform: "uppercase",
                  marginTop: 16,
                  marginBottom: 4,
                  color: textMuted,
                }}
              >
                Lejárt
              </Text>
              {expired.map(({ item, orderId }, idx) => (
                <TicketCard
                  key={`e-${orderId}-${idx}`}
                  item={item}
                  orderId={orderId}
                  isDark={isDark}
                  onPress={() =>
                    navigation.navigate(
                      "TicketsDetail" as never,
                      { article: item } as never,
                    )
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
