import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  Animated,
  StatusBar,
} from "react-native";
import { useTheme, tokens } from "../../theme/ThemeContext";
import { router, useLocalSearchParams } from "expo-router";

const FALLBACK =
  "https://upload.wikimedia.org/wikipedia/commons/1/14/No_Image_Available.jpg";

export default function NewsDetailsScreen() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const { article: articleParam } = useLocalSearchParams<{ article: string }>();
  const article = articleParam ? JSON.parse(articleParam) : null;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className="flex-1" style={{ backgroundColor: t.bg }}>
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Hero image */}
      <View className="h-[300px] relative">
        <Image
          source={{ uri: article.imagePath || FALLBACK }}
          className="w-full h-[300px]"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/40" />
        <View
          className="absolute inset-0"
          style={{ backgroundColor: "rgba(124,58,237,0.15)" }}
        />

        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-14 left-5 w-[42px] h-[42px] rounded-full items-center justify-center border bg-black/50"
          style={{ borderColor: "rgba(255,255,255,0.2)" }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-lg font-semibold">←</Text>
        </TouchableOpacity>
      </View>

      {/* Content card — pulls up over image */}
      <Animated.View
        className="-mt-7 flex-1 rounded-tl-[28px] rounded-tr-[28px] overflow-hidden"
        style={{
          backgroundColor: t.bg,
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        }}
      >
        {/* Purple accent bar */}
        <View className="h-[3px] bg-[#7c3aed] mx-6 rounded-sm mt-[18px]" />

        <ScrollView
          contentContainerStyle={{
            padding: 24,
            paddingTop: 18,
            paddingBottom: 60,
          }}
          showsVerticalScrollIndicator={false}
        >
          <Text
            className="text-[26px] font-extrabold tracking-[-0.5px] leading-[34px] mb-2.5"
            style={{ color: t.text }}
          >
            {article.title}
          </Text>

          {article.createdAt && (
            <View
              className="flex-row items-center gap-1.5 mb-5 rounded-[10px] px-3 py-1.5 self-start border"
              style={{
                backgroundColor: isDark
                  ? "rgba(124,58,237,0.12)"
                  : "rgba(124,58,237,0.07)",
                borderColor: isDark
                  ? "rgba(124,58,237,0.25)"
                  : "rgba(124,58,237,0.15)",
              }}
            >
              <Text className="text-[#8b5cf6] text-xs font-semibold">
                {new Date(article.createdAt).toLocaleDateString("hu-HU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </Text>
            </View>
          )}

          <View
            className="h-px mb-5"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            }}
          />

          <Text
            className="text-base leading-7 tracking-[0.1px]"
            style={{ color: t.textSub }}
          >
            {article.content}
          </Text>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
