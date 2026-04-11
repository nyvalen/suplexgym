import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { useTheme, tokens } from "./theme/ThemeContext";
import { useLanguage } from "./i18n/LanguageContext";
import { useTicketStore } from "./store";
import { authFetch, ENDPOINTS } from "./utils/auth";

const { width } = Dimensions.get("window");
const QR_SIZE = width - 80;

function isExpired(e: string) {
  return new Date(e) < new Date();
}
function daysLeft(e: string) {
  return Math.max(
    0,
    Math.ceil((new Date(e).getTime() - Date.now()) / 86400000),
  );
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsDetailsScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const tokenSet = isDark ? tokens.dark : tokens.light;

  // Read from Zustand — no route params needed
  const article = useTicketStore((s) => s.selectedTicket);
  const orderId = useTicketStore((s) => s.selectedOrderId);

  const [renewing, setRenewing] = useState(false);

  const expired = article ? isExpired(article.expiresAt) : false;
  const days = article ? daysLeft(article.expiresAt) : 0;
  const statusColor = expired
    ? tokenSet.danger
    : days <= 3
      ? "#f97316"
      : days <= 7
        ? tokenSet.warning
        : tokenSet.success;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleRenew = async () => {
    if (!article?.id) return;
    setRenewing(true);
    try {
      const res = await authFetch(ENDPOINTS.renew(article.id), {
        method: "POST",
      });
      if (res.ok) {
        Alert.alert("✓", t("tickets.renewSuccess"), [
          { text: "OK", onPress: () => router.back() },
        ]);
      } else {
        const err = await res.json().catch(() => ({}));
        Alert.alert(t("common.error"), err?.message ?? t("common.error"));
      }
    } catch {
      Alert.alert(t("common.error"), t("common.error"));
    } finally {
      setRenewing(false);
    }
  };

  if (!article) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: tokenSet.bg }}
      >
        <Text style={{ color: tokenSet.textSub }}>{t("common.error")}</Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-[#7c3aed] font-semibold">
            {t("common.back")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: tokenSet.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Blob */}
      <View
        pointerEvents="none"
        className="absolute -top-[30px] -right-[30px] w-[200px] h-[200px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      {/* Header */}
      <View className="px-5 pt-[60px] pb-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="mb-2.5"
          activeOpacity={0.7}
        >
          <Text className="text-[#7c3aed] text-[15px] font-semibold">
            {t("common.back")}
          </Text>
        </TouchableOpacity>
        <Text
          className="text-[28px] font-extrabold tracking-[-0.5px]"
          style={{ color: tokenSet.text }}
        >
          {t("tickets.ticketTitle")}
        </Text>
      </View>

      <Animated.View
        className="flex-1"
        style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* ── Ticket card ─────────────────────────────────────── */}
          <View
            className="mx-5 rounded-[24px] border overflow-hidden items-center pb-6"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.9)",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            }}
          >
            {/* Colour top strip */}
            <View
              className="w-full h-1"
              style={{ backgroundColor: statusColor }}
            />
            <View
              className="w-full h-0.5 mb-5"
              style={{ backgroundColor: "rgba(124,58,237,0.3)" }}
            />

            <Text
              className="text-[11px] font-extrabold tracking-[3px] mb-1"
              style={{ color: tokenSet.textMuted }}
            >
              {t("tickets.gymBrand")}
            </Text>
            <Text
              className="text-[22px] font-extrabold tracking-[-0.5px] mb-3.5 text-center px-5"
              style={{ color: tokenSet.text }}
            >
              {article.itemName}
            </Text>

            {/* Status chip */}
            <View
              className="flex-row items-center gap-2 px-3.5 py-2 rounded-[20px] mb-[18px] border"
              style={{
                backgroundColor: statusColor + "18",
                borderColor: statusColor + "44",
              }}
            >
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <Text
                className="text-[13px] font-bold"
                style={{ color: statusColor }}
              >
                {expired
                  ? t("tickets.expiredStatus")
                  : t("tickets.daysLeft").replace("{{days}}", String(days))}
              </Text>
            </View>

            {/* Perforations */}
            <View className="flex-row w-full justify-center mb-5 gap-[5px]">
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  className="w-2.5 h-0.5 rounded-sm"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)",
                  }}
                />
              ))}
            </View>

            {/* QR code */}
            {article.qrCodeBase64 ? (
              <View
                className="bg-white rounded-[20px] overflow-hidden items-center justify-center border-2"
                style={{
                  width: QR_SIZE,
                  height: QR_SIZE,
                  borderColor: "rgba(124,58,237,0.3)",
                }}
              >
                <Image
                  source={{
                    uri: `data:image/png;base64,${article.qrCodeBase64}`,
                  }}
                  style={[
                    { width: QR_SIZE - 24, height: QR_SIZE - 24 },
                    expired && { opacity: 0.2 },
                  ]}
                  resizeMode="contain"
                />
                {expired && (
                  <View className="absolute w-full h-full items-center justify-center rounded-[18px] bg-black/55">
                    <Text
                      className="text-[30px] font-black tracking-[4px]"
                      style={{ color: tokenSet.danger }}
                    >
                      {t("tickets.expiredLabel")}
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View
                className="rounded-[20px] items-center justify-center border"
                style={{
                  width: QR_SIZE,
                  height: QR_SIZE,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                <Text style={{ fontSize: 80, color: tokenSet.textMuted }}>
                  ▦
                </Text>
              </View>
            )}

            <Text
              className="text-xs mt-4 tracking-[0.5px]"
              style={{ color: tokenSet.textMuted }}
            >
              {t("tickets.scanToEnter")}
            </Text>
          </View>

          {/* ── Details card ────────────────────────────────────── */}
          <View
            className="mx-5 mt-3.5 rounded-[18px] border p-[18px]"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.9)",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            }}
          >
            {[
              {
                label: t("tickets.activatedLabel"),
                value: fmtDateTime(article.activatedAt),
                color: tokenSet.text,
              },
              {
                label: t("tickets.expiresLabel"),
                value: fmtDateTime(article.expiresAt),
                color: statusColor,
              },
            ].map((row, i) => (
              <View key={row.label}>
                {i > 0 && (
                  <View
                    className="h-px"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  />
                )}
                <View className="flex-row justify-between py-2.5">
                  <Text
                    className="text-[13px] font-semibold"
                    style={{ color: tokenSet.textMuted }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    className="text-[13px] font-semibold text-right flex-1 ml-3"
                    style={{ color: row.color }}
                  >
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>

          {/* ── Renew button (expired tickets only) ─────────────── */}
          {expired && (
            <TouchableOpacity
              onPress={handleRenew}
              disabled={renewing}
              activeOpacity={0.8}
              className="mx-5 mt-3.5 rounded-[18px] py-4 items-center border"
              style={{
                backgroundColor: isDark
                  ? "rgba(124,58,237,0.15)"
                  : "rgba(124,58,237,0.08)",
                borderColor: isDark
                  ? "rgba(124,58,237,0.35)"
                  : "rgba(124,58,237,0.25)",
                opacity: renewing ? 0.6 : 1,
              }}
            >
              {renewing ? (
                <ActivityIndicator color="#7c3aed" />
              ) : (
                <Text className="text-[#7c3aed] text-[15px] font-bold">
                  {t("tickets.renew")}
                </Text>
              )}
            </TouchableOpacity>
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}
