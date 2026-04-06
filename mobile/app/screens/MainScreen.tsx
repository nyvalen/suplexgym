import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch, decodeJwt, ENDPOINTS } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";

interface NewsItem {
  id: number;
  title: string;
  createdAt: string;
}

export default function MainScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
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
      .then((data: NewsItem[]) => setNews(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setNewsLoading(false));
  }, []);

  const bg = isDark ? "bg-[#09090b]" : "bg-[#fafafa]";
  const surface = isDark ? "bg-[#18181b]" : "bg-white";
  const border = isDark ? "border-[#3f3f46]" : "border-[#e4e4e7]";
  const textPrimary = isDark ? "text-[#fafafa]" : "text-[#09090b]";
  const textSub = isDark ? "text-[#a1a1aa]" : "text-[#52525b]";
  const textMuted = isDark ? "text-[#71717a]" : "text-[#a1a1aa]";

  return (
    <ScrollView
      className={`flex-1 ${bg}`}
      contentContainerStyle={{ paddingBottom: 24 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
      />

      {/* Purple glow */}
      <View
        className="absolute top-36 -left-32 w-[260px] h-[100px] rotate-45 rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.12)"
            : "rgba(124,58,237,0.06)",
        }}
      />

      {/* Header */}
      <View className="flex-row justify-between items-start px-5 pt-6 pb-5">
        <View>
          <Text className={`text-xs mb-0.5 ${textSub}`}>
            {username ? `Üdvözlünk, ${username}` : "Üdvözlünk"}
          </Text>
          <Text
            className={`text-xl font-extrabold tracking-widest ${textPrimary}`}
          >
            SUPLEX GYM
          </Text>
        </View>
        {role === "admin" && (
          <View
            className={`rounded-xl px-3 py-1.5 border ${
              isDark
                ? "bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.35)]"
                : "bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.25)]"
            }`}
          >
            <Text className="text-[#c4b5fd] text-[11px] font-bold tracking-wide">
              Admin
            </Text>
          </View>
        )}
      </View>

      {/* Stats grid */}
      <View className="flex-row flex-wrap gap-2.5 px-5 mb-7">
        {[
          { value: "1 240", label: "Aktív tagok" },
          { value: "34", label: "Heti edzések" },
          { value: "12", label: "Edzők" },
          { value: "8", label: "Évek óta" },
        ].map((s) => (
          <View
            key={s.label}
            className={`w-[47%] ${surface} border ${border} rounded-2xl p-4`}
          >
            <Text className={`text-2xl font-bold ${textPrimary}`}>
              {s.value}
            </Text>
            <Text className={`text-[11px] mt-0.5 ${textMuted}`}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* News preview */}
      <Text
        className={`text-xs font-bold tracking-[1.5px] uppercase px-5 mt-2 mb-3 ${textSub}`}
      >
        Legfrissebb hírek
      </Text>

      {newsLoading ? (
        <ActivityIndicator color="#7c3aed" className="mt-3" />
      ) : (
        news.map((n) => (
          <TouchableOpacity
            key={n.id}
            className={`mx-5 ${surface} rounded-2xl p-3.5 flex-row items-center border ${border} mb-2`}
            onPress={() =>
              navigation.navigate(
                "NewsDetail" as never,
                { article: n } as never,
              )
            }
            activeOpacity={0.75}
          >
            <View className="flex-1">
              <Text
                className={`text-sm font-semibold leading-5 ${textPrimary}`}
                numberOfLines={2}
              >
                {n.title}
              </Text>
              <Text className={`text-[11px] mt-1 ${textMuted}`}>
                {new Date(n.createdAt).toLocaleDateString("hu-HU")}
              </Text>
            </View>
            <Text className="text-[#7c3aed] text-base ml-2">→</Text>
          </TouchableOpacity>
        ))
      )}

      {/* CTA */}
      <TouchableOpacity
        className={`mx-5 mt-3.5 ${
          isDark
            ? "bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.35)]"
            : "bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.25)]"
        } border rounded-[18px] p-5 flex-row items-center gap-3.5`}
        onPress={() => navigation.navigate("Vásárlás" as never)}
        activeOpacity={0.8}
      >
        <Text className="text-3xl">🎟️</Text>
        <View className="flex-1">
          <Text className={`text-sm font-bold ${textPrimary}`}>
            Jegy vásárlása
          </Text>
          <Text className={`text-xs mt-0.5 ${textSub}`}>
            Napi, havi és éves bérletek
          </Text>
        </View>
        <Text className="text-[#7c3aed] text-lg">→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
