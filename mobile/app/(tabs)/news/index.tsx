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
import { ENDPOINTS } from "@/app/utils/auth";
import { useTheme } from "../../theme/ThemeContext";
import { router } from "expo-router";

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
        className="h-60 rounded-[22px] overflow-hidden mb-2 border"
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)",
          transform: [{ scale }],
        }}
      >
        <Image
          source={{ uri: item.imagePath || FALLBACK }}
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/45" />
        <View
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(124,58,237,0.15)" }}
        />
        <View className="flex-1 justify-end p-5">
          <View className="bg-[#7c3aed] self-start px-2.5 py-1 rounded-lg mb-2">
            <Text className="text-white text-[10px] font-extrabold tracking-[1.5px]">
              KIEMELT
            </Text>
          </View>
          <Text
            className="text-[22px] font-extrabold text-white leading-7"
            numberOfLines={2}
          >
            {item.title}
          </Text>
          {item.createdAt && (
            <Text className="text-[11px] text-white/60 mt-1.5">
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
        className="rounded-[18px] overflow-hidden h-[110px] flex-row border"
        style={{
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(255,255,255,0.9)",
          transform: [{ scale }],
        }}
      >
        <Image
          source={{ uri: item.imagePath || FALLBACK }}
          style={{ width: 110, height: "100%" }}
          resizeMode="cover"
        />
        <View
          className="absolute w-[110px] h-full"
          style={{ backgroundColor: "rgba(124,58,237,0.08)" }}
        />
        <View className="flex-1 p-3.5 justify-between">
          <Text
            className={`text-[13px] font-bold leading-[18px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <View>
            <Text
              className={`text-[11px] ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
              numberOfLines={2}
            >
              {item.content}
            </Text>
            <Text className="text-[11px] font-bold text-[#7c3aed] mt-1">
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
  const { isDark } = useTheme();

  useEffect(() => {
    fetch(ENDPOINTS.news)
      .then((r) => (r.ok ? r.json() : []))
      .then(setNews)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const featured = news[0] ?? null;
  const rest = news.slice(1);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Gradient blob */}
      <View
        pointerEvents="none"
        className="absolute -top-[30px] -right-[30px] w-[200px] h-[200px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      <View className="px-5 pt-16 pb-4">
        <Text
          className={`text-[30px] font-extrabold tracking-[-0.5px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
        >
          Hírek
        </Text>
        <Text
          className={`text-xs mt-0.5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
        >
          Suplex Gym értesítők
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="flex-1" />
      ) : news.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-5xl">📰</Text>
          <Text
            className={`text-lg font-bold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
          >
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
              onPress={() => router.push("/(tabs)/news/detail")}
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
