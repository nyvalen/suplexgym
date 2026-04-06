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
  const borderColor = isDark ? "#3f3f46" : "#e4e4e7";

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
      <Animated.View
        className="h-[240px] rounded-[20px] overflow-hidden mb-2 border"
        style={{ transform: [{ scale }], borderColor }}
      >
        <Image
          source={{ uri: item.imagePath || FALLBACK }}
          className="absolute w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute w-full h-full bg-black/50" />
        <View className="flex-1 justify-end p-5">
          <View className="bg-[#7c3aed] self-start px-2.5 py-1 rounded-lg mb-2">
            <Text className="text-white text-[10px] font-extrabold tracking-[1.5px]">
              KIEMELT
            </Text>
          </View>
          <Text className="text-2xl font-extrabold text-white leading-7" numberOfLines={2}>
            {item.title}
          </Text>
        </View>
      </Animated.View>
    </TouchableOpacity>
  );
}

function NewsCard({ item, onPress, isDark }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const surface = isDark ? "#18181b" : "#ffffff";
  const borderColor = isDark ? "#3f3f46" : "#e4e4e7";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";

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
      <Animated.View
        className="rounded-2xl overflow-hidden h-[110px] flex-row border"
        style={{ transform: [{ scale }], backgroundColor: surface, borderColor }}
      >
        <Image
          source={{ uri: item.imagePath || FALLBACK }}
          style={{ width: 110, height: "100%" }}
          resizeMode="cover"
        />
        <View className="flex-1 p-3.5 justify-between">
          <Text
            className="text-sm font-bold leading-5"
            style={{ color: textPrimary }}
            numberOfLines={2}
          >
            {item.title}
          </Text>
          <Text
            className="text-xs leading-[17px] flex-1 mt-1"
            style={{ color: textSub }}
            numberOfLines={2}
          >
            {item.content}
          </Text>
          <Text className="text-xs font-bold text-[#7c3aed]">Olvasd tovább →</Text>
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

  const bg = isDark ? "bg-[#09090b]" : "bg-[#fafafa]";
  const textPrimary = isDark ? "text-[#fafafa]" : "text-[#09090b]";
  const textSub = isDark ? "text-[#a1a1aa]" : "text-[#52525b]";

  return (
    <View className={`flex-1 ${bg}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
      />

      <View className="px-5 pt-[60px] pb-4">
        <Text className={`text-3xl font-extrabold -tracking-wide ${textPrimary}`}>
          Hírek
        </Text>
        <Text className={`text-xs mt-0.5 ${textSub}`}>Suplex Gym értesítők</Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="flex-1" />
      ) : news.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-3">
          <Text className="text-5xl">📰</Text>
          <Text className={`text-lg font-bold ${textPrimary}`}>Nincs elérhető hír</Text>
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
                navigation.navigate("NewsDetail" as never, { article: item } as never)
              }
            />
          )}
          ListHeaderComponent={
            featured ? (
              <FeaturedCard
                item={featured}
                isDark={isDark}
                onPress={() =>
                  navigation.navigate("NewsDetail" as never, { article: featured } as never)
                }
              />
            ) : null
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 10 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
