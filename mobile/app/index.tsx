// app/index.tsx
// ── Welcome screen
//   - Detects device IP via NetInfo, pre-fills the subnet so the user only
//     types the last octet of their laptop's IP.
//   - Offline button → /offline-tickets
//   - Gear icon → IP config sheet

import React, { useRef, useEffect, use, useState } from "react";
import {
  View,
  Text,
  Pressable,
  Animated,
  StatusBar,
  ScrollView,
  Modal,
  TextInput,
  Platform,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "./theme/ThemeContext";
import { Dumbbell, Settings, Wifi } from "lucide-react-native";
import { TabBarContext } from "./context/tab-bar-context";
import { useFocusEffect } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useNetInfo } from "@react-native-community/netinfo";
import { subnetPrefix } from "./utils/offline-storage";
import { useApiStore } from "./store/apiStore";
import { DevIpSettings } from "./components/DevIpSettings";

const STATS = [
  { value: "7", label: "Személyi edző" },
  { value: "2", label: "Éve nyitva" },
  { value: "20+", label: "Gép" },
  { value: "100%", label: "elégedettség" },
];

// ─── IP Config Sheet ──────────────────────────────────────────────────────────

function IpConfigSheet({
  visible,
  onClose,
  isDark,
  deviceIp,
}: {
  visible: boolean;
  onClose: () => void;
  isDark: boolean;
  deviceIp: string | null;
}) {
  const { ip: storedIp, setIp } = useApiStore();
  const [input, setInput] = useState("");
  const [height, setHeight] = useState(false);
  const [saving, setSaving] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;

  // Pre-fill: stored IP > subnet-derived suggestion > empty
  useEffect(() => {
    if (!visible) return;
    if (storedIp && storedIp !== "192.168.0.209") {
      setInput(storedIp);
    } else if (deviceIp) {
      const prefix = subnetPrefix(deviceIp);
      setInput(prefix); // user just types the last octet
    } else {
      setInput("");
    }
  }, [visible, storedIp, deviceIp]);

  useEffect(() => {
    Animated.spring(slideAnim, {
      toValue: visible ? 1 : 0,
      tension: 65,
      friction: 11,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  const handleSave = async () => {
    const trimmed = input.trim();
    if (!trimmed) {
      Alert.alert("Invalid IP", "Please enter a valid IP address.");
      return;
    }
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (!ipv4.test(trimmed)) {
      Alert.alert("Invalid IP", "Enter a full IPv4 address, e.g. 192.168.0.15");
      return;
    }
    setSaving(true);
    try {
      await setIp(trimmed);
      Alert.alert("Saved", `API URL → http://${trimmed}:5001`, [
        { text: "OK", onPress: onClose },
      ]);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Animated.View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.55)",
          justifyContent: "flex-end",
          opacity: slideAnim,
        }}
      >
        <TouchableOpacity
          style={{ flex: 1 }}
          activeOpacity={1}
          onPress={onClose}
        />

        <Animated.View
          style={{
            transform: [
              {
                translateY: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [350, 0],
                }),
              },
            ],
            backgroundColor: isDark ? "#18181b" : "#ffffff",
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingHorizontal: 24,
            paddingTop: 16,
            paddingBottom: Platform.OS === "ios" ? 44 : 28,
            borderTopWidth: 1,
            borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          }}
        >
          <View
            style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.15)"
                : "rgba(0,0,0,0.12)",
              alignSelf: "center",
              marginBottom: 20,
            }}
          />

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 4,
            }}
          >
            <Wifi color="#7c3aed" size={20} />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "800",
                color: isDark ? "#fafafa" : "#09090b",
                letterSpacing: -0.3,
              }}
            >
              API Server IP
            </Text>
          </View>

          <Text
            style={{
              fontSize: 13,
              color: isDark ? "#a1a1aa" : "#52525b",
              marginBottom: 4,
              lineHeight: 19,
            }}
          >
            Enter your laptop's local IP (port 5001 is fixed).
          </Text>

          {deviceIp && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                marginBottom: 16,
              }}
            >
              <View
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: "#4ade80",
                }}
              />
              <Text
                style={{
                  fontSize: 12,
                  color: isDark ? "#71717a" : "#a1a1aa",
                }}
              >
                Your device IP:{" "}
                <Text
                  style={{
                    color: isDark ? "#a1a1aa" : "#52525b",
                    fontWeight: "600",
                  }}
                >
                  {deviceIp}
                </Text>
              </Text>
            </View>
          )}

          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              letterSpacing: 1,
              textTransform: "uppercase",
              color: isDark ? "#a1a1aa" : "#52525b",
              marginBottom: 6,
            }}
          >
            Laptop IP Address
          </Text>
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="192.168.0.XX"
            placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
            keyboardType="numeric"
            autoCapitalize="none"
            style={{
              borderRadius: 14,
              paddingHorizontal: 16,
              paddingVertical: 13,
              fontSize: 15,
              marginBottom: 16,
              color: isDark ? "#fafafa" : "#09090b",
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.03)",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.08)",
            }}
          />

          <TouchableOpacity
            onPress={handleSave}
            disabled={saving}
            activeOpacity={0.85}
            style={{
              backgroundColor: "#7c3aed",
              borderRadius: 16,
              paddingVertical: 15,
              alignItems: "center",
              opacity: saving ? 0.6 : 1,
              marginBottom: 10,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
              {saving ? "Saving…" : "Save & Apply"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.7}
            style={{ paddingVertical: 10, alignItems: "center" }}
          >
            <Text
              style={{
                color: isDark ? "#71717a" : "#a1a1aa",
                fontSize: 14,
              }}
            >
              Cancel
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

// ─── Welcome Screen ───────────────────────────────────────────────────────────

export default function WelcomeScreen() {
  const netInfo = useNetInfo();
  const { isDark } = useTheme();
  const [showIpConfig, setShowIpConfig] = useState(false);

  const [showDevSettings, setShowDevSettings] = useState(false);

  // Pull the device's own IP from NetInfo details
  const deviceIp =
    (netInfo.details as any)?.ipAddress ??
    (netInfo.details as any)?.ipV4Address ??
    null;

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
      if (token) router.replace("/(tabs)/main");
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
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 560 }}
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
          {/* Logo row + ⚙ gear */}
          <View className="flex-row items-center justify-between mb-[52px]">
            <View className="flex-row items-center gap-2.5">
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
                  Alapítva 2024
                </Text>
              </View>
            </View>

            {__DEV__ && (
              <TouchableOpacity
                onPress={() => setShowDevSettings(true)}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: isDark
                    ? "rgba(251,191,36,0.12)"
                    : "rgba(251,191,36,0.15)",
                  borderWidth: 1,
                  borderColor: "rgba(251,191,36,0.35)",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                activeOpacity={0.75}
              >
                <Text style={{ fontSize: 16 }}>⚙️</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Hero */}
          <View className="mb-10">
            <Text
              className={`text-[28px] font-normal mb-0.5 ${isDark ? "text-[#a1a1aa]" : "text-[#09090b]"}`}
            >
              A lehetőségek
            </Text>
            <Text className="text-[46px] font-bold italic text-[#7c3aed] tracking-[-1px] leading-[50px]">
              határtalan
            </Text>
            <Text
              className={`text-[36px] font-normal tracking-[-0.5px] leading-[42px] opacity-85 ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
            >
              tárháza.
            </Text>
            <Text
              className={`text-sm leading-[22px] mt-3.5 max-w-[280px] ${isDark ? "text-[#646464]" : "text-[#646464]"}`}
            >
              Fókuszra tervezett tér. Haladásra kialakítva. Semmi felesleges —
              csak ami számít.
            </Text>
          </View>

          {/* Stats */}
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

          {/* CTA */}
          {netInfo.isConnected === false ? (
            <View className="gap-3 mb-8">
              <View
                className="rounded-2xl py-3 px-4 flex-row items-center gap-2.5 border"
                style={{
                  backgroundColor: isDark
                    ? "rgba(248,113,113,0.1)"
                    : "rgba(220,38,38,0.06)",
                  borderColor: isDark
                    ? "rgba(248,113,113,0.25)"
                    : "rgba(220,38,38,0.15)",
                }}
              >
                <View className="w-2 h-2 rounded-full bg-[#f87171]" />
                <Text className="text-[#f87171] text-sm font-semibold">
                  No internet connection
                </Text>
              </View>
              <Pressable
                className="rounded-[18px] py-[18px] items-center bg-[rgba(124,58,237,0.8)] border border-[rgba(124,58,237,0.5)] active:opacity-80"
                onPress={() => router.push("/offline-tickets" as any)}
              >
                <Text className="text-white text-base font-bold tracking-[0.3px]">
                  View Saved Tickets
                </Text>
              </Pressable>
            </View>
          ) : (
            <View className="gap-3 mb-8">
              <Pressable
                className="rounded-[18px] py-[18px] items-center bg-[rgba(124,58,237,0.8)] border border-[rgba(124,58,237,0.5)] active:opacity-80"
                onPress={() => router.push("/sign-in")}
              >
                <Text className="text-white text-base font-bold tracking-[0.3px]">
                  Bejelentkezés
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

          <Text
            className={`text-xs text-center italic leading-[18px] ${isDark ? "text-[#71717a]" : "text-[#646464]"}`}
          >
            „Az erő következetességben gyökerezik."
          </Text>
        </Animated.View>
      </ScrollView>

      {/* <IpConfigSheet
        visible={showIpConfig}
        onClose={() => setShowIpConfig(false)}
        isDark={isDark}
        deviceIp={deviceIp}
      /> */}
      {__DEV__ && (
        <DevIpSettings
          visible={showDevSettings}
          onClose={() => setShowDevSettings(false)}
        />
      )}
    </View>
  );
}
