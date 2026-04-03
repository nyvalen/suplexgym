import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  Image, Animated, StatusBar, ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api_endpoints } from "../config/api";
import { useTheme, tokens } from "../theme/ThemeContext";

const FALLBACK = "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

interface NewsItem { id: number; title: string; content: string; imagePath: string; createdAt?: string; }

function FeaturedCard({ item, onPress, t, isDark }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.93}
      onPressIn={() => Animated.timing(scale, { toValue: 0.98, duration: 100, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View style={[{
        height: 240, borderRadius: 20, overflow: "hidden", marginBottom: 8,
        borderWidth: 1, borderColor: t.border,
      }, { transform: [{ scale }] }]}>
        <Image source={{ uri: item.imagePath || FALLBACK }} style={{ position: "absolute", width: "100%", height: "100%" }} resizeMode="cover" />
        <View style={{ position: "absolute", width: "100%", height: "100%", backgroundColor: "rgba(0,0,0,0.5)" }} />
        <View style={{ flex: 1, justifyContent: "flex-end", padding: 20 }}>
          <View style={{
            backgroundColor: t.primary, alignSelf: "flex-start",
            paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 8,
          }}>
            <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1.5 }}>KIEMELT</Text>
          </View>
          <Text style={{ fontSize: 22, fontWeight: "800", color: "#fff", lineHeight: 28 }} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function NewsCard({ item, onPress, t }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  return (
    <TouchableOpacity
      onPress={onPress} activeOpacity={0.93}
      onPressIn={() => Animated.timing(scale, { toValue: 0.98, duration: 100, useNativeDriver: true }).start()}
      onPressOut={() => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()}
    >
      <Animated.View style={[{
        backgroundColor: t.surface, borderRadius: 16,
        borderWidth: 1, borderColor: t.border,
        flexDirection: "row", overflow: "hidden", height: 110,
      }, { transform: [{ scale }] }]}>
        <Image source={{ uri: item.imagePath || FALLBACK }} style={{ width: 110, height: "100%" }} resizeMode="cover" />
        <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
          <Text style={{ fontSize: 15, fontWeight: "700", color: t.text, lineHeight: 20 }} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={{ fontSize: 12, color: t.textSub, lineHeight: 17, flex: 1, marginTop: 4 }} numberOfLines={2}>
            {item.content}
          </Text>
          <Text style={{ fontSize: 12, color: t.primary, fontWeight: "700" }}>Olvasd tovább →</Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

export default function NewsListScreen() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  useEffect(() => {
    fetch(api_endpoints.news)
      .then(r => r.ok ? r.json() : [])
      .then(setNews).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const featured = news[0] ?? null;
  const rest = news.slice(1);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={t.bg} />

      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: t.text, letterSpacing: -0.5 }}>Hírek</Text>
        <Text style={{ fontSize: 13, color: t.textSub, marginTop: 3 }}>Suplex Gym értesítők</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={t.primary} style={{ flex: 1 }} />
      ) : news.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 12 }}>
          <Text style={{ fontSize: 48 }}>📰</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: t.text }}>Nincs elérhető hír</Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={i => String(i.id)}
          renderItem={({ item }) => (
            <NewsCard item={item} t={t} isDark={isDark}
              onPress={() => navigation.navigate("NewsDetail" as never, { article: item } as never)}
            />
          )}
          ListHeaderComponent={featured ? (
            <FeaturedCard item={featured} t={t} isDark={isDark}
              onPress={() => navigation.navigate("NewsDetail" as never, { article: featured } as never)}
            />
          ) : null}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
