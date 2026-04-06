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
  return Math.max(0, Math.ceil((new Date(e).getTime() - Date.now()) / 86400000));
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

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  const surface = isDark ? "#18181b" : "#ffffff";
  const borderColor = isDark ? "#3f3f46" : "#e4e4e7";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textMuted = isDark ? "#71717a" : "#a1a1aa";
  const bgColor = isDark ? "#09090b" : "#fafafa";
  const surfaceHigh = isDark ? "#27272a" : "#f4f4f5";

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.95}
        className="rounded-[18px] flex-row overflow-hidden min-h-[116px] border"
        style={{
          backgroundColor: surface,
          borderColor,
          opacity: expired ? 0.6 : 1,
        }}
      >
        {/* Left accent stub */}
        <View
          className="w-14 items-center justify-center gap-1.5 py-3.5"
          style={{ backgroundColor: surfaceHigh }}
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
            className="text-[11px] font-extrabold tracking-wide"
            style={{ color: textMuted, transform: [{ rotate: "-90deg" }] }}
          >
            #{orderId}
          </Text>
          <Text
            className="text-[8px] font-bold tracking-wide"
            style={{ color: statusColor }}
          >
            {expired ? "LEJÁRT" : "AKTÍV"}
          </Text>
        </View>

        {/* Perforations */}
        <View className="w-3 justify-evenly items-center py-2">
          {Array.from({ length: 9 }).map((_, i) => (
            <View
              key={i}
              className="w-[5px] h-[5px] rounded-sm border"
              style={{ backgroundColor: bgColor, borderColor }}
            />
          ))}
        </View>

        {/* Body */}
        <View className="flex-1 p-3.5 justify-between">
          <Text
            className="text-base font-extrabold -tracking-wide"
            style={{ color: textPrimary }}
            numberOfLines={1}
          >
            {item.itemName}
          </Text>

          <View className="flex-row gap-5 mt-2">
            <View className="gap-0.5">
              <Text className="text-[10px] font-semibold tracking-wide" style={{ color: textMuted }}>
                AKTIVÁLVA
              </Text>
              <Text className="text-xs font-semibold" style={{ color: isDark ? "#a1a1aa" : "#52525b" }}>
                {fmtDate(item.activatedAt)}
              </Text>
            </View>
            <View className="gap-0.5">
              <Text className="text-[10px] font-semibold tracking-wide" style={{ color: textMuted }}>
                LEJÁRAT
              </Text>
              <Text className="text-xs font-semibold" style={{ color: statusColor }}>
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
            <View className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: statusColor }} />
            <Text className="text-[11px] font-bold" style={{ color: statusColor }}>
              {expired ? "Lejárt" : `${days} nap van hátra`}
            </Text>
          </View>
        </View>

        {/* QR hint */}
        <View
          className="w-11 items-center justify-center border-l"
          style={{ borderLeftColor: borderColor }}
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

  const allItems = orders.flatMap((o) => o.items.map((item) => ({ item, orderId: o.id })));
  const active = allItems.filter((x) => !isExpired(x.item.expiresAt));
  const expired = allItems.filter((x) => isExpired(x.item.expiresAt));

  const bg = isDark ? "bg-[#09090b]" : "bg-[#fafafa]";
  const textPrimary = isDark ? "text-[#fafafa]" : "text-[#09090b]";
  const textSub = isDark ? "text-[#a1a1aa]" : "text-[#52525b]";
  const textMuted = isDark ? "text-[#71717a]" : "text-[#a1a1aa]";
  const successColor = isDark ? "#4ade80" : "#16a34a";
  const dangerColor = isDark ? "#f87171" : "#dc2626";

  return (
    <View className={`flex-1 ${bg}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
      />

      <View className="px-5 pt-[60px] pb-5">
        <Text className={`text-3xl font-extrabold -tracking-wide ${textPrimary}`}>
          Jegyeim
        </Text>
        <View className="flex-row gap-3 mt-1.5">
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: successColor }} />
            <Text className={`text-xs ${textSub}`}>{active.length} aktív</Text>
          </View>
          <View className="flex-row items-center gap-1.5">
            <View className="w-2 h-2 rounded-full" style={{ backgroundColor: dangerColor }} />
            <Text className={`text-xs ${textSub}`}>{expired.length} lejárt</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="flex-1" />
      ) : allItems.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3.5">
          <Text className="text-5xl">🎫</Text>
          <Text className={`text-xl font-bold ${textPrimary}`}>Nincs még jegyed</Text>
          <Text className={`text-xs text-center px-10 ${textSub}`}>
            Vásárolj bérletet vagy belépőt a Vásárlás fülön
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 10 }}
          showsVerticalScrollIndicator={false}
        >
          {active.length > 0 && (
            <>
              <Text className={`text-[11px] font-bold tracking-[1.5px] uppercase mb-1 ${textMuted}`}>
                Aktív jegyek
              </Text>
              {active.map(({ item, orderId }, idx) => (
                <TicketCard
                  key={`a-${orderId}-${idx}`}
                  item={item}
                  orderId={orderId}
                  isDark={isDark}
                  onPress={() =>
                    navigation.navigate("TicketsDetail" as never, { article: item } as never)
                  }
                />
              ))}
            </>
          )}
          {expired.length > 0 && (
            <>
              <Text className={`text-[11px] font-bold tracking-[1.5px] uppercase mt-4 mb-1 ${textMuted}`}>
                Lejárt
              </Text>
              {expired.map(({ item, orderId }, idx) => (
                <TicketCard
                  key={`e-${orderId}-${idx}`}
                  item={item}
                  orderId={orderId}
                  isDark={isDark}
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
