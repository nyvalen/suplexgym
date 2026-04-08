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

  const bg = isDark ? "#09090b" : "#fafafa";
  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";
  const textMuted = isDark ? "#71717a" : "#a1a1aa";

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: bg }}
      contentContainerStyle={{ paddingBottom: 32 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Radial gradient background blobs */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: 80,
          left: -80,
          width: 280,
          height: 140,
          borderRadius: 140,
          transform: [{ rotate: "45deg" }],
          backgroundColor: isDark
            ? "rgba(124,58,237,0.14)"
            : "rgba(124,58,237,0.06)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.07)"
            : "rgba(124,58,237,0.04)",
        }}
      />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
          paddingHorizontal: 20,
          paddingTop: 64,
          paddingBottom: 24,
        }}
      >
        <View>
          <Text style={{ fontSize: 12, marginBottom: 3, color: textSub }}>
            {username ? `Üdvözlünk, ${username}` : "Üdvözlünk"}
          </Text>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              letterSpacing: 3,
              color: textPrimary,
              textTransform: "uppercase",
            }}
          >
            SUPLEX GYM
          </Text>
        </View>
        {role === "admin" && (
          <View
            style={{
              borderRadius: 10,
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: isDark
                ? "rgba(124,58,237,0.18)"
                : "rgba(124,58,237,0.08)",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(124,58,237,0.4)"
                : "rgba(124,58,237,0.25)",
            }}
          >
            <Text
              style={{
                color: "#c4b5fd",
                fontSize: 11,
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              Admin
            </Text>
          </View>
        )}
      </View>

      {/* Stats grid — glassy cards like the web */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 10,
          paddingHorizontal: 20,
          marginBottom: 28,
        }}
      >
        {[
          { value: "1 240", label: "Aktív tagok" },
          { value: "34", label: "Heti edzések" },
          { value: "12", label: "Edzők" },
          { value: "8", label: "Évek óta" },
        ].map((s) => (
          <View
            key={s.label}
            style={{
              width: "47%",
              backgroundColor: surface,
              borderWidth: 1,
              borderColor: surfaceBorder,
              borderRadius: 20,
              padding: 16,
            }}
          >
            <Text
              style={{ fontSize: 26, fontWeight: "700", color: textPrimary }}
            >
              {s.value}
            </Text>
            <Text style={{ fontSize: 11, marginTop: 2, color: textMuted }}>
              {s.label}
            </Text>
          </View>
        ))}
      </View>

      {/* News section label */}
      <Text
        style={{
          fontSize: 11,
          fontWeight: "700",
          letterSpacing: 2,
          textTransform: "uppercase",
          paddingHorizontal: 20,
          marginBottom: 12,
          color: textSub,
        }}
      >
        Legfrissebb hírek
      </Text>

      {newsLoading ? (
        <ActivityIndicator color="#7c3aed" style={{ marginTop: 12 }} />
      ) : (
        <View style={{ paddingHorizontal: 20, gap: 8 }}>
          {news.map((n) => (
            <TouchableOpacity
              key={n.id}
              style={{
                backgroundColor: surface,
                borderRadius: 18,
                padding: 14,
                flexDirection: "row",
                alignItems: "center",
                borderWidth: 1,
                borderColor: surfaceBorder,
              }}
              onPress={() =>
                navigation.navigate(
                  "NewsDetail" as never,
                  { article: n } as never,
                )
              }
              activeOpacity={0.75}
            >
              {/* Left purple accent */}
              <View
                style={{
                  width: 50,
                  height: "175%",
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: "rgba(124,58,237,0.4)",
                  borderTopLeftRadius: 16,
                  borderBottomLeftRadius: 16,
                }}
              />
              <View style={{ flex: 1, paddingLeft: 8 }}>
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    lineHeight: 20,
                    color: textPrimary,
                  }}
                  numberOfLines={2}
                >
                  {n.title}
                </Text>
                <Text style={{ fontSize: 11, marginTop: 4, color: textMuted }}>
                  {new Date(n.createdAt).toLocaleDateString("hu-HU")}
                </Text>
              </View>
              <Text style={{ color: "#7c3aed", fontSize: 16, marginLeft: 8 }}>
                →
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* CTA card — mirrors the web's purple tinted service cards */}
      <TouchableOpacity
        style={{
          marginHorizontal: 20,
          marginTop: 16,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.12)"
            : "rgba(124,58,237,0.07)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(124,58,237,0.3)" : "rgba(124,58,237,0.2)",
          borderRadius: 20,
          padding: 20,
          flexDirection: "row",
          alignItems: "center",
          gap: 14,
        }}
        onPress={() => navigation.navigate("Vásárlás" as never)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 32 }}></Text>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: textPrimary }}>
            Jegy vásárlása
          </Text>
          <Text style={{ fontSize: 12, marginTop: 3, color: textSub }}>
            Napi, havi és éves bérletek
          </Text>
        </View>
        <Text style={{ color: "#7c3aed", fontSize: 18 }}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
