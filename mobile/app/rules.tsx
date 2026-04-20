import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Animated,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "./theme/ThemeContext";
import { useLanguage } from "./i18n/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";

const RULES = [
  { icon: "👟", key: "footwear", color: "#f59e0b" },
  { icon: "🧴", key: "hygiene", color: "#10b981" },
  { icon: "🏋️", key: "equipment", color: "#6366f1" },
  { icon: "📵", key: "phone", color: "#ec4899" },
  { icon: "🎧", key: "noise", color: "#8b5cf6" },
  { icon: "🤝", key: "respect", color: "#7c3aed" },
  { icon: "🚫", key: "substances", color: "#ef4444" },
  { icon: "⏱️", key: "peak", color: "#f97316" },
];

function RuleCard({ icon, ruleKey, color, index, isDark, t, fadeAnim, slideY }: any) {
  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideY }],
        marginBottom: 10,
      }}
    >
      <View
        style={{
          borderRadius: 20,
          overflow: "hidden",
          backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.95)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)",
        }}
      >
        {/* Thin color accent top border */}
        <View style={{ height: 2, backgroundColor: color, opacity: 0.7 }} />

        <View style={{ flexDirection: "row", alignItems: "flex-start", padding: 16, gap: 14 }}>
          {/* Icon with colored background */}
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 14,
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: `${color}18`,
              borderWidth: 1,
              borderColor: `${color}30`,
              flexShrink: 0,
            }}
          >
            <Text style={{ fontSize: 22 }}>{icon}</Text>
          </View>

          {/* Text content */}
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: isDark ? "#fafafa" : "#09090b",
                  letterSpacing: -0.2,
                  flex: 1,
                }}
              >
                {t(`rules.items.${ruleKey}.title`)}
              </Text>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "800",
                  color: `${color}99`,
                  fontVariant: ["tabular-nums"],
                  marginLeft: 8,
                }}
              >
                {String(index + 1).padStart(2, "0")}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 12,
                lineHeight: 18,
                color: isDark ? "#71717a" : "#6b7280",
              }}
            >
              {t(`rules.items.${ruleKey}.desc`)}
            </Text>
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

export default function RulesScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
      Animated.spring(slideUp, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#09090b" : "#fafafa" }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      {/* Background gradient */}
      <LinearGradient
        colors={["rgba(124,58,237,0.35)", "rgba(124,58,237,0)"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 400 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -60,
          right: -60,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: isDark ? "rgba(124,58,237,0.12)" : "rgba(124,58,237,0.06)",
        }}
      />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 20 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: "#7c3aed", fontSize: 15, fontWeight: "600" }}>
            {t("common.back")}
          </Text>
        </TouchableOpacity>

        <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY: slideUp }] }}>
          {/* Badge */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
              marginBottom: 10,
              alignSelf: "flex-start",
            }}
          >
            <View
              style={{
                backgroundColor: "rgba(124,58,237,0.15)",
                borderRadius: 8,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderWidth: 1,
                borderColor: "rgba(124,58,237,0.3)",
              }}
            >
              <Text style={{ color: "#c4b5fd", fontSize: 10, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase" }}>
                Suplex Gym
              </Text>
            </View>
          </View>

          <Text
            style={{
              fontSize: 32,
              fontWeight: "800",
              letterSpacing: -0.5,
              color: isDark ? "#fafafa" : "#09090b",
              marginBottom: 8,
            }}
          >
            {t("rules.title")}
          </Text>
          <Text
            style={{
              fontSize: 14,
              lineHeight: 22,
              color: isDark ? "#a1a1aa" : "#6b7280",
              maxWidth: 300,
            }}
          >
            {t("rules.subtitle")}
          </Text>
        </Animated.View>
      </View>

      {/* Rules list */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: Platform.OS === "android" ? 160 : 120,
        }}
        showsVerticalScrollIndicator={false}
      >
        {RULES.map(({ icon, key, color }, index) => (
          <RuleCard
            key={key}
            icon={icon}
            ruleKey={key}
            color={color}
            index={index}
            isDark={isDark}
            t={t}
            fadeAnim={fadeAnim}
            slideY={slideUp}
          />
        ))}

        {/* Footer note */}
        <Animated.View style={{ opacity: fadeAnim, marginTop: 8 }}>
          <View
            style={{
              borderRadius: 18,
              padding: 16,
              backgroundColor: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.05)",
              borderWidth: 1,
              borderColor: isDark ? "rgba(124,58,237,0.2)" : "rgba(124,58,237,0.15)",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                lineHeight: 18,
                textAlign: "center",
                color: isDark ? "#c4b5fd" : "#6d28d9",
              }}
            >
              {t("rules.footer")}
            </Text>
          </View>
        </Animated.View>
      </ScrollView>

      {/* CTA — Buy Tickets */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: Platform.OS === "android" ? 100 : 44,
        }}
      >
        <LinearGradient
          colors={isDark ? ["rgba(9,9,11,0)", "rgba(9,9,11,1)"] : ["rgba(250,250,250,0)", "rgba(250,250,250,1)"]}
          style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 120 }}
        />
        <TouchableOpacity
          onPress={() => router.push("/(tabs)/purchase")}
          activeOpacity={0.85}
          style={{
            backgroundColor: "#7c3aed",
            borderRadius: 20,
            paddingVertical: 18,
            alignItems: "center",
            shadowColor: "#7c3aed",
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.4,
            shadowRadius: 16,
            elevation: 10,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700", letterSpacing: 0.3 }}>
            {t("rules.cta")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
