// app/offline-tickets.tsx
// Offline ticket list — same design as tickets-list.tsx.
// Tapping a card navigates to /offline-ticket-detail (same as tickets-detail).

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "./theme/ThemeContext";
import { useLanguage } from "./i18n/LanguageContext";
import { getOfflineTickets, OfflineTicket } from "./utils/offline-storage";
import { useOfflineTicketStore } from "./store/offlineTicketStore";
import { LinearGradient } from "expo-linear-gradient";

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
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TicketCard({
  item,
  onPress,
  isDark,
  t,
}: {
  item: OfflineTicket;
  onPress: () => void;
  isDark: boolean;
  t: (k: string) => string;
}) {
  const scale = useRef(new Animated.Value(1)).current;
  const expired = isExpired(item.expiresAt);
  const days = daysLeft(item.expiresAt);

  const statusColor = expired
    ? isDark
      ? "#f87171"
      : "#dc2626"
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
            #{item.orderId}
          </Text>
          <Text className="text-[8px] font-bold" style={{ color: statusColor }}>
            {expired ? t("tickets.expiredLabel") : t("tickets.activeLabel")}
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
            className="text-[15px] font-extrabold tracking-[-0.3px]"
            numberOfLines={1}
            style={{ color: isDark ? "#fafafa" : "#09090b" }}
          >
            {item.itemName}
          </Text>
          <View className="flex-row gap-5 mt-2">
            <View className="gap-0.5">
              <Text
                className="text-[10px] font-semibold tracking-[1px]"
                style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
              >
                {t("tickets.activatedLabel")}
              </Text>
              <Text
                className="text-[11px] font-semibold"
                style={{ color: isDark ? "#a1a1aa" : "#52525b" }}
              >
                {fmtDate(item.activatedAt)}
              </Text>
            </View>
            <View className="gap-0.5">
              <Text
                className="text-[10px] font-semibold tracking-[1px]"
                style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
              >
                {t("tickets.expiresLabel")}
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
              {expired
                ? t("tickets.expiredStatus")
                : `${String(days)} ${t("tickets.daysLeft")}`}
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

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function OfflineTicketsScreen() {
  const [tickets, setTickets] = useState<OfflineTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const setSelectedTicket = useOfflineTicketStore((s) => s.setSelectedTicket);

  useEffect(() => {
    getOfflineTickets()
      .then(setTickets)
      .finally(() => setLoading(false));
  }, []);

  const navigateToDetail = (item: OfflineTicket) => {
    setSelectedTicket(item);
    router.push("/offline-ticket-detail" as any);
  };

  const active = tickets.filter((x) => !isExpired(x.expiresAt));
  const expired = tickets.filter((x) => isExpired(x.expiresAt));

  const successColor = isDark ? "#4ade80" : "#16a34a";
  const dangerColor = isDark ? "#f87171" : "#dc2626";

  return (
    <View
      className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}
      style={{ paddingBottom: Platform.OS === "android" ? 32 : 0 }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <View
        pointerEvents="none"
        className="absolute -top-[30px] -right-[30px] w-[180px] h-[180px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />
      <LinearGradient
        colors={["rgba(124,58,237,0.4)", "rgba(124,58,237,0)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1200,
        }}
        start={{ x: 0, y: 0.9 }}
        end={{ x: 0, y: 0 }}
      />

      {/* Header */}
      <View className="px-5 pt-16 pb-5">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-3"
          activeOpacity={0.7}
        >
          <Text className="text-[#7c3aed] text-[15px] font-semibold">
            {t("common.back")}
          </Text>
        </TouchableOpacity>
        <Text
          className={`text-[30px] font-extrabold tracking-[-0.5px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
        >
          {t("tickets.title")}
        </Text>

        <View className="flex-row items-center gap-3 mt-1.5 flex-wrap">
          {/* Offline badge */}
          <View
            className="flex-row items-center gap-1.5 px-2.5 py-1 rounded-full border"
            style={{
              backgroundColor: isDark
                ? "rgba(248,113,113,0.1)"
                : "rgba(220,38,38,0.06)",
              borderColor: isDark
                ? "rgba(248,113,113,0.3)"
                : "rgba(220,38,38,0.2)",
            }}
          >
            <View className="w-1.5 h-1.5 rounded-full bg-[#f87171]" />
            <Text className="text-[#f87171] text-[11px] font-bold tracking-[0.5px]">
              OFFLINE
            </Text>
          </View>

          {tickets.length > 0 && (
            <>
              <View className="flex-row items-center gap-1.5">
                <View
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: successColor }}
                />
                <Text
                  className={`text-xs ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
                >
                  {active.length} {t("tickets.active")}
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
                  {expired.length} {t("tickets.expired")}
                </Text>
              </View>
            </>
          )}
        </View>

        {tickets.length > 0 && tickets[0].savedAt && (
          <Text
            className={`text-[11px] mt-1.5 ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
          >
            Cached{" "}
            {new Date(tickets[0].savedAt).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="flex-1" />
      ) : tickets.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3.5 px-10">
          <Text
            className={`text-xl font-bold text-center ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
          >
            {t("tickets.noTickets")}
          </Text>
          <Text
            className={`text-xs text-center leading-5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
          >
            Tickets are cached automatically after purchase while online.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 60,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          {active.length > 0 && (
            <>
              <Text
                className={`text-[11px] font-bold tracking-[2px] uppercase mb-1 ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
              >
                {t("tickets.activeLabel")}
              </Text>
              {active.map((item) => (
                <TicketCard
                  key={item.id}
                  item={item}
                  isDark={isDark}
                  t={t}
                  onPress={() => navigateToDetail(item)}
                />
              ))}
            </>
          )}
          {expired.length > 0 && (
            <>
              <Text
                className={`text-[11px] font-bold tracking-[2px] uppercase mt-4 mb-1 ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
              >
                {t("tickets.expiredStatus")}
              </Text>
              {expired.map((item) => (
                <TicketCard
                  key={item.id}
                  item={item}
                  isDark={isDark}
                  t={t}
                  onPress={() => navigateToDetail(item)}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
