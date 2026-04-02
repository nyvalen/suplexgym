import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  Animated,
  StatusBar,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api_endpoints } from "../config/api";

const { width } = Dimensions.get("window");

interface NewsItem {
  id: number;
  title: string;
  subtitle: string;
  content: string;
  imagePath: string;
  createdAt?: string;
}

const C = {
  bg: "#0D1117",
  surface: "#161B22",
  surfaceHigh: "#21262D",
  border: "#30363D",
  text: "#F0F6FC",
  textSub: "#8B949E",
  textMuted: "#6E7681",
  accent: "#C4873A",
};

const FALLBACK_IMG = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

// ─── Featured card (first item) ───────────────────────────────────────────────
function FeaturedCard({ item, onPress }: { item: NewsItem; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.93}
      onPressIn={() =>
        Animated.timing(scale, { toValue: 0.98, duration: 100, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
    >
      <Animated.View style={[styles.featuredCard, { transform: [{ scale }] }]}>
        <Image
          source={{ uri: item.imagePath || FALLBACK_IMG }}
          style={styles.featuredImage}
          resizeMode="cover"
        />
        <View style={styles.featuredOverlay} />
        <View style={styles.featuredContent}>
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredBadgeText}>KIEMELT</Text>
          </View>
          <Text style={styles.featuredTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.featuredSubtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : null}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Regular news card ────────────────────────────────────────────────────────
function NewsCard({ item, onPress }: { item: NewsItem; onPress: () => void }) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.93}
      onPressIn={() =>
        Animated.timing(scale, { toValue: 0.98, duration: 100, useNativeDriver: true }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
    >
      <Animated.View style={[styles.newsCard, { transform: [{ scale }] }]}>
        <Image
          source={{ uri: item.imagePath || FALLBACK_IMG }}
          style={styles.newsImage}
          resizeMode="cover"
        />
        <View style={styles.newsBody}>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.newsSub} numberOfLines={2}>
              {item.subtitle}
            </Text>
          ) : null}
          <View style={styles.newsFooter}>
            <Text style={styles.newsReadMore}>Olvasd tovább →</Text>
          </View>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function NewsListScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch(api_endpoints.news);
        if (res.ok) {
          const data = await res.json();
          setNews(data);
        }
      } catch (e) {
        console.error("Fetch news error:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const featured = news[0] ?? null;
  const rest = news.slice(1);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />

      <View style={styles.header}>
        <Text style={styles.headerTitle}>Hírek</Text>
        <Text style={styles.headerSub}>Suplex Gym értesítők</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={C.accent} style={{ flex: 1 }} />
      ) : news.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>📰</Text>
          <Text style={styles.emptyTitle}>Nincs elérhető hír</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <NewsCard
              item={item}
              onPress={() =>
                navigation.navigate("NewsDetail" as never, { article: item } as never)
              }
            />
          )}
          ListHeaderComponent={
            featured ? (
              <FeaturedCard
                item={featured}
                onPress={() =>
                  navigation.navigate("NewsDetail" as never, { article: featured } as never)
                }
              />
            ) : null
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: "800", color: C.text, letterSpacing: -0.5 },
  headerSub: { fontSize: 13, color: C.textSub, marginTop: 2 },

  listContent: { paddingHorizontal: 20, paddingBottom: 40, gap: 12 },

  // Featured
  featuredCard: {
    height: 240,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 8,
    borderWidth: 1,
    borderColor: C.border,
  },
  featuredImage: { position: "absolute", width: "100%", height: "100%" },
  featuredOverlay: {
    position: "absolute",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0,0,0,0.55)",
  },
  featuredContent: {
    flex: 1,
    justifyContent: "flex-end",
    padding: 20,
  },
  featuredBadge: {
    backgroundColor: C.accent,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  featuredBadgeText: { color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  featuredTitle: { fontSize: 22, fontWeight: "800", color: "#fff", lineHeight: 28 },
  featuredSubtitle: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },

  // Regular
  newsCard: {
    backgroundColor: C.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: "row",
    overflow: "hidden",
    height: 110,
  },
  newsImage: { width: 110, height: "100%" },
  newsBody: { flex: 1, padding: 14, justifyContent: "space-between" },
  newsTitle: { fontSize: 15, fontWeight: "700", color: C.text, lineHeight: 20 },
  newsSub: { fontSize: 12, color: C.textSub, lineHeight: 17, flex: 1, marginTop: 4 },
  newsFooter: {},
  newsReadMore: { fontSize: 12, color: C.accent, fontWeight: "700" },

  emptyBox: { flex: 1, alignItems: "center", justifyContent: "center", gap: 12 },
  emptyIcon: { fontSize: 48 },
  emptyTitle: { fontSize: 18, fontWeight: "700", color: C.text },
});
