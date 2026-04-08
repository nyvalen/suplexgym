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
import { Dumbbell } from "lucide-react-native";

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

  const bg = isDark ? "#09090b" : "#fafafa";
  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";
  const textMuted = isDark ? "#71717a" : "#a1a1aa";

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Radial gradient blobs — purple at top-left like the web */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -80,
          left: -80,
          width: 360,
          height: 360,
          borderRadius: 180,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.22)"
            : "rgba(124,58,237,0.08)",
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          bottom: -60,
          right: -60,
          width: 240,
          height: 240,
          borderRadius: 120,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
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
          style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}
        >
          {/* Badge / logo */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              marginBottom: 52,
            }}
          >
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                backgroundColor: isDark
                  ? "rgba(124,58,237,0.25)"
                  : "rgba(124,58,237,0.1)",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(124,58,237,0.45)"
                  : "rgba(124,58,237,0.25)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Dumbbell color="white" size={20} />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 11,
                  fontWeight: "700",
                  letterSpacing: 3,
                  color: isDark ? "#fafafa" : "#09090b",
                  textTransform: "uppercase",
                }}
              >
                SUPLEX GYM
              </Text>
              <Text
                style={{ fontSize: 10, letterSpacing: 1, color: textMuted }}
              >
                Alapítva 2017
              </Text>
            </View>
          </View>

          {/* Hero text — mirrors the web's italic headline */}
          <View style={{ marginBottom: 40 }}>
            <Text
              style={{
                fontSize: 17,
                fontWeight: "400",
                color: textSub,
                marginBottom: 2,
              }}
            >
              Épülve
            </Text>
            <Text
              style={{
                fontSize: 46,
                fontWeight: "800",
                fontStyle: "italic",
                color: "#7c3aed",
                letterSpacing: -1,
                lineHeight: 50,
              }}
            >
              határtalan
            </Text>
            <Text
              style={{
                fontSize: 36,
                fontWeight: "700",
                color: textPrimary,
                letterSpacing: -0.5,
                lineHeight: 42,
                opacity: 0.85,
              }}
            >
              lehetőségre.
            </Text>
            <Text
              style={{
                fontSize: 14,
                lineHeight: 22,
                marginTop: 14,
                maxWidth: 280,
                color: textMuted,
              }}
            >
              Fókuszra tervezett tér. Haladásra kialakítva. Semmi felesleges —
              csak ami számít.
            </Text>
          </View>

          {/* Stats grid — glassy cards */}
          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 8,
              marginBottom: 40,
            }}
          >
            {STATS.map((s) => (
              <View
                key={s.label}
                style={{
                  flex: 1,
                  minWidth: "45%",
                  backgroundColor: surface,
                  borderWidth: 1,
                  borderColor: surfaceBorder,
                  borderRadius: 16,
                  paddingVertical: 14,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "700",
                    color: textPrimary,
                  }}
                >
                  {s.value}
                </Text>
                <Text
                  style={{
                    fontSize: 10,
                    marginTop: 2,
                    textAlign: "center",
                    color: textMuted,
                  }}
                >
                  {s.label}
                </Text>
              </View>
            ))}
          </View>

          {/* CTA buttons */}
          <View style={{ gap: 12, marginBottom: 32 }}>
            <Pressable
              style={({ pressed }) => ({
                borderRadius: 18,
                paddingVertical: 18,
                alignItems: "center",
                backgroundColor: "#7c3aed",
                borderWidth: 1,
                borderColor: "rgba(124,58,237,0.5)",
                opacity: pressed ? 0.8 : 1,
              })}
              onPress={() => navigation.navigate("SignIn" as never)}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "700",
                  letterSpacing: 0.3,
                }}
              >
                Bejelentkezés
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => ({
                borderRadius: 18,
                paddingVertical: 18,
                alignItems: "center",
                backgroundColor: surface,
                borderWidth: 1,
                borderColor: surfaceBorder,
                opacity: pressed ? 0.7 : 1,
              })}
              onPress={() => navigation.navigate("SignUp" as never)}
            >
              <Text style={{ fontSize: 16, fontWeight: "600", color: textSub }}>
                Fiók létrehozása
              </Text>
            </Pressable>
          </View>

          {/* Quote */}
          <Text
            style={{
              fontSize: 12,
              textAlign: "center",
              fontStyle: "italic",
              lineHeight: 18,
              color: textMuted,
            }}
          >
            „Az erő következetességben gyökerezik."
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
