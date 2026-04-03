import React, { useState } from "react";
import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator, StatusBar, TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ENDPOINTS } from "../utils/auth";
import { useTheme, tokens } from "../theme/ThemeContext";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

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

  const inputStyle = {
    backgroundColor: t.surfaceHigh, borderWidth: 1, borderColor: t.border,
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14,
    color: t.text, fontSize: 15,
  };

  const FIELDS = [
    { key: "name",     label: "Teljes név",     placeholder: "Kovács János",  keyboard: undefined as any, lower: false },
    { key: "username", label: "Felhasználónév", placeholder: "kovacsj",       keyboard: undefined as any, lower: true  },
    { key: "email",    label: "Email",           placeholder: "te@pelda.hu",   keyboard: "email-address" as const, lower: true  },
    { key: "password", label: "Jelszó",          placeholder: "••••••••",     keyboard: undefined as any, secure: true },
  ];

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={t.bg} />

      <View style={{
        position: "absolute", top: -60, right: -60,
        width: 280, height: 280, borderRadius: 140,
        backgroundColor: isDark ? "rgba(124,58,237,0.14)" : "rgba(124,58,237,0.05)",
      }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 36 }}>
          <Text style={{ color: t.textMuted, fontSize: 14 }}>← Vissza</Text>
        </Pressable>

        <View style={{ alignItems: "center", marginBottom: 40, gap: 8 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: t.primarySoft, borderWidth: 1, borderColor: t.primaryBorder,
            alignItems: "center", justifyContent: "center", marginBottom: 4,
          }}>
            <Text style={{ fontSize: 28 }}>💪</Text>
          </View>
          <Text style={{ color: t.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 }}>Regisztráció</Text>
          <Text style={{ color: t.textSub, fontSize: 14 }}>Csatlakozz a Suplex Gymhez</Text>
        </View>

        {success ? (
          <View style={{
            alignItems: "center", gap: 14, paddingTop: 20,
            backgroundColor: t.surface, borderRadius: 20, padding: 32,
            borderWidth: 1, borderColor: t.border,
          }}>
            <View style={{
              width: 72, height: 72, borderRadius: 36,
              backgroundColor: isDark ? "rgba(74,222,128,0.15)" : "rgba(22,163,74,0.1)",
              alignItems: "center", justifyContent: "center",
              borderWidth: 1, borderColor: isDark ? "rgba(74,222,128,0.3)" : "rgba(22,163,74,0.25)",
            }}>
              <Text style={{ fontSize: 32 }}>✓</Text>
            </View>
            <Text style={{ color: t.text, fontSize: 22, fontWeight: "700" }}>Sikeres regisztráció!</Text>
            <Text style={{ color: t.textSub, fontSize: 14, textAlign: "center", lineHeight: 20 }}>
              Ellenőrizd az emailed, majd jelentkezz be.
            </Text>
            <Pressable
              style={({ pressed }) => [{
                backgroundColor: t.primary, borderRadius: 14,
                paddingVertical: 16, paddingHorizontal: 32, marginTop: 8, opacity: pressed ? 0.8 : 1,
              }]}
              onPress={() => navigation.navigate("SignIn" as never)}
            >
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Bejelentkezés</Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {FIELDS.map(f => (
              <View key={f.key} style={{ gap: 7 }}>
                <Text style={{ color: t.textSub, fontSize: 12, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" }}>
                  {f.label}
                </Text>
                <TextInput
                  style={inputStyle}
                  placeholder={f.placeholder}
                  placeholderTextColor={t.textMuted}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.lower ? "none" : "words"}
                  secureTextEntry={!!(f as any).secure}
                  value={(form as any)[f.key]}
                  onChangeText={set(f.key)}
                />
              </View>
            ))}

            {!!error && (
              <View style={{
                backgroundColor: isDark ? "rgba(248,113,113,0.1)" : "rgba(220,38,38,0.07)",
                borderRadius: 12, padding: 14,
                borderWidth: 1, borderColor: isDark ? "rgba(248,113,113,0.25)" : "rgba(220,38,38,0.2)",
              }}>
                <Text style={{ color: t.danger, fontSize: 13, textAlign: "center" }}>{error}</Text>
              </View>
            )}

            <Pressable
              style={({ pressed }) => [{
                backgroundColor: t.primary, borderRadius: 16,
                paddingVertical: 18, alignItems: "center", marginTop: 4,
                opacity: pressed || loading ? 0.75 : 1,
                shadowColor: t.primary, shadowOffset: { width: 0, height: 6 },
                shadowOpacity: 0.3, shadowRadius: 12, elevation: 6,
              }]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Fiók létrehozása</Text>
              }
            </Pressable>

            <Pressable onPress={() => navigation.navigate("SignIn" as never)} style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, alignItems: "center" }]}>
              <Text style={{ color: t.textMuted, fontSize: 14 }}>
                Már van fiókod? <Text style={{ color: t.primaryLight, fontWeight: "700" }}>Bejelentkezés</Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
