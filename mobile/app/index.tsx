import React, { useRef, useEffect, use } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  StatusBar,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "./theme/ThemeContext";
import { Dumbbell } from "lucide-react-native";
import { TabBarContext } from "./context/tab-bar-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useNetInfo } from "@react-native-community/netinfo";
import { Component } from "react";
import { Button, Alert, Platform } from "react-native";

const STATS = [
  { value: "1 240", label: "Aktív tagok" },
  { value: "34", label: "Heti edzés" },
  { value: "12", label: "Edzők" },
  { value: "8", label: "Évek" },
];

export default function WelcomeScreen() {
  const netInfo = useNetInfo();
  const ipAddress = netInfo.details?.ipAddress;
  const { isDark } = useTheme();

  const { setIsTabBarHidden } = use(TabBarContext);

  useFocusEffect(() => {
    setIsTabBarHidden(true);
    return () => setIsTabBarHidden(false);
  });

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    const forwardUser = async () => {
      const token = await AsyncStorage.getItem("accessToken");
      if (token !== null && token !== "") {
        router.replace("/(tabs)/main");
      }
    };
    forwardUser();
  }, []);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(slide, {
        toValue: 0,
        tension: 60,
        friction: 12,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Radial gradient blobs */}
      <View
        pointerEvents="none"
        className="absolute -top-20 -left-20 w-[360px] h-[360px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.22)"
            : "rgba(124,58,237,0.08)",
        }}
      />
      <View
        pointerEvents="none"
        className="absolute -bottom-[60px] -right-[60px] w-60 h-60 rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />
      <LinearGradient
        colors={["rgba(124,58,237,0.4)", "rgba(124,58,237,0)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 560,
        }}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 0.4, y: 0.9 }}
      />
      <LinearGradient
        colors={["rgba(124,58,237,0.4)", "rgba(124,58,237,0)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 600,
          height: 560,
        }}
        start={{ x: 1, y: 0.5 }}
        end={{ x: 0.8, y: 0.1 }}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 72,
          paddingBottom: 48,
        }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View
          className="flex-1"
          style={{ opacity: fade, transform: [{ translateY: slide }] }}
        >
          {/* Badge / logo */}
          <View className="flex-row items-center gap-2.5 mb-[52px]">
            <View
              className="w-10 h-10 rounded-[10px] items-center justify-center border"
              style={{
                backgroundColor: isDark
                  ? "rgba(124,58,237,0.25)"
                  : "rgba(124,58,237,0.1)",
                borderColor: isDark
                  ? "rgba(124,58,237,0.45)"
                  : "rgba(124,58,237,0.25)",
              }}
            >
              <Dumbbell color="white" size={20} />
            </View>
            <View>
              <Text
                className={`text-[11px] font-bold tracking-[3px] uppercase ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
              >
                SUPLEX GYM
              </Text>
              <Text
                className={`text-[10px] tracking-[1px] ${isDark ? "text-[#71717a]" : "text-[#646464]"}`}
              >
                Alapítva 2017
              </Text>
            </View>
          </View>
          {/* Hero text */}
          <View className="mb-10">
            <Text
              className={`text-[17px] font-normal mb-0.5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
            >
              Épülve
            </Text>
            <Text className="text-[46px] font-extrabold italic text-[#7c3aed] tracking-[-1px] leading-[50px]">
              határtalan
            </Text>
            <Text
              className={`text-[36px] font-bold tracking-[-0.5px] leading-[42px] opacity-85 ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
            >
              lehetőségre.
            </Text>
            <Text
              className={`text-sm leading-[22px] mt-3.5 max-w-[280px] ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
            >
              Fókuszra tervezett tér. Haladásra kialakítva. Semmi felesleges —
              csak ami számít.
            </Text>
          </View>
          {/* Stats grid */}
          <View className="flex-row flex-wrap gap-2 mb-10">
            {STATS.map((s) => (
              <View
                key={s.label}
                className="flex-1 min-w-[45%] rounded-2xl py-3.5 items-center border"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                <Text
                  className={`text-xl font-bold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                >
                  {s.value}
                </Text>
                <Text
                  className={`text-[10px] mt-0.5 text-center ${isDark ? "text-[#71717a]" : "text-[#646464]"}`}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>
          {/* CTA buttons */}
          {netInfo.isConnected == false ? (
            <Pressable
              className="mt-3.5 rounded-[18px] py-[18px] items-center gap-3 mb-8  bg-[rgba(124,58,237,0.8)] border border-[rgba(124,58,237,0.5)] active:opacity-80"
              onPress={() => console.log(ipAddress)}
            >
              <Text className="text-white text-base font-bold tracking-[0.3px]">
                Letöltött jegyek megjelenítése
              </Text>
            </Pressable>
          ) : (
            <View className="gap-3 mb-8">
              <Pressable
                className="rounded-[18px] py-[18px] items-center  bg-[rgba(124,58,237,0.8)] border border-[rgba(124,58,237,0.5)] active:opacity-80"
                onPress={() => router.push("/sign-in")}
              >
                <Text className="text-white text-base font-bold tracking-[0.3px]">
                  {/* Bejelentkezés */}
                </Text>
              </Pressable>

              <Pressable
                className="rounded-[18px] py-[18px] items-center border active:opacity-70"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                }}
                onPress={() => router.push("/sign-up")}
              >
                <Text
                  className={`text-base font-semibold ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
                >
                  Fiók létrehozása
                </Text>
              </Pressable>
            </View>
          )}
          {/* Quote */}
          <Text
            className={`text-xs text-center italic leading-[18px] ${isDark ? "text-[#71717a]" : "text-[#646464]"}`}
          >
            „Az erő következetességben gyökerezik."
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
