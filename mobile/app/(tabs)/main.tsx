import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { router } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { decodeJwt, ENDPOINTS } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useNewsStore, NewsArticle } from "../store";

const OPENING_HOURS = [
  { open: "06:00", close: "22:00", isOpen: true },
  { open: "06:00", close: "22:00", isOpen: true },
  { open: "06:00", close: "22:00", isOpen: true },
  { open: "06:00", close: "22:00", isOpen: true },
  { open: "06:00", close: "21:00", isOpen: true },
  { open: "08:00", close: "18:00", isOpen: true },
  { open: null, close: null, isOpen: false },
];

function getCurrentDayIndex() {
  const jsDay = new Date().getDay();
  return jsDay === 0 ? 6 : jsDay - 1;
}

function isCurrentlyOpen() {
  const idx = getCurrentDayIndex();
  const today = OPENING_HOURS[idx];
  if (!today.isOpen || !today.open || !today.close) return false;
  const now = new Date();
  const [oh, om] = today.open.split(":").map(Number);
  const [ch, cm] = today.close.split(":").map(Number);
  const nowMins = now.getHours() * 60 + now.getMinutes();
  return nowMins >= oh * 60 + om && nowMins < ch * 60 + cm;
}

function timeFrac(time: string) {
  const [h, m] = time.split(":").map(Number);
  return Math.max(0, Math.min(1, (h * 60 + m - 360) / (22 * 60 - 360)));
}

