import React, { useState } from "react";
import {
  View, Text, StyleSheet, TextInput, Pressable,
  ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ENDPOINTS } from "../utils/auth";

const C = {
  bg: "#09090b", border: "#27272a",
  text: "#fafafa", textSub: "rgba(250,250,250,0.5)", textMuted: "rgba(250,250,250,0.25)",
};

export default function SignUpScreen() {
  const navigation = useNavigation();
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const set = (k: string) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    setError("");
    const { name, username, email, password } = form;
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError("Töltsd ki az összes mezőt."); return;
    }
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), username: username.trim(), email: email.trim(), password }),
      });
      const data = await res.json();
      if (res.ok) { setSuccess(true); }
      else { setError(data.message || "Regisztráció sikertelen."); }
    } catch { setError("Hálózati hiba. Kérjük próbáld újra."); }
    finally { setLoading(false); }
  };

  const FIELDS = [
    { key: "name",     label: "Teljes név",  placeholder: "Kovács János",     keyboard: undefined,      secure: false },
    { key: "username", label: "Felhasználónév", placeholder: "kovacsj",       keyboard: undefined,      secure: false, lower: true },
    { key: "email",    label: "Email",        placeholder: "te@pelda.hu",      keyboard: "email-address" as const, secure: false, lower: true },
    { key: "password", label: "Jelszó",       placeholder: "••••••••",         keyboard: undefined,      secure: true },
  ];

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
          <Text style={styles.title}>Regisztráció</Text>
          <Text style={styles.sub}>Csatlakozz a Suplex Gymhez</Text>
        </View>

        {success ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Sikeres regisztráció!</Text>
            <Text style={styles.successSub}>Ellenőrizd az emailed, majd jelentkezz be.</Text>
            <Pressable style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }]}
              onPress={() => navigation.navigate("SignIn" as never)}>
              <Text style={styles.btnText}>Bejelentkezés</Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.form}>
            {FIELDS.map(f => (
              <View key={f.key} style={styles.field}>
                <Text style={styles.label}>{f.label}</Text>
                <TextInput
                  style={styles.input}
                  placeholder={f.placeholder}
                  placeholderTextColor={C.textMuted}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.lower ? "none" : "words"}
                  secureTextEntry={f.secure}
                  value={(form as any)[f.key]}
                  onChangeText={set(f.key)}
                />
              </View>
            ))}
            {error ? <View style={styles.errorBox}><Text style={styles.errorText}>{error}</Text></View> : null}
            <Pressable
              style={({ pressed }) => [styles.btn, pressed && { opacity: 0.75 }, loading && { opacity: 0.6 }]}
              onPress={handleRegister} disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>Fiók létrehozása</Text>}
            </Pressable>
            <Pressable onPress={() => navigation.navigate("SignIn" as never)} style={styles.switchRow}>
              <Text style={styles.switchText}>
                Már van fiókod? <Text style={styles.switchLink}>Bejelentkezés</Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  glow: {
    position: "absolute", top: -60, right: -60,
    width: 280, height: 280, borderRadius: 140,
    backgroundColor: "rgba(124,58,237,0.12)",
  },
  scroll: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 60, paddingBottom: 40 },
  back: { marginBottom: 32 },
  backText: { color: "rgba(250,250,250,0.4)", fontSize: 14 },
  header: { alignItems: "center", marginBottom: 36, gap: 8 },
  icon: {
    width: 56, height: 56, borderRadius: 16,
    backgroundColor: "rgba(124,58,237,0.4)",
    alignItems: "center", justifyContent: "center", marginBottom: 4,
  },
  title: { color: C.text, fontSize: 26, fontWeight: "700", letterSpacing: -0.3 },
  sub: { color: C.textSub, fontSize: 14 },
  form: { gap: 14 },
  field: { gap: 7 },
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
    paddingVertical: 16, alignItems: "center", marginTop: 6,
    borderWidth: 1, borderColor: "rgba(124,58,237,0.4)",
  },
  btnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  switchRow: { alignItems: "center", marginTop: 8 },
  switchText: { color: C.textMuted, fontSize: 14 },
  switchLink: { color: "rgba(167,139,250,0.9)", fontWeight: "600" },
  successBox: { alignItems: "center", gap: 12, paddingTop: 20 },
  successIcon: { fontSize: 48, color: "#4ade80" },
  successTitle: { color: C.text, fontSize: 22, fontWeight: "700" },
  successSub: { color: C.textSub, fontSize: 14, textAlign: "center", paddingHorizontal: 20 },
});
