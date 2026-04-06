import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  StatusBar,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../theme/ThemeContext";

const STATS = [
  { value: "1 240", label: "Aktív tagok" },
  { value: "34", label: "Heti edzés" },
  { value: "12", label: "Edzők" },
  { value: "8", label: "Évek" },
];

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
      />

      {/* Glow blobs */}
      <View
        className="absolute -top-20 -left-20 w-[340px] h-[340px] rounded-full"
        style={{
          backgroundColor: isDark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.07)",
        }}
      />
      <View
        className="absolute -bottom-12 -right-12 w-[220px] h-[220px] rounded-full"
        style={{
          backgroundColor: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.04)",
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 72, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          className="flex-1"
          style={{ opacity: fade, transform: [{ translateY: slide }] }}
        >
          {/* Badge */}
          <View className="flex-row items-center gap-2.5 mb-12">
            <View
              className={`w-[42px] h-[42px] rounded-xl items-center justify-center border ${
                isDark
                  ? "bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.35)]"
                  : "bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.25)]"
              }`}
            >
              <Text className="text-xl">💪</Text>
            </View>
            <View>
              <Text
                className={`text-xs font-bold tracking-[3px] uppercase ${
                  isDark ? "text-[#fafafa]" : "text-[#09090b]"
                }`}
              >
                SUPLEX GYM
              </Text>
              <Text
                className={`text-[10px] tracking-[1px] ${
                  isDark ? "text-[#71717a]" : "text-[#a1a1aa]"
                }`}
              >
                Alapítva 2017
              </Text>
            </View>
          </View>

          {/* Hero text */}
          <View className="mb-10">
            <Text
              className={`text-lg font-normal mb-1 ${
                isDark ? "text-[#a1a1aa]" : "text-[#52525b]"
              }`}
            >
              Épülve
            </Text>
            <Text className="text-[#7c3aed] text-5xl font-extrabold italic -tracking-wider leading-[52px]">
              határtalan
            </Text>
            <Text
              className={`text-4xl font-bold -tracking-wide leading-[42px] opacity-85 ${
                isDark ? "text-[#fafafa]" : "text-[#09090b]"
              }`}
            >
              lehetőségre.
            </Text>
            <Text
              className={`text-sm leading-[22px] mt-3.5 max-w-[280px] ${
                isDark ? "text-[#71717a]" : "text-[#a1a1aa]"
              }`}
            >
              Fókuszra tervezett tér. Haladásra kialakítva. Semmi felesleges — csak ami számít.
            </Text>
          </View>

          {/* Stats */}
          <View className="flex-row flex-wrap gap-2 mb-10">
            {STATS.map((s) => (
              <View
                key={s.label}
                className={`flex-1 min-w-[45%] border rounded-2xl py-3.5 items-center ${
                  isDark
                    ? "bg-[#18181b] border-[#3f3f46]"
                    : "bg-white border-[#e4e4e7]"
                }`}
              >
                <Text
                  className={`text-xl font-bold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                >
                  {s.value}
                </Text>
                <Text
                  className={`text-[10px] mt-0.5 text-center ${
                    isDark ? "text-[#71717a]" : "text-[#a1a1aa]"
                  }`}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA buttons */}
          <View className="gap-3 mb-8">
            <Pressable
              className="rounded-2xl py-[18px] items-center border border-[rgba(124,58,237,0.35)] bg-[#7c3aed]"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              onPress={() => navigation.navigate("SignIn" as never)}
            >
              <Text className="text-white text-base font-bold tracking-wide">
                Bejelentkezés
              </Text>
            </Pressable>

            <Pressable
              className={`rounded-2xl py-[18px] items-center border ${
                isDark
                  ? "bg-[#18181b] border-[#3f3f46]"
                  : "bg-white border-[#e4e4e7]"
              }`}
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
              onPress={() => navigation.navigate("SignUp" as never)}
            >
              <Text
                className={`text-base font-semibold ${
                  isDark ? "text-[#a1a1aa]" : "text-[#52525b]"
                }`}
              >
                Fiók létrehozása
              </Text>
            </Pressable>
          </View>

          <Text
            className={`text-xs text-center italic leading-[18px] ${
              isDark ? "text-[#71717a]" : "text-[#a1a1aa]"
            }`}
          >
            „Az erő következetességben gyökerezik."
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