export default function MainScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const setSelectedArticle = useNewsStore((s) => s.setSelectedArticle);

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("accessToken").then((tok) => {
      if (!tok) return;
      const d = decodeJwt(tok);
      if (d) {
        setUsername(
          d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] ||
            d.unique_name ||
            d.name ||
            "",
        );
        setRole(d.role || "");
      }
    });
    fetch(ENDPOINTS.news)
      .then((r) => (r.ok ? r.json() : []))
      .then((data: NewsArticle[]) => setNews(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setNewsLoading(false));
  }, []);

  const navigateToArticle = (article: NewsArticle) => {
    setSelectedArticle(article);
    router.push("/news-detail");
    console.log("miert");
  };

  const todayIdx = getCurrentDayIndex();
  const gymOpen = isCurrentlyOpen();
  const today = OPENING_HOURS[todayIdx];

  const DAY_KEYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;

  const STATS = [
    { value: "1 240", label: t("main.stats.members") },
    { value: "34", label: t("main.stats.workouts") },
    { value: "12", label: t("main.stats.trainers") },
    { value: "8", label: t("main.stats.years") },
  ];

  return (
    <ScrollView
      className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}
      contentContainerStyle={{
        paddingBottom: Platform.OS === "android" ? 140 : 8,
      }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient blobs */}
      <View
        pointerEvents="none"
        className="absolute top-20 -left-20 w-[280px] h-[140px] rounded-[140px]"
        style={{
          transform: [{ rotate: "45deg" }],
          backgroundColor: isDark
            ? "rgba(124,58,237,0.14)"
            : "rgba(124,58,237,0.06)",
        }}
      />
      <View
        pointerEvents="none"
        className="absolute -top-10 -right-10 w-[200px] h-[200px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.07)"
            : "rgba(124,58,237,0.04)",
        }}
      />

      {/* ── Header ────────────────────────────────────────────── */}
      <View className="flex-row justify-between items-start px-5 pt-16 pb-6">
        <View>
          <Text
            className={`text-xs mb-0.5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
          >
            {username
              ? t("main.welcomeUser").replace("{{name}}", username)
              : t("main.welcome")}
          </Text>
          <Text
            className={`text-[22px] font-extrabold tracking-[3px] uppercase ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
          >
            SUPLEX GYM
          </Text>
        </View>
        {role === "admin" && (
          <View
            className="rounded-[10px] px-3 py-1.5 border"
            style={{
              backgroundColor: isDark
                ? "rgba(124,58,237,0.18)"
                : "rgba(124,58,237,0.08)",
              borderColor: isDark
                ? "rgba(124,58,237,0.4)"
                : "rgba(124,58,237,0.25)",
            }}
          >
            <Text className="text-[#c4b5fd] text-[11px] font-bold tracking-[1px]">
              {t("main.adminBadge")}
            </Text>
          </View>
        )}
      </View>

      {/* ── Stats grid ────────────────────────────────────────── */}
      <View className="flex-row flex-wrap gap-2.5 px-5 mb-7">
        {STATS.map((s) => (
          <View
            key={s.label}
            className="rounded-[20px] p-4 border"
            style={{
              width: "47%",
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.8)",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            }}
          >
            <Text
              className={`text-[26px] font-bold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
            >
              {s.value}
            </Text>
            <Text
              className={`text-[11px] mt-0.5 ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
            >
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* ── Opening hours ─────────────────────────────────────── */}
      <Text
        className={`text-[11px] font-bold tracking-[2px] uppercase px-5 mb-3 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
      >
        {t("main.openingHours")}
      </Text>

      <View
        className="mx-5 rounded-[22px] border overflow-hidden mb-7"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.04)"
            : "rgba(255,255,255,0.9)",
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }}
      >
        {/* Status banner */}
        <View
          className="px-5 py-3 flex-row items-center justify-between"
          style={{
            backgroundColor: gymOpen
              ? isDark
                ? "rgba(74,222,128,0.1)"
                : "rgba(22,163,74,0.07)"
              : isDark
                ? "rgba(248,113,113,0.1)"
                : "rgba(220,38,38,0.06)",
          }}
        >
          <View className="flex-row items-center gap-2">
            <View
              className="w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: gymOpen
                  ? isDark
                    ? "#4ade80"
                    : "#16a34a"
                  : isDark
                    ? "#f87171"
                    : "#dc2626",
              }}
            />
            <Text
              className="text-[13px] font-bold"
              style={{
                color: gymOpen
                  ? isDark
                    ? "#4ade80"
                    : "#16a34a"
                  : isDark
                    ? "#f87171"
                    : "#dc2626",
              }}
            >
              {gymOpen ? t("main.openNow") : t("main.closedNow")}
            </Text>
          </View>
          <Text
            className={`text-[11px] font-semibold ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
          >
            {today.isOpen && today.open && today.close
              ? `${today.open} – ${today.close}`
              : t("main.closed")}
          </Text>
        </View>

        {/* Timeline bar */}
        {today.isOpen && today.open && today.close && (
          <View className="px-5 pt-4 pb-2">
            <View className="flex-row justify-between mb-1.5">
              <Text
                className={`text-[10px] font-semibold ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
              >
                06:00
              </Text>
              <Text
                className={`text-[10px] font-semibold ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
              >
                22:00
              </Text>
            </View>
            <View
              className="w-full h-3 rounded-full overflow-hidden"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            >
              <View
                className="absolute h-full rounded-full"
                style={{
                  left: `${timeFrac(today.open!) * 100}%`,
                  right: `${(1 - timeFrac(today.close!)) * 100}%`,
                  backgroundColor: gymOpen
                    ? isDark
                      ? "rgba(74,222,128,0.7)"
                      : "rgba(22,163,74,0.6)"
                    : isDark
                      ? "rgba(124,58,237,0.5)"
                      : "rgba(124,58,237,0.4)",
                }}
              />
              {(() => {
                const now = new Date();
                const nowMins = now.getHours() * 60 + now.getMinutes();
                const frac = Math.max(
                  0,
                  Math.min(1, (nowMins - 360) / (22 * 60 - 360)),
                );
                return (
                  <View
                    className="absolute top-0 bottom-0 w-0.5 rounded-full bg-white"
                    style={{
                      left: `${frac * 100}%`,
                      opacity: gymOpen ? 1 : 0.4,
                    }}
                  />
                );
              })()}
            </View>
            <Text
              className={`text-[10px] mt-1 ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
            >
              {t("main.todayHours")}: {today.open} – {today.close}
            </Text>
          </View>
        )}

        {/* Weekly chips */}
        <View className="flex-row px-4 pb-4 pt-2 gap-1.5 justify-between">
          {OPENING_HOURS.map((h, i) => {
            const isToday = i === todayIdx;
            const dayKey = DAY_KEYS[i];
            return (
              <View
                key={i}
                className="flex-1 items-center rounded-xl py-2"
                style={{
                  backgroundColor: isToday
                    ? "#7c3aed"
                    : h.isOpen
                      ? isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.04)"
                      : isDark
                        ? "rgba(255,255,255,0.02)"
                        : "rgba(0,0,0,0.02)",
                }}
              >
                <Text
                  className="text-[10px] font-bold mb-1"
                  style={{
                    color: isToday ? "#fff" : isDark ? "#a1a1aa" : "#52525b",
                  }}
                >
                  {t(`main.days.${dayKey}`)}
                </Text>
                <View
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    backgroundColor: isToday
                      ? "rgba(255,255,255,0.8)"
                      : h.isOpen
                        ? isDark
                          ? "#4ade80"
                          : "#16a34a"
                        : isDark
                          ? "#f87171"
                          : "#dc2626",
                  }}
                />
                {h.isOpen && h.open && h.close ? (
                  <>
                    <Text
                      className="text-[8px] mt-1 font-semibold"
                      style={{
                        color: isToday
                          ? "rgba(255,255,255,0.7)"
                          : isDark
                            ? "#71717a"
                            : "#a1a1aa",
                      }}
                    >
                      {h.open}
                    </Text>
                    <Text
                      className="text-[8px] font-semibold"
                      style={{
                        color: isToday
                          ? "rgba(255,255,255,0.7)"
                          : isDark
                            ? "#71717a"
                            : "#a1a1aa",
                      }}
                    >
                      {h.close}
                    </Text>
                  </>
                ) : (
                  <Text
                    className="text-[8px] mt-1 font-semibold"
                    style={{ color: isDark ? "#f87171" : "#dc2626" }}
                  >
                    {t("main.closed")}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      {/* ── Latest news ───────────────────────────────────────── */}
      <Text
        className={`text-[11px] font-bold tracking-[2px] uppercase px-5 mb-3 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
      >
        {t("main.latestNews")}
      </Text>

      {newsLoading ? (
        <ActivityIndicator color="#7c3aed" className="mt-3" />
      ) : (
        <View className="px-5 gap-2">
          {news.map((n) => (
            <TouchableOpacity
              key={n.id}
              className="rounded-[18px] p-3.5 flex-row items-center border overflow-hidden"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.3)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
              onPress={() => navigateToArticle(n)}
              activeOpacity={0.75}
            >
              <View
                className="absolute left-0 top-0 bottom-0 w-[50px] rounded-l-2xl"
                style={{ backgroundColor: "rgba(124,58,237,0.4)" }}
              />
              <View className="flex-1 pl-2">
                <Text
                  className={`text-sm font-semibold leading-5 ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                  numberOfLines={2}
                >
                  {n.title}
                </Text>
                <Text
                  className={`text-[11px] mt-1 ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
                >
                  {new Date(n.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <Text className="text-[#7c3aed] text-base ml-2">→</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* ── CTA card ──────────────────────────────────────────── */}
      <TouchableOpacity
        className="mx-5 mt-4 rounded-[20px] p-5 flex-row items-center gap-3.5 border"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.12)"
            : "rgba(124,58,237,0.07)",
          borderColor: isDark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)",
        }}
        onPress={() => router.push("/purchase")}
        activeOpacity={0.8}
      >
        <View className="flex-1 ml-6">
          <Text
            className={`text-[15px] font-bold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
          >
            {t("main.buyTicket")}
          </Text>
          <Text
            className={`text-xs mt-0.5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
          >
            {t("main.buyTicketSub")}
          </Text>
        </View>
        <Text className="text-[#7c3aed] text-lg">→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
