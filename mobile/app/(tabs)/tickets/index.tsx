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
import { authFetch } from "../../utils/auth";
import { ENDPOINTS } from "../../utils/auth";
import { useTheme } from "../../theme/ThemeContext";

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
  const bgColor = isDark ? "#09090b" : "#fafafa";

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
        className="rounded-[20px] flex-row overflow-hidden border min-h-[116px]"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.9)",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          opacity: expired ? 0.6 : 1,
        }}
      >
        {/* Left accent stub */}
        <View
          className="w-14 items-center justify-center gap-1.5 py-3.5"
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.07)"
              : "rgba(0,0,0,0.03)",
          }}
        >
          <View
            className="absolute -top-2.5 w-5 h-5 rounded-full"
            style={{ backgroundColor: bgColor }}
          />
          <View
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: statusColor }}
          />
          <Text
            className="text-[11px] font-extrabold"
            style={{
              color: isDark ? "#71717a" : "#a1a1aa",
              transform: [{ rotate: "-90deg" }],
            }}
          >
            #{orderId}
          </Text>
          <Text className="text-[8px] font-bold" style={{ color: statusColor }}>
            {expired ? "LEJÁRT" : "AKTÍV"}
          </Text>
        </View>

        {/* Perforations */}
        <View className="w-3 justify-evenly items-center py-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              className="w-[5px] h-[5px] rounded-[2px] border"
              style={{
                backgroundColor: bgColor,
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            />
          ))}
        </View>

        {/* Body */}
        <View className="flex-1 p-3.5 justify-between">
          <Text
            className={`text-[15px] font-extrabold tracking-[-0.3px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
            numberOfLines={1}
          >
            {item.itemName}
          </Text>
          <View className="flex-row gap-5 mt-2">
            <View className="gap-0.5">
              <Text
                className={`text-[10px] font-semibold tracking-[1px] ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
              >
                AKTIVÁLVA
              </Text>
              <Text
                className={`text-[11px] font-semibold ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
              >
                {fmtDate(item.activatedAt)}
              </Text>
            </View>
            <View className="gap-0.5">
              <Text
                className={`text-[10px] font-semibold tracking-[1px] ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
              >
                LEJÁRAT
              </Text>
              <Text
                className="text-[11px] font-semibold"
                style={{ color: statusColor }}
              >
                {fmtDate(item.expiresAt)}
              </Text>
            </View>
          </View>
          {/* Status pill */}
          <View
            className="flex-row items-center gap-1.5 self-start px-2.5 py-[5px] rounded-xl mt-2 border"
            style={{
              backgroundColor: statusColor + "18",
              borderColor: statusColor + "40",
            }}
          >
            <View
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: statusColor }}
            />
            <Text
              className="text-[11px] font-bold"
              style={{ color: statusColor }}
            >
              {expired ? "Lejárt" : `${days} nap van hátra`}
            </Text>
          </View>
        </View>

        {/* QR hint */}
        <View
          className="w-11 items-center justify-center border-l"
          style={{
            borderLeftColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.06)",
          }}
        >
          <Text
            className={`text-[22px] ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
          >
            ▦
          </Text>
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
    authFetch(ENDPOINTS.orders)
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

  const successColor = isDark ? "#4ade80" : "#16a34a";
  const dangerColor = isDark ? "#f87171" : "#dc2626";

  return (
    <View className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Blob */}
      <View
        pointerEvents="none"
        className="absolute -top-[30px] -right-[30px] w-[180px] h-[180px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      <View className="px-5 pt-16 pb-5">
        <Text
          className={`text-[30px] font-extrabold tracking-[-0.5px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
        >
          Jegyeim
        </Text>
        <View className="flex-row gap-3 mt-1.5">
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: successColor }}
            />
            <Text
              className={`text-xs ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
            >
              {active.length} aktív
            </Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: dangerColor }}
            />
            <Text
              className={`text-xs ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
            >
              {expired.length} lejárt
            </Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="flex-1" />
      ) : allItems.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3.5">
          <Text
            className={`text-xl font-bold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
          >
            Nincs még jegyed
          </Text>
          <Text
            className={`text-xs text-center px-10 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
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
                className={`text-[11px] font-bold tracking-[2px] uppercase mb-1 ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
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
                className={`text-[11px] font-bold tracking-[2px] uppercase mt-4 mb-1 ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
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
