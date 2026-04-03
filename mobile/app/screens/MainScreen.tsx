import React, { useEffect, useState } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  StatusBar, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch, decodeJwt, ENDPOINTS } from "../utils/auth";
import { useTheme, tokens } from "../theme/ThemeContext";

const SERVICES = [
  { emoji: "🏋️", title: "Erőedzés", desc: "Szabad súlyok, gépek és progresszív programozás.", tag: "Minden szint", tint: "rgba(124,58,237,0.22)" },
  { emoji: "🤸", title: "Csoportos edzés", desc: "HIIT, jóga, boksz — heti 34 edzés.", tag: "34 / hét", tint: "rgba(16,185,129,0.15)" },
  { emoji: "👤", title: "Személyi edzés", desc: "Négyszemközti edzések minősített edzőkkel.", tag: "Előfoglalás", tint: "rgba(245,158,11,0.15)" },
];

interface NewsItem { id: number; title: string; createdAt: string; }

export default function MainScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("accessToken").then(tok => {
      if (!tok) return;
      const d = decodeJwt(tok);
      if (d) {
        setUsername(d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"] || d.unique_name || d.name || "");
        setRole(d.role || "");
      }
    });
    fetch(ENDPOINTS.news)
      .then(r => r.ok ? r.json() : [])
      .then((data: NewsItem[]) => setNews(data.slice(0, 3)))
      .catch(() => {})
      .finally(() => setNewsLoading(false));
  }, []);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: t.bg }} contentContainerStyle={{ paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={t.bg} />

      {/* Purple glow */}
      <View style={{
        position: "absolute", top: -50, left: -50,
        width: 260, height: 260, borderRadius: 130,
        backgroundColor: isDark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.06)",
      }} />

      {/* Header */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 20, paddingTop: 24, paddingBottom: 20 }}>
        <View>
          <Text style={{ color: t.textSub, fontSize: 13, marginBottom: 2 }}>
            {username ? `Üdvözlünk, ${username}` : "Üdvözlünk"}
          </Text>
          <Text style={{ color: t.text, fontSize: 22, fontWeight: "800", letterSpacing: 3 }}>
            SUPLEX GYM
          </Text>
        </View>
        {role === "admin" && (
          <View style={{
            backgroundColor: t.primarySoft, borderRadius: 10,
            paddingHorizontal: 12, paddingVertical: 6,
            borderWidth: 1, borderColor: t.primaryBorder,
          }}>
            <Text style={{ color: t.accent, fontSize: 11, fontWeight: "700", letterSpacing: 0.5 }}>Admin</Text>
          </View>
        )}
      </View>

      {/* Stats grid */}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10, paddingHorizontal: 20, marginBottom: 28 }}>
        {[
          { value: "1 240", label: "Aktív tagok" },
          { value: "34", label: "Heti edzések" },
          { value: "12", label: "Edzők" },
          { value: "8", label: "Évek óta" },
        ].map(s => (
          <View key={s.label} style={{
            width: "47%",
            backgroundColor: t.surface, borderWidth: 1, borderColor: t.border,
            borderRadius: 16, padding: 16,
          }}>
            <Text style={{ color: t.text, fontSize: 24, fontWeight: "700" }}>{s.value}</Text>
            <Text style={{ color: t.textMuted, fontSize: 11, marginTop: 2 }}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Services */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", paddingHorizontal: 20, marginBottom: 12 }}>
        Amit kínálunk
      </Text>
      {SERVICES.map(svc => (
        <View key={svc.title} style={{
          marginHorizontal: 20, borderRadius: 18, padding: 18,
          backgroundColor: svc.tint, borderWidth: 1, borderColor: t.border,
          marginBottom: 10, gap: 6,
        }}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <Text style={{ fontSize: 24 }}>{svc.emoji}</Text>
            <View style={{
              backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
              borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4,
            }}>
              <Text style={{ color: t.textSub, fontSize: 11, letterSpacing: 0.5 }}>{svc.tag}</Text>
            </View>
          </View>
          <Text style={{ color: t.text, fontSize: 16, fontWeight: "700" }}>{svc.title}</Text>
          <Text style={{ color: t.textSub, fontSize: 13, lineHeight: 20 }}>{svc.desc}</Text>
        </View>
      ))}

      {/* News preview */}
      <Text style={{ color: t.textSub, fontSize: 12, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", paddingHorizontal: 20, marginTop: 8, marginBottom: 12 }}>
        Legfrissebb hírek
      </Text>

      {newsLoading ? (
        <ActivityIndicator color={t.primary} style={{ marginTop: 12 }} />
      ) : (
        news.map(n => (
          <TouchableOpacity
            key={n.id}
            style={{
              marginHorizontal: 20, backgroundColor: t.surface,
              borderRadius: 14, padding: 14, flexDirection: "row",
              alignItems: "center", borderWidth: 1, borderColor: t.border, marginBottom: 8,
            }}
            onPress={() => navigation.navigate("NewsDetail" as never, { article: n } as never)}
            activeOpacity={0.75}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: t.text, fontSize: 14, fontWeight: "600", lineHeight: 20 }} numberOfLines={2}>
                {n.title}
              </Text>
              <Text style={{ color: t.textMuted, fontSize: 11, marginTop: 4 }}>
                {new Date(n.createdAt).toLocaleDateString("hu-HU")}
              </Text>
            </View>
            <Text style={{ color: t.primary, fontSize: 16, marginLeft: 8 }}>→</Text>
          </TouchableOpacity>
        ))
      )}

      {/* CTA */}
      <TouchableOpacity
        style={{
          marginHorizontal: 20, marginTop: 14,
          backgroundColor: t.primarySoft,
          borderWidth: 1, borderColor: t.primaryBorder,
          borderRadius: 18, padding: 20, flexDirection: "row", alignItems: "center", gap: 14,
        }}
        onPress={() => navigation.navigate("Vásárlás" as never)}
        activeOpacity={0.8}
      >
        <Text style={{ fontSize: 28 }}>🎟️</Text>
        <View style={{ flex: 1 }}>
          <Text style={{ color: t.text, fontSize: 15, fontWeight: "700" }}>Jegy vásárlása</Text>
          <Text style={{ color: t.textSub, fontSize: 12, marginTop: 2 }}>Napi, havi és éves bérletek</Text>
        </View>
        <Text style={{ color: t.primary, fontSize: 18 }}>→</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
