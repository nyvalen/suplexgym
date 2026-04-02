import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ENDPOINTS, saveTokens } from "../utils/auth";

const C = {
  bg: "#09090b", surface: "#18181b", border: "#27272a",
  text: "#fafafa", textSub: "rgba(250,250,250,0.5)", textMuted: "rgba(250,250,250,0.25)",
};

export default function SignInScreen() {
  const navigation = useNavigation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) { setError("Töltsd ki az összes mezőt."); return; }
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.login, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) {
        await saveTokens(data.accessToken, data.refreshToken || "");
        navigation.navigate("NavTabs" as never);
      } else {
        setError(data.message || "Hibás email vagy jelszó.");
      }
    } catch {
      setError("Hálózati hiba. Kérjük próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg} />
      <View style={styles.glow} />
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={styles.back}>
          <Text style={styles.backText}>← Vissza</Text>
        </Pressable>

        <View style={styles.header}>
          <View style={styles.icon}><Text style={{ fontSize: 28 }}>💪</Text></View>
          <Text style={styles.title}>Bejelentkezés</Text>
          <Text style={styles.sub}>Üdvözlünk a Suplex Gymben</Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input} placeholder="te@pelda.hu"
              placeholderTextColor={C.textMuted} keyboardType="email-address"
              autoCapitalize="none" value={email} onChangeText={setEmail}
            />
          </View>
          <View style={styles.field}>
            <Text style={styles.label}>Jelszó</Text>
            <TextInput
              style={styles.input} placeholder="••••••••"
              placeholderTextColor={C.textMuted} secureTextEntry
              value={password} onChangeText={setPassword} onSubmitEditing={handleLogin}
            />
          </View>

          {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}

          <Pressable
            style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }, loading && { opacity: 0.6 }]}
            onPress={handleLogin} disabled={loading}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Bejelentkezés</Text>}
          </Pressable>

          <Pressable onPress={() => navigation.navigate("SignUp" as never)} style={styles.switchRow}>
            <Text style={styles.switchText}>
              Nincs fiókod? <Text style={styles.switchLink}>Regisztrálj</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  glow: {
    position: "absolute", top: -60, left: -60,
    width: 300, height: 300, borderRadius: 150,
    backgroundColor: "rgba(124,58,237,0.15)",
  },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 40 },
  backText: { color: "rgba(250,250,250,0.4)", fontSize: 14 },
  header: { alignItems: "center", marginBottom: 40, gap: 10 },
  icon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: "rgba(124,58,237,0.4)",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  title: { color: C.text, fontSize: 26, fontWeight: "700", letterSpacing: -0.3 },
  sub: { color: C.textSub, fontSize: 14 },
  form: { gap: 16 },
  field: { gap: 8 },
  label: { color: C.textSub, fontSize: 13, fontWeight: "500" },
  input: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderWidth: 1, borderColor: C.border,
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 14,
    color: C.text, fontSize: 15,
  },
  errorBox: {
    backgroundColor: "rgba(248,113,113,0.1)", borderRadius: 10, padding: 12,
    borderWidth: 1, borderColor: "rgba(248,113,113,0.2)",
  },
  errorText: { color: "#f87171", fontSize: 13, textAlign: "center" },
  btn: {
    backgroundColor: "rgba(124,58,237,0.8)", borderRadius: 14,
    paddingVertical: 16, alignItems: "center", marginTop: 8,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.4)",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  switchRow: { alignItems: "center", marginTop: 8 },
  switchText: { color: C.textMuted, fontSize: 14 },
  switchLink: { color: "rgba(167,139,250,0.9)", fontWeight: "600" },
});
