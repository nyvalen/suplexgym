import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Image,
  Animated,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { api_endpoints } from "../config/api";
import { useTheme } from "../theme/ThemeContext";

const FALLBACK =
  "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

interface NewsItem {
  id: number;
  title: string;
  content: string;
  imagePath: string;
  createdAt?: string;
}

function FeaturedCard({ item, onPress, isDark }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const surfaceBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.93}
      onPressIn={() =>
        Animated.timing(scale, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
    >
      <Animated.View
        style={{
          height: 240,
          borderRadius: 22,
          overflow: "hidden",
          marginBottom: 8,
          borderWidth: 1,
          borderColor: surfaceBorder,
          transform: [{ scale }],
        }}
      >
        <Image
          source={{ uri: item.imagePath || FALLBACK }}
          style={{ position: "absolute", width: "100%", height: "100%" }}
          resizeMode="cover"
        />
        {/* Gradient-like overlay — two layered semi-transparent views */}
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.45)",
          }}
        />
        <View
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: "rgba(124,58,237,0.15)",
          }}
        />
        <View style={{ flex: 1, justifyContent: "flex-end", padding: 20 }}>
          <View
            style={{
              backgroundColor: "#7c3aed",
              alignSelf: "flex-start",
              paddingHorizontal: 10,
              paddingVertical: 4,
              borderRadius: 8,
              marginBottom: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 10,
                fontWeight: "800",
                letterSpacing: 1.5,
              }}
            >
              KIEMELT
            </Text>
          </View>
          <Text
            style={{
              fontSize: 22,
              fontWeight: "800",
              color: "#fff",
              lineHeight: 28,
            }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.createdAt && (
            <Text
              style={{
                fontSize: 11,
                color: "rgba(255,255,255,0.6)",
                marginTop: 6,
              }}
            >
              {new Date(item.createdAt).toLocaleDateString("hu-HU")}
            </Text>
          )}
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function NewsCard({ item, onPress, isDark }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.93}
      onPressIn={() =>
        Animated.timing(scale, {
          toValue: 0.98,
          duration: 100,
          useNativeDriver: true,
        }).start()
      }
      onPressOut={() =>
        Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start()
      }
    >
      <Animated.View
        style={{
          borderRadius: 18,
          overflow: "hidden",
          height: 110,
          flexDirection: "row",
          borderWidth: 1,
          borderColor: surfaceBorder,
          backgroundColor: surface,
          transform: [{ scale }],
        }}
      >
        <Image
          source={{ uri: item.imagePath || FALLBACK }}
          style={{ width: 110, height: "100%" }}
          resizeMode="cover"
        />
        {/* Purple tint on image */}
        <View
          style={{
            position: "absolute",
            width: 110,
            height: "100%",
            backgroundColor: "rgba(124,58,237,0.08)",
          }}
        />
        <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
          <Text
            style={{
              fontSize: 13,
              fontWeight: "700",
              lineHeight: 18,
              color: textPrimary,
            }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View>
            <Text style={{ fontSize: 11, color: textSub }} numberOfLines={2}>
              {item.content}
            </Text>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: "#7c3aed",
                marginTop: 4,
              }}
            >
              Olvasd tovább →
            </Text>
          </View>
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

  useEffect(() => {
    fetch(api_endpoints.news)
      .then((r) => (r.ok ? r.json() : []))
      .then(setNews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = news[0] ?? null;
  const rest = news.slice(1);

  const bg = isDark ? "#09090b" : "#fafafa";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient blob */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      <View
        style={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 16 }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            letterSpacing: -0.5,
            color: textPrimary,
          }}
        >
          Hírek
        </Text>
        <Text style={{ fontSize: 12, marginTop: 2, color: textSub }}>
          Suplex Gym értesítők
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ flex: 1 }} />
      ) : news.length === 0 ? (
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
          }}
        >
          <Text style={{ fontSize: 48 }}>📰</Text>
          <Text style={{ fontSize: 18, fontWeight: "700", color: textPrimary }}>
            Nincs elérhető hír
          </Text>
        </View>
      ) : (
        <FlatList
          data={rest}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => (
            <NewsCard
              item={item}
              isDark={isDark}
              onPress={() =>
                navigation.navigate(
                  "NewsDetail" as never,
                  { article: item } as never,
                )
              }
            />
          )}
          ListHeaderComponent={
            featured ? (
              <FeaturedCard
                item={featured}
                isDark={isDark}
                onPress={() =>
                  navigation.navigate(
                    "NewsDetail" as never,
                    { article: featured } as never,
                  )
                }
              />
            ) : null
          }
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 40,
            gap: 10,
          }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
