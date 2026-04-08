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
import { ENDPOINTS } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { Dumbbell, Eye, EyeOff } from "lucide-react-native";

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pwVisible, setPwVisible] = useState(false);
  const set = (k: string) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleRegister = async () => {
    setError("");
    const { name, username, email, password } = form;
    if (!name.trim() || !username.trim() || !email.trim() || !password) {
      setError("Töltsd ki az összes mezőt.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          username: username.trim(),
          email: email.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (res.ok) setSuccess(true);
      else setError(data.message || "Regisztráció sikertelen.");
    } catch {
      setError("Hálózati hiba. Kérjük próbáld újra.");
    } finally {
      setLoading(false);
    }
  };

  const FIELDS = [
    {
      key: "name",
      label: "Teljes név",
      placeholder: "Kovács János",
      keyboard: undefined as any,
      lower: false,
    },
    {
      key: "username",
      label: "Felhasználónév",
      placeholder: "kovacsj",
      keyboard: undefined as any,
      lower: true,
    },
    {
      key: "email",
      label: "Email",
      placeholder: "te@pelda.hu",
      keyboard: "email-address" as const,
      lower: true,
    },
    {
      key: "password",
      label: "Jelszó",
      placeholder: "••••••••",
      keyboard: undefined as any,
      secure: true,
    },
  ];

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

      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -64,
          right: -64,
          width: 300,
          height: 300,
          borderRadius: 150,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.16)"
            : "rgba(124,58,237,0.06)",
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
          style={{ marginBottom: 36 }}
        >
          <Text style={{ fontSize: 14, color: textMuted }}>← Vissza</Text>
        </Pressable>

        <View style={{ alignItems: "center", marginBottom: 40, gap: 8 }}>
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
            Regisztráció
          </Text>
          <Text style={{ fontSize: 14, color: textSub }}>
            Csatlakozz a Suplex Gymhez
          </Text>
        </View>

        {success ? (
          <View
            style={{
              alignItems: "center",
              gap: 14,
              paddingTop: 20,
              backgroundColor: surface,
              borderRadius: 20,
              padding: 32,
              borderWidth: 1,
              borderColor: surfaceBorder,
            }}
          >
            <View
              style={{
                width: 72,
                height: 72,
                borderRadius: 36,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isDark
                  ? "rgba(74,222,128,0.15)"
                  : "rgba(22,163,74,0.1)",
                borderWidth: 1,
                borderColor: isDark
                  ? "rgba(74,222,128,0.3)"
                  : "rgba(22,163,74,0.25)",
              }}
            >
              <Text style={{ fontSize: 30 }}>✓</Text>
            </View>
            <Text
              style={{ fontSize: 20, fontWeight: "700", color: textPrimary }}
            >
              Sikeres regisztráció!
            </Text>
            <Text
              style={{
                fontSize: 14,
                textAlign: "center",
                lineHeight: 20,
                color: textSub,
              }}
            >
              Ellenőrizd az emailed, majd jelentkezz be.
            </Text>
            <Pressable
              style={({ pressed }) => ({
                backgroundColor: "#7c3aed",
                borderRadius: 16,
                paddingVertical: 14,
                paddingHorizontal: 32,
                marginTop: 8,
                opacity: pressed ? 0.8 : 1,
              })}
              onPress={() => navigation.navigate("SignIn" as never)}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                Bejelentkezés
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={{ gap: 14 }}>
            {FIELDS.map((f) => (
              <View key={f.key} style={{ gap: 7 }}>
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    color: textSub,
                  }}
                >
                  {f.label}
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
                  placeholder={f.placeholder}
                  placeholderTextColor={textMuted}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.lower ? "none" : "words"}
                  secureTextEntry={!!(f as any).secure}
                  value={(form as any)[f.key]}
                  onChangeText={set(f.key)}
                />

                {f.key == "password" ? (
                  <Pressable
                    onPress={() => setPwVisible(!pwVisible)}
                    style={{
                      position: "absolute",
                      right: 16,
                      top: 20,
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
                ) : (
                  ""
                )}
              </View>
            ))}

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
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text
                  style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
                >
                  Fiók létrehozása
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("SignIn" as never)}
              style={({ pressed }) => ({
                alignItems: "center",
                opacity: pressed ? 0.7 : 1,
              })}
            >
              <Text style={{ fontSize: 14, color: textMuted }}>
                Már van fiókod?{" "}
                <Text style={{ color: "#8b5cf6", fontWeight: "700" }}>
                  Bejelentkezés
                </Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
