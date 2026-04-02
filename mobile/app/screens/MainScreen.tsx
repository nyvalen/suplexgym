import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch, decodeJwt, ENDPOINTS } from "../utils/auth";

const C = {
  bg: "#09090b",
  surface: "#18181b",
  border: "#27272a",
  text: "#fafafa",
  textSub: "rgba(250,250,250,0.5)",
  textMuted: "rgba(250,250,250,0.25)",
};

const SERVICES = [
  {
    emoji: "🏋️",
    title: "Erőedzés",
    desc: "Szabad súlyok, gépek és progresszív programozás.",
    tag: "Minden szint",
    color: "rgba(124,58,237,0.25)",
  },
  {
    emoji: "🤸",
    title: "Csoportos edzés",
    desc: "HIIT, jóga, boksz és más — heti 34 edzés.",
    tag: "34 / hét",
    color: "rgba(16,185,129,0.18)",
  },
  {
    emoji: "👤",
    title: "Személyi edzés",
    desc: "Négyszemközti edzések minősített edzőkkel.",
    tag: "Előfoglalás",
    color: "rgba(245,158,11,0.18)",
  },
];

interface NewsItem {
  id: number;
  title: string;
  createdAt: string;
}

export default function MainScreen() {
  const navigation = useNavigation();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [news, setNews] = useState<NewsItem[]>([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    AsyncStorage.getItem("accessToken").then((token) => {
      if (!token) return;
      const d = decodeJwt(token);
      if (d) {
        // .NET JWT uses long claim URI keys
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>
      <View style={styles.glow} />
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {username ? `Üdvözlünk, ${username}` : "Üdvözlünk"}
          </Text>
          <Text style={styles.gymName}>SUPLEX GYM</Text>
        </View>
        {role === "admin" && (
          <View style={styles.adminBadge}>
            <Text style={styles.adminBadgeText}>Admin</Text>
          </View>
        )}
      </View>

      {/* Stats */}
      <View style={styles.statsGrid}>
        {[
          { value: "1 240", label: "Aktív tagok" },
          { value: "34", label: "Heti edzések" },
          { value: "12", label: "Edzők" },
          { value: "8", label: "Évek óta" },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={styles.statValue}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Services */}
      <Text style={styles.sectionTitle}>Amit kínálunk</Text>
      {SERVICES.map((svc) => (
        <View
          key={svc.title}
          style={[styles.serviceCard, { backgroundColor: svc.color }]}
        >
          <View style={styles.serviceTop}>
            <Text style={styles.serviceEmoji}>{svc.emoji}</Text>
            <View style={styles.serviceTag}>
              <Text style={styles.serviceTagText}>{svc.tag}</Text>
            </View>
          </View>
          <Text style={styles.serviceTitle}>{svc.title}</Text>
          <Text style={styles.serviceDesc}>{svc.desc}</Text>
        </View>
      ))}

      {/* News preview */}
      <Text style={[styles.sectionTitle, { marginTop: 8 }]}>
        Legfrissebb hírek
      </Text>
      {newsLoading ? (
        <ActivityIndicator
          color="rgba(124,58,237,0.8)"
          style={{ marginTop: 12 }}
        />
      ) : (
        news.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={styles.newsCard}
            onPress={() =>
              navigation.navigate(
                "NewsDetail" as never,
                { article: n } as never,
              )
            }
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.newsTitle} numberOfLines={2}>
                {n.title}
              </Text>
              <Text style={styles.newsDate}>
                {new Date(n.createdAt).toLocaleDateString("hu-HU")}
              </Text>
            </View>
            <Text style={styles.newsArrow}>→</Text>
          </TouchableOpacity>
        ))
      )}

      {/* Quick CTA */}
      <TouchableOpacity
        style={styles.ctaCard}
        onPress={() => navigation.navigate("Vásárlás" as never)}
        activeOpacity={0.8}
      >
        <Text style={styles.ctaEmoji}>🎟️</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.ctaTitle}>Jegy vásárlása</Text>
          <Text style={styles.ctaSub}>Napi, havi és éves bérletek</Text>
        </View>
        <Text style={styles.ctaArrow}>→</Text>
      </TouchableOpacity>

      <View style={{ height: 24 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { paddingBottom: 20 },
  glow: {
    position: "absolute",
    top: -60,
    left: -60,
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: "rgba(124,58,237,0.1)",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  greeting: { color: C.textSub, fontSize: 13, marginBottom: 2 },
  gymName: {
    color: C.text,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: 2.5,
  },
  adminBadge: {
    backgroundColor: "rgba(124,58,237,0.25)",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  adminBadgeText: { color: "#c4b5fd", fontSize: 12, fontWeight: "600" },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statCard: {
    width: "47%",
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    borderRadius: 14,
    padding: 14,
  },
  statValue: {
    color: "rgba(250,250,250,0.9)",
    fontSize: 22,
    fontWeight: "600",
  },
  statLabel: { color: C.textMuted, fontSize: 11, marginTop: 2 },
  sectionTitle: {
    color: C.textSub,
    fontSize: 14,
    fontWeight: "600",
    paddingHorizontal: 20,
    marginBottom: 10,
    letterSpacing: 0.5,
  },
  serviceCard: {
    marginHorizontal: 20,
    borderRadius: 16,
    padding: 16,
    gap: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.06)",
    marginBottom: 10,
  },
  serviceTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  serviceEmoji: { fontSize: 24 },
  serviceTag: {
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  serviceTagText: {
    color: "rgba(255,255,255,0.6)",
    fontSize: 11,
    letterSpacing: 1,
  },
  serviceTitle: { color: C.text, fontSize: 15, fontWeight: "600" },
  serviceDesc: {
    color: "rgba(255,255,255,0.45)",
    fontSize: 13,
    lineHeight: 20,
  },
  newsCard: {
    marginHorizontal: 20,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderRadius: 14,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.07)",
    marginBottom: 8,
  },
  newsTitle: { color: C.text, fontSize: 14, fontWeight: "600", lineHeight: 20 },
  newsDate: { color: C.textMuted, fontSize: 11, marginTop: 4 },
  newsArrow: { color: C.textSub, fontSize: 16, marginLeft: 8 },
  ctaCard: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: "rgba(124,58,237,0.18)",
    borderWidth: 1,
    borderColor: "rgba(124,58,237,0.35)",
    borderRadius: 16,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  ctaEmoji: { fontSize: 28 },
  ctaTitle: { color: C.text, fontSize: 15, fontWeight: "600" },
  ctaSub: { color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 },
  ctaArrow: { color: "rgba(255,255,255,0.4)", fontSize: 18 },
});
