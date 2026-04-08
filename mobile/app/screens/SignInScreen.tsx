import React, { useState } from "react";
import {
  View,
  Text,
  Pressable,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StatusBar,
  TextInput,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { ENDPOINTS, saveTokens } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { Dumbbell, Eye, EyeOff } from "lucide-react-native";

export default function SignInScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password) {
      setError("Töltsd ki az összes mezőt.");
      return;
    }
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

  const bg = isDark ? "#09090b" : "#fafafa";
  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";
  const inputBorder = isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";
  const textMuted = isDark ? "#71717a" : "#a1a1aa";

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: bg }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Purple gradient blob */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -64,
          left: -64,
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.2)"
            : "rgba(124,58,237,0.07)",
        }}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingTop: 64,
          paddingBottom: 40,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 40 }}
        >
          <Text style={{ fontSize: 14, color: textMuted }}>← Vissza</Text>
        </Pressable>

        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 44, gap: 8 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              backgroundColor: isDark
                ? "rgba(124,58,237,0.2)"
                : "rgba(124,58,237,0.08)",
              borderWidth: 1,
              borderColor: isDark
                ? "rgba(124,58,237,0.4)"
                : "rgba(124,58,237,0.2)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
            }}
          >
            <Dumbbell color="white" size={32} />
          </View>
          <Text
            style={{
              fontSize: 28,
              fontWeight: "800",
              letterSpacing: -0.5,
              color: textPrimary,
            }}
          >
            Bejelentkezés
          </Text>
          <Text style={{ fontSize: 14, color: textSub }}>
            Üdvözlünk a Suplex Gymben
          </Text>
        </View>

        {/* Form */}
        <View style={{ gap: 16 }}>
          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                letterSpacing: 1,
                textTransform: "uppercase",
                color: textSub,
              }}
            >
              Email
            </Text>
            <TextInput
              style={{
                backgroundColor: inputBg,
                borderWidth: 1,
                borderColor: inputBorder,
                borderRadius: 16,
                paddingHorizontal: 18,
                paddingVertical: 14,
                fontSize: 15,
                color: textPrimary,
              }}
              placeholder="te@pelda.hu"
              placeholderTextColor={textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={{ gap: 8 }}>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                letterSpacing: 1,
                textTransform: "uppercase",
                color: textSub,
              }}
            >
              Jelszó
            </Text>
            <View style={{ position: "relative" }}>
              <TextInput
                style={{
                  backgroundColor: inputBg,
                  borderWidth: 1,
                  borderColor: inputBorder,
                  borderRadius: 16,
                  paddingHorizontal: 18,
                  paddingVertical: 14,
                  fontSize: 15,
                  color: textPrimary,
                  paddingRight: 70,
                }}
                placeholder="••••••••"
                placeholderTextColor={textMuted}
                secureTextEntry={!pwVisible}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
              <Pressable
                onPress={() => setPwVisible(!pwVisible)}
                style={{
                  position: "absolute",
                  right: 16,
                  top: 0,
                  bottom: 0,
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 12, color: textMuted }}>
                  {pwVisible ? (
                    <EyeOff color="white" size={16} />
                  ) : (
                    <Eye color="white" size={16} />
                  )}
                </Text>
              </Pressable>
            </View>
          </View>

          {!!error && (
            <View
              style={{
                borderRadius: 12,
                padding: 14,
                backgroundColor: isDark
                  ? "rgba(248,113,113,0.1)"
                  : "rgba(220,38,38,0.07)",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(248,113,113,0.25)"
                  : "rgba(220,38,38,0.2)",
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  textAlign: "center",
                  color: isDark ? "#f87171" : "#dc2626",
                }}
              >
                {error}
              </Text>
            </View>
          )}

          <Pressable
            style={({ pressed }) => ({
              backgroundColor: "#7c3aed",
              borderRadius: 18,
              paddingVertical: 18,
              alignItems: "center",
              marginTop: 4,
              opacity: pressed || loading ? 0.75 : 1,
            })}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}>
                Bejelentkezés
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 12,
              marginVertical: 4,
            }}
          >
            <View
              style={{ flex: 1, height: 1, backgroundColor: surfaceBorder }}
            />
            <Text style={{ fontSize: 12, color: textMuted }}>vagy</Text>
            <View
              style={{ flex: 1, height: 1, backgroundColor: surfaceBorder }}
            />
          </View>

          <Pressable
            onPress={() => navigation.navigate("SignUp" as never)}
            style={({ pressed }) => ({
              alignItems: "center",
              opacity: pressed ? 0.7 : 1,
            })}
          >
            <Text style={{ fontSize: 14, color: textMuted }}>
              Nincs fiókod?{" "}
              <Text style={{ color: "#8b5cf6", fontWeight: "700" }}>
                Regisztrálj
              </Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
