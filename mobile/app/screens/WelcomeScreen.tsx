import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Animated,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const C = {
  bg: "#09090b",
  text: "#fafafa",
  textSub: "rgba(250,250,250,0.5)",
  textMuted: "rgba(250,250,250,0.25)",
  purple: "rgba(124,58,237,0.8)",
  purpleBorder: "rgba(124,58,237,0.4)",
};

const STATS = [
  { value: "1 240", label: "Aktív tagok" },
  { value: "34",    label: "Heti edzés" },
  { value: "12",    label: "Edzők" },
  { value: "8",     label: "Évek" },
];

export default function WelcomeScreen() {
  const navigation = useNavigation();
  const fade = useRef(new Animated.Value(0)).current;
  const slide = useRef(new Animated.Value(32)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fade,  { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slide, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.glow1} />
      <View style={styles.glow2} />

      <Animated.View style={[styles.container, { opacity: fade, transform: [{ translateY: slide }] }]}>
        {/* Logo */}
        <View style={styles.badge}>
          <View style={styles.badgeIcon}><Text style={{ fontSize: 20 }}>💪</Text></View>
          <View>
            <Text style={styles.badgeName}>SUPLEX GYM</Text>
            <Text style={styles.badgeEst}>Alapítva 2017</Text>
          </View>
        </View>

        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroLine1}>Épülve</Text>
          <Text style={styles.heroAccent}>határtalan</Text>
          <Text style={styles.heroLine3}>lehetőségre.</Text>
          <Text style={styles.heroDesc}>
            Fókuszra tervezett tér. Haladásra kialakítva.{"\n"}Semmi felesleges — csak ami számít.
          </Text>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          {STATS.map((s) => (
            <View key={s.label} style={styles.statCard}>
              <Text style={styles.statValue}>{s.value}</Text>
              <Text style={styles.statLabel}>{s.label}</Text>
            </View>
          ))}
        </View>

        {/* CTA */}
        <View style={styles.ctaBlock}>
          <Pressable
            style={({ pressed }) => [styles.btnPrimary, pressed && { opacity: 0.75 }]}
            onPress={() => navigation.navigate("SignIn" as never)}
          >
            <Text style={styles.btnPrimaryText}>Bejelentkezés</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.btnOutline, pressed && { opacity: 0.75 }]}
            onPress={() => navigation.navigate("SignUp" as never)}
          >
            <Text style={styles.btnOutlineText}>Fiók létrehozása</Text>
          </Pressable>
        </View>

        <Text style={styles.quote}>„Az erő következetességben gyökerezik."</Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  glow1: {
    position: "absolute", top: -100, left: -100,
    width: 380, height: 380, borderRadius: 190,
    backgroundColor: "rgba(124,58,237,0.14)",
  },
  glow2: {
    position: "absolute", bottom: -60, right: -60,
    width: 260, height: 260, borderRadius: 130,
    backgroundColor: "rgba(124,58,237,0.07)",
  },
  container: {
    flex: 1, paddingHorizontal: 24,
    paddingTop: 72, paddingBottom: 40,
    justifyContent: "space-between",
  },
  badge: { flexDirection: "row", alignItems: "center", gap: 10 },
  badgeIcon: {
    width: 38, height: 38, borderRadius: 10,
    backgroundColor: "rgba(124,58,237,0.4)",
    alignItems: "center", justifyContent: "center",
  },
  badgeName: { color: "rgba(250,250,250,0.85)", fontSize: 12, fontWeight: "700", letterSpacing: 2.5 },
  badgeEst:  { color: C.textMuted, fontSize: 11, letterSpacing: 1 },
  hero: { gap: 2 },
  heroLine1: { color: C.textSub, fontSize: 20, fontWeight: "400" },
  heroAccent: { color: "#fff", fontSize: 44, fontWeight: "700", fontStyle: "italic", letterSpacing: -0.5 },
  heroLine3: { color: "rgba(250,250,250,0.6)", fontSize: 36, fontWeight: "600", letterSpacing: -0.3 },
  heroDesc: { color: C.textMuted, fontSize: 14, lineHeight: 22, marginTop: 12 },
  statsRow: { flexDirection: "row", gap: 8 },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.08)",
    borderRadius: 14, paddingVertical: 12, alignItems: "center",
  },
  statValue: { color: "rgba(250,250,250,0.9)", fontSize: 18, fontWeight: "700" },
  statLabel: { color: C.textMuted, fontSize: 10, marginTop: 2, textAlign: "center" },
  ctaBlock: { gap: 12 },
  btnPrimary: {
    backgroundColor: "rgba(124,58,237,0.8)",
    borderRadius: 14, paddingVertical: 16, alignItems: "center",
    borderWidth: 1, borderColor: "rgba(124,58,237,0.4)",
  },
  btnPrimaryText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  btnOutline: {
    backgroundColor: "rgba(255,255,255,0.04)",
    borderWidth: 1, borderColor: "rgba(255,255,255,0.12)",
    borderRadius: 14, paddingVertical: 16, alignItems: "center",
  },
  btnOutlineText: { color: "rgba(250,250,250,0.7)", fontSize: 16, fontWeight: "500" },
  quote: { color: C.textMuted, fontSize: 13, textAlign: "center", fontStyle: "italic" },
});
