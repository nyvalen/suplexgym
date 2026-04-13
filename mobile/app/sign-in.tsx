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
import { router } from "expo-router";
import { ENDPOINTS, saveTokens } from "./utils/auth";
import { Dumbbell, Eye, EyeOff } from "lucide-react-native";
import { useTheme } from "./theme/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";

export default function SignInScreen() {
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
        router.replace("/(tabs)/main");
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
    <KeyboardAvoidingView
      className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Purple gradient blob */}

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
        <Pressable onPress={() => router.back()} className="mb-10">
          <Text
            className={`text-sm ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
          >
            ← Vissza
          </Text>
        </Pressable>

        {/* Header */}
        <View className="items-center mb-11 gap-2">
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
            Bejelentkezés
          </Text>
          <Text
            className={`text-sm ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
          >
            Üdvözlünk a Suplex Gymben
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          {/* Email */}
          <View className="gap-2">
            <Text
              className={`text-[11px] font-semibold tracking-[1px] uppercase ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
            >
              Email
            </Text>
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
              placeholder="te@pelda.hu"
              placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          {/* Password */}
          <View className="gap-2">
            <Text
              className={`text-[11px] font-semibold tracking-[1px] uppercase ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
            >
              Jelszó
            </Text>
            <View className="relative">
              <TextInput
                className={`rounded-2xl px-[18px] py-3.5 text-[15px] border pr-[70px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.12)"
                    : "rgba(0,0,0,0.1)",
                }}
                placeholder="••••••••"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                secureTextEntry={!pwVisible}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
              <Pressable
                onPress={() => setPwVisible(!pwVisible)}
                className="absolute right-4 top-0 bottom-0 justify-center"
              >
                {pwVisible ? (
                  <EyeOff color={isDark ? "#71717a" : "#a1a1aa"} size={16} />
                ) : (
                  <Eye color={isDark ? "#71717a" : "#a1a1aa"} size={16} />
                )}
              </Pressable>
            </View>
          </View>

          {/* Error */}
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

          {/* Submit */}
          <Pressable
            className="bg-[#7c3aed] rounded-[18px] py-[18px] items-center mt-1 active:opacity-75"
            onPress={handleLogin}
            disabled={loading}
            style={loading ? { opacity: 0.75 } : undefined}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">
                Bejelentkezés
              </Text>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-1">
            <View
              className="flex-1 h-px"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            />
            <Text
              className={`text-xs ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
            >
              vagy
            </Text>
            <View
              className="flex-1 h-px"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            />
          </View>

          <Pressable
            onPress={() => router.push("/sign-up")}
            className="items-center active:opacity-70"
          >
            <Text
              className={`text-sm ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
            >
              Nincs fiókod?{" "}
              <Text className="text-[#8b5cf6] font-bold">Regisztrálj</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
