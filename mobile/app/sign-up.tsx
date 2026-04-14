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
import { ENDPOINTS } from "./utils/auth";
import { useTheme } from "./theme/ThemeContext";
import { Dumbbell, Eye, EyeOff } from "lucide-react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

export default function SignUpScreen() {
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

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["rgba(124,58,237,0.4)", "rgba(124,58,237,0)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 720,
        }}
        start={{ x: 0.3, y: 0.1 }}
        end={{ x: 0.7, y: 0.9 }}
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
        <Pressable onPress={() => router.back()} className="mb-9">
          <Text
            className={`text-sm ${isDark ? "text-[#71717a]" : "text-[#646464]"}`}
          >
            ← Vissza
          </Text>
        </Pressable>

        <View className="items-center mb-10 gap-2">
          <View
            className="w-16 h-16 rounded-2xl items-center justify-center mb-1 border"
            style={{
              backgroundColor: isDark
                ? "rgba(124,58,237,0.2)"
                : "rgba(124,58,237,0.08)",
              borderColor: isDark
                ? "rgba(124,58,237,0.4)"
                : "rgba(124,58,237,0.2)",
            }}
          >
            <Dumbbell color="white" size={32} />
          </View>
          <Text
            className={`text-[28px] font-extrabold tracking-[-0.5px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
          >
            Regisztráció
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
          >
            Csatlakozz a Suplex Gymhez
          </Text>
        </View>

        {success ? (
          <View
            className="items-center gap-3.5 pt-5 rounded-[20px] p-8 border"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.03)",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            }}
          >
            <View
              className="w-[72px] h-[72px] rounded-full items-center justify-center border"
              style={{
                backgroundColor: isDark
                  ? "rgba(74,222,128,0.15)"
                  : "rgba(22,163,74,0.1)",
                borderColor: isDark
                  ? "rgba(74,222,128,0.3)"
                  : "rgba(22,163,74,0.25)",
              }}
            >
              <Text className="text-[30px]">✓</Text>
            </View>
            <Text
              className={`text-xl font-bold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
            >
              Sikeres regisztráció!
            </Text>
            <Text
              className={`text-sm text-center leading-5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
            >
              Ellenőrizd az emailed, majd jelentkezz be.
            </Text>
            <Pressable
              className="bg-[#7c3aed] rounded-2xl py-3.5 px-8 mt-2 active:opacity-80"
              onPress={() => router.push("/sign-in")}
            >
              <Text className="text-white text-[15px] font-bold">
                Bejelentkezés
              </Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3.5">
            {FIELDS.map((f) => (
              <View key={f.key} className="gap-[7px]">
                <Text
                  className={`text-[11px] font-semibold tracking-[1px] uppercase ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
                >
                  {f.label}
                </Text>
                <View className="relative">
                  <TextInput
                    className={`rounded-2xl px-[18px] py-3.5 text-[15px] border ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.03)",
                      borderColor: isDark
                        ? "rgba(255,255,255,0.12)"
                        : "rgba(0,0,0,0.1)",
                    }}
                    placeholder={f.placeholder}
                    placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                    keyboardType={f.keyboard}
                    autoCapitalize={f.lower ? "none" : "words"}
                    secureTextEntry={!!(f as any).secure && !pwVisible}
                    value={(form as any)[f.key]}
                    onChangeText={set(f.key)}
                  />
                  {f.key === "password" && (
                    <Pressable
                      onPress={() => setPwVisible(!pwVisible)}
                      className="absolute right-4 top-0 bottom-0 justify-center"
                    >
                      {pwVisible ? (
                        <EyeOff
                          color={isDark ? "#71717a" : "#a1a1aa"}
                          size={16}
                        />
                      ) : (
                        <Eye color={isDark ? "#71717a" : "#a1a1aa"} size={16} />
                      )}
                    </Pressable>
                  )}
                </View>
              </View>
            ))}

            {!!error && (
              <View
                className="rounded-xl p-3.5 border"
                style={{
                  backgroundColor: isDark
                    ? "rgba(248,113,113,0.1)"
                    : "rgba(220,38,38,0.07)",
                  borderColor: isDark
                    ? "rgba(248,113,113,0.25)"
                    : "rgba(220,38,38,0.2)",
                }}
              >
                <Text
                  className={`text-xs text-center ${isDark ? "text-[#f87171]" : "text-[#dc2626]"}`}
                >
                  {error}
                </Text>
              </View>
            )}

            <Pressable
              className="bg-[rgba(124,58,237,0.8)] rounded-[18px] py-[18px] items-center mt-1 active:opacity-75"
              onPress={handleRegister}
              disabled={loading}
              style={loading ? { opacity: 0.75 } : undefined}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">
                  Fiók létrehozása
                </Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => router.push("/sign-in")}
              className="items-center active:opacity-70"
            ></Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
