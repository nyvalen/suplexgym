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

  const inputClass = `border rounded-2xl px-[18px] py-3.5 text-sm ${
    isDark
      ? "bg-[#27272a] border-[#3f3f46] text-[#fafafa]"
      : "bg-[#f4f4f5] border-[#e4e4e7] text-[#09090b]"
  }`;

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
      />

      {/* Purple glow */}
      <View
        className="absolute -top-16 -left-16 w-[300px] h-[300px] rounded-full"
        style={{
          backgroundColor: isDark ? "rgba(124,58,237,0.18)" : "rgba(124,58,237,0.06)",
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => navigation.goBack()} className="mb-10">
          <Text className={`text-sm ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}>
            ← Vissza
          </Text>
        </Pressable>

        {/* Header */}
        <View className="items-center mb-11 gap-2.5">
          <View
            className={`w-16 h-16 rounded-xl items-center justify-center mb-1 border ${
              isDark
                ? "bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.35)]"
                : "bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.25)]"
            }`}
          >
            <Text className="text-3xl">💪</Text>
          </View>
          <Text
            className={`text-3xl font-extrabold -tracking-wide ${
              isDark ? "text-[#fafafa]" : "text-[#09090b]"
            }`}
          >
            Bejelentkezés
          </Text>
          <Text className={`text-sm ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}>
            Üdvözlünk a Suplex Gymben
          </Text>
        </View>

        {/* Form */}
        <View className="gap-4">
          <View className="gap-2">
            <Text
              className={`text-xs font-semibold tracking-[0.8px] uppercase ${
                isDark ? "text-[#a1a1aa]" : "text-[#52525b]"
              }`}
            >
              Email
            </Text>
            <TextInput
              className={inputClass}
              placeholder="te@pelda.hu"
              placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View className="gap-2">
            <Text
              className={`text-xs font-semibold tracking-[0.8px] uppercase ${
                isDark ? "text-[#a1a1aa]" : "text-[#52525b]"
              }`}
            >
              Jelszó
            </Text>
            <View className="relative">
              <TextInput
                className={inputClass}
                placeholder="••••••••"
                placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
                secureTextEntry={!pwVisible}
                value={password}
                onChangeText={setPassword}
                onSubmitEditing={handleLogin}
              />
              <Pressable
                onPress={() => setPwVisible(!pwVisible)}
                className="absolute right-4 top-0 bottom-0 justify-center"
              >
                <Text className={`text-xs ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}>
                  {pwVisible ? "Elrejt" : "Mutat"}
                </Text>
              </Pressable>
            </View>
          </View>

          {!!error && (
            <View
              className={`rounded-xl p-3.5 border ${
                isDark
                  ? "bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.25)]"
                  : "bg-[rgba(220,38,38,0.07)] border-[rgba(220,38,38,0.2)]"
              }`}
            >
              <Text
                className={`text-xs text-center ${isDark ? "text-[#f87171]" : "text-[#dc2626]"}`}
              >
                {error}
              </Text>
            </View>
          )}

          <Pressable
            className="bg-[#7c3aed] rounded-2xl py-[18px] items-center mt-1"
            style={({ pressed }) => ({ opacity: pressed || loading ? 0.75 : 1 })}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text className="text-white text-base font-bold">Bejelentkezés</Text>
            )}
          </Pressable>

          {/* Divider */}
          <View className="flex-row items-center gap-3 my-1">
            <View className={`flex-1 h-px ${isDark ? "bg-[#3f3f46]" : "bg-[#e4e4e7]"}`} />
            <Text className={`text-xs ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}>
              vagy
            </Text>
            <View className={`flex-1 h-px ${isDark ? "bg-[#3f3f46]" : "bg-[#e4e4e7]"}`} />
          </View>

          <Pressable
            onPress={() => navigation.navigate("SignUp" as never)}
            className="items-center"
            style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          >
            <Text className={`text-sm ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}>
              Nincs fiókod?{" "}
              <Text className="text-[#8b5cf6] font-bold">Regisztrálj</Text>
            </Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
