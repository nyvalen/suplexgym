import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
  Image,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "./theme/ThemeContext";
import { useLanguage } from "./i18n/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";

const GYM_IMAGE =
  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&w=1200&q=80";

export default function RulesScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 55,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const rules: { icon: string; key: string }[] = [
    { icon: "👟", key: "footwear" },
    { icon: "🧴", key: "hygiene" },
    { icon: "🏋️", key: "equipment" },
    { icon: "📵", key: "phone" },
    { icon: "🎧", key: "noise" },
    { icon: "🤝", key: "respect" },
    { icon: "🚫", key: "substances" },
    { icon: "⏱️", key: "peak" },
  ];

  return (
    <View
      className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Hero image */}
      <View className="h-[280px] relative">
        <Image
          source={{ uri: GYM_IMAGE }}
          className="w-full h-full"
          resizeMode="cover"
        />
        <View className="absolute inset-0 bg-black/50" />
        <LinearGradient
          colors={["rgba(124,58,237,0.35)", "rgba(0,0,0,0)"]}
          style={{ position: "absolute", inset: 0 }}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
        />

        {/* Back button */}
        <TouchableOpacity
          onPress={() => router.back()}
          className="absolute top-14 left-5 w-10 h-10 rounded-full items-center justify-center border bg-black/40"
          style={{ borderColor: "rgba(255,255,255,0.2)" }}
          activeOpacity={0.8}
        >
          <Text className="text-white text-base font-semibold">←</Text>
        </TouchableOpacity>

        {/* Hero text */}
        <View className="absolute bottom-6 left-5 right-5">
          <Text
            className="text-[11px] font-bold tracking-[3px] text-white/50 uppercase mb-1"
          >
            SUPLEX GYM
          </Text>
          <Text className="text-[28px] font-extrabold text-white tracking-[-0.5px]">
            {t("rules.title")}
          </Text>
        </View>
      </View>

      {/* Content card slides up over image */}
      <Animated.View
        className="-mt-6 flex-1 rounded-tl-[28px] rounded-tr-[28px] overflow-hidden"
        style={{
          backgroundColor: isDark ? "#09090b" : "#fafafa",
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        }}
      >
        {/* Purple accent bar */}
        <View className="h-[3px] bg-[#7c3aed] mx-6 rounded-sm mt-[18px] mb-2" />

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: Platform.OS === "android" ? 160 : 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Subtitle */}
          <Text
            className={`text-sm leading-6 mb-6 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
          >
            {t("rules.subtitle")}
          </Text>

          {/* Rules list */}
          <View className="gap-3">
            {rules.map(({ icon, key }, index) => (
              <Animated.View
                key={key}
                style={{
                  opacity: fadeIn,
                  transform: [{ translateY: slideUp }],
                }}
              >
                <View
                  className="flex-row items-start gap-4 rounded-[18px] p-4 border"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(255,255,255,0.9)",
                    borderColor: isDark
                      ? "rgba(255,255,255,0.07)"
                      : "rgba(0,0,0,0.06)",
                  }}
                >
                  {/* Icon bubble */}
                  <View
                    className="w-11 h-11 rounded-[12px] items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(124,58,237,0.15)"
                        : "rgba(124,58,237,0.08)",
                    }}
                  >
                    <Text className="text-[20px]">{icon}</Text>
                  </View>

                  {/* Text */}
                  <View className="flex-1">
                    <Text
                      className={`text-[14px] font-bold mb-0.5 ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                    >
                      {t(`rules.items.${key}.title`)}
                    </Text>
                    <Text
                      className={`text-[12px] leading-[18px] ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
                    >
                      {t(`rules.items.${key}.desc`)}
                    </Text>
                  </View>

                  {/* Index number */}
                  <Text
                    className="text-[11px] font-bold self-start mt-1"
                    style={{ color: "rgba(124,58,237,0.5)" }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </Text>
                </View>
              </Animated.View>
            ))}
          </View>

          {/* Footer note */}
          <View
            className="mt-6 rounded-[16px] p-4 border"
            style={{
              backgroundColor: isDark
                ? "rgba(124,58,237,0.08)"
                : "rgba(124,58,237,0.05)",
              borderColor: isDark
                ? "rgba(124,58,237,0.2)"
                : "rgba(124,58,237,0.15)",
            }}
          >
            <Text
              className="text-[12px] leading-[18px] text-center"
              style={{ color: isDark ? "#c4b5fd" : "#6d28d9" }}
            >
              {t("rules.footer")}
            </Text>
          </View>
        </ScrollView>

        {/* CTA */}
        <View
          className="absolute bottom-0 left-0 right-0 px-5"
          style={{ paddingBottom: Platform.OS === "android" ? 100 : 40 }}
        >
          <LinearGradient
            colors={
              isDark
                ? ["rgba(9,9,11,0)", "rgba(9,9,11,1)"]
                : ["rgba(250,250,250,0)", "rgba(250,250,250,1)"]
            }
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: 100,
            }}
          />
          <TouchableOpacity
            className="bg-[#7c3aed] rounded-[20px] py-[18px] items-center"
            style={{
              shadowColor: "#7c3aed",
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.4,
              shadowRadius: 16,
              elevation: 10,
            }}
            onPress={() => router.push("/purchase")}
            activeOpacity={0.85}
          >
            <Text className="text-white text-[15px] font-bold tracking-[0.3px]">
              {t("rules.cta")}
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}
