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
import { useTheme, tokens } from "../theme/ThemeContext";

const STATS = [
  { value: "1 240", label: "Aktív tagok" },
  { value: "34", label: "Heti edzés" },
  { value: "12", label: "Edzők" },
  { value: "8", label: "Évek" },
];

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.spring(slide, { toValue: 0, tension: 60, friction: 12, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={t.bg}
      />

      {/* Glow blobs */}
      <View
        style={{
          position: "absolute", top: -80, left: -80,
          width: 340, height: 340, borderRadius: 170,
          backgroundColor: isDark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.07)",
        }}
      />
      <View
        style={{
          position: "absolute", bottom: -50, right: -50,
          width: 220, height: 220, borderRadius: 110,
          backgroundColor: isDark ? "rgba(124,58,237,0.08)" : "rgba(124,58,237,0.04)",
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 72, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={{ flex: 1, opacity: fade, transform: [{ translateY: slide }] }}>
          {/* Badge */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 48 }}>
            <View style={{
              width: 42, height: 42, borderRadius: 12,
              backgroundColor: t.primarySoft,
              borderWidth: 1, borderColor: t.primaryBorder,
              alignItems: "center", justifyContent: "center",
            }}>
              <Text style={{ fontSize: 20 }}>💪</Text>
            </View>
            <View>
              <Text style={{
                color: t.text, fontSize: 11, fontWeight: "700",
                letterSpacing: 3, textTransform: "uppercase",
              }}>
                SUPLEX GYM
              </Text>
              <Text style={{ color: t.textMuted, fontSize: 10, letterSpacing: 1 }}>
                Alapítva 2017
              </Text>
            </View>
          </View>

          {/* Hero text */}
          <View style={{ marginBottom: 40 }}>
            <Text style={{ color: t.textSub, fontSize: 18, fontWeight: "400", marginBottom: 4 }}>
              Épülve
            </Text>
            <Text style={{
              color: t.primary, fontSize: 48, fontWeight: "800",
              fontStyle: "italic", letterSpacing: -1, lineHeight: 52,
            }}>
              határtalan
            </Text>
            <Text style={{
              color: t.text, fontSize: 36, fontWeight: "700",
              letterSpacing: -0.5, lineHeight: 42, opacity: 0.85,
            }}>
              lehetőségre.
            </Text>
            <Text style={{
              color: t.textMuted, fontSize: 14, lineHeight: 22, marginTop: 14, maxWidth: 280,
            }}>
              Fókuszra tervezett tér. Haladásra kialakítva. Semmi felesleges — csak ami számít.
            </Text>
          </View>

          {/* Stats */}
          <View style={{ flexDirection: "row", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
            {STATS.map((s) => (
              <View key={s.label} style={{
                flex: 1, minWidth: "45%",
                backgroundColor: t.surface,
                borderWidth: 1, borderColor: t.border,
                borderRadius: 16, paddingVertical: 14, alignItems: "center",
              }}>
                <Text style={{ color: t.text, fontSize: 20, fontWeight: "700" }}>{s.value}</Text>
                <Text style={{ color: t.textMuted, fontSize: 10, marginTop: 2, textAlign: "center" }}>{s.label}</Text>
              </View>
            ))}
          </View>

          {/* CTA buttons */}
          <View style={{ gap: 12, marginBottom: 32 }}>
            <Pressable
              style={({ pressed }) => [{
                backgroundColor: t.primary,
                borderRadius: 16, paddingVertical: 18,
                alignItems: "center",
                borderWidth: 1, borderColor: t.primaryBorder,
                opacity: pressed ? 0.8 : 1,
                shadowColor: t.primary, shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
              }]}
              onPress={() => navigation.navigate("SignIn" as never)}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700", letterSpacing: 0.5 }}>
                Bejelentkezés
              </Text>
            </Pressable>

            <Pressable
              style={({ pressed }) => [{
                backgroundColor: t.surface,
                borderRadius: 16, paddingVertical: 18,
                alignItems: "center",
                borderWidth: 1, borderColor: t.border,
                opacity: pressed ? 0.7 : 1,
              }]}
              onPress={() => navigation.navigate("SignUp" as never)}
            >
              <Text style={{ color: t.textSub, fontSize: 16, fontWeight: "600" }}>
                Fiók létrehozása
              </Text>
            </Pressable>
          </View>

          <Text style={{
            color: t.textMuted, fontSize: 12, textAlign: "center",
            fontStyle: "italic", lineHeight: 18,
          }}>
            „Az erő következetességben gyökerezik."
          </Text>
        </Animated.View>
      </ScrollView>
    </View>
  );
}
