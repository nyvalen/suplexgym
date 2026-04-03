import React, { useState } from "react";
import {
  View, Text, Pressable, ScrollView,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  StatusBar, TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ENDPOINTS, saveTokens } from "../utils/auth";
import { useTheme, tokens } from "../theme/ThemeContext";

export default function SignInScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);

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

  const inputStyle = {
    backgroundColor: t.surfaceHigh,
    borderWidth: 1, borderColor: t.border,
    borderRadius: 14, paddingHorizontal: 18, paddingVertical: 14,
    color: t.text, fontSize: 15,
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: t.bg }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={t.bg} />

      {/* Purple glow */}
      <View style={{
        position: "absolute", top: -60, left: -60, width: 300, height: 300, borderRadius: 150,
        backgroundColor: isDark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.06)",
      }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }} keyboardShouldPersistTaps="handled">
        <Pressable onPress={() => navigation.goBack()} style={{ marginBottom: 40 }}>
          <Text style={{ color: t.textMuted, fontSize: 14 }}>← Vissza</Text>
        </Pressable>

        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 44, gap: 10 }}>
          <View style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: t.primarySoft, borderWidth: 1, borderColor: t.primaryBorder,
            alignItems: "center", justifyContent: "center", marginBottom: 4,
          }}>
            <Text style={{ fontSize: 28 }}>💪</Text>
          </View>
          <Text style={{ color: t.text, fontSize: 28, fontWeight: "800", letterSpacing: -0.5 }}>
            Bejelentkezés
          </Text>
          <Text style={{ color: t.textSub, fontSize: 14 }}>
            Üdvözlünk a Suplex Gymben
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Text style={{ color: t.textSub, fontSize: 12, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" }}>
              Email
            </Text>
            <TextInput
              style={inputStyle}
              placeholder="te@pelda.hu"
              placeholderTextColor={t.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text style={{ color: t.textSub, fontSize: 12, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase" }}>
              Jelszó
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={inputStyle}
                placeholder="••••••••"
                placeholderTextColor={t.textMuted}
                secureTextEntry={!pwVisible}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
              <Pressable
                onPress={() => setPwVisible(!pwVisible)}
                style={{ position: "absolute", right: 16, top: 0, bottom: 0, justifyContent: "center" }}
              >
                <Text style={{ color: t.textMuted, fontSize: 13 }}>{pwVisible ? "Elrejt" : "Mutat"}</Text>
              </Pressable>
            </View>
          </View>

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
            onPress={handleLogin}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>Bejelentkezés</Text>
            }
          </Pressable>

          {/* Divider */}
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginVertical: 4 }}>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
            <Text style={{ color: t.textMuted, fontSize: 12 }}>vagy</Text>
            <View style={{ flex: 1, height: 1, backgroundColor: t.border }} />
          </View>

          <Pressable
            onPress={() => navigation.navigate("SignUp" as never)}
            style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1, alignItems: "center" }]}
          >
            <Text style={{ color: t.textMuted, fontSize: 14 }}>
              Nincs fiókod?{" "}
              <Text style={{ color: t.primaryLight, fontWeight: "700" }}>Regisztrálj</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
