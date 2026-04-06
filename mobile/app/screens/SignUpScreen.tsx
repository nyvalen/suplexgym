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

export default function SignUpScreen() {
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const [form, setForm] = useState({ name: "", username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
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
    { key: "name", label: "Teljes név", placeholder: "Kovács János", keyboard: undefined as any, lower: false },
    { key: "username", label: "Felhasználónév", placeholder: "kovacsj", keyboard: undefined as any, lower: true },
    { key: "email", label: "Email", placeholder: "te@pelda.hu", keyboard: "email-address" as const, lower: true },
    { key: "password", label: "Jelszó", placeholder: "••••••••", keyboard: undefined as any, secure: true },
  ];

  const bg = isDark ? "bg-[#09090b]" : "bg-[#fafafa]";
  const textPrimary = isDark ? "text-[#fafafa]" : "text-[#09090b]";
  const textSub = isDark ? "text-[#a1a1aa]" : "text-[#52525b]";
  const textMuted = isDark ? "text-[#71717a]" : "text-[#a1a1aa]";
  const surface = isDark ? "bg-[#18181b]" : "bg-white";
  const surfaceHigh = isDark ? "bg-[#27272a]" : "bg-[#f4f4f5]";
  const border = isDark ? "border-[#3f3f46]" : "border-[#e4e4e7]";

  const inputClass = `${surfaceHigh} border ${border} rounded-2xl px-[18px] py-3.5 text-sm ${textPrimary}`;

  return (
    <KeyboardAvoidingView
      className={`flex-1 ${bg}`}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" />

      <View
        className="absolute -top-16 -right-16 w-[280px] h-[280px] rounded-full"
        style={{
          backgroundColor: isDark ? "rgba(124,58,237,0.14)" : "rgba(124,58,237,0.05)",
        }}
      />

      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingHorizontal: 24, paddingTop: 64, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => navigation.goBack()} className="mb-9">
          <Text className={`text-sm ${textMuted}`}>← Vissza</Text>
        </Pressable>

        <View className="items-center mb-10 gap-2">
          <View
            className={`w-16 h-16 rounded-xl items-center justify-center mb-1 border ${
              isDark
                ? "bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.35)]"
                : "bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.25)]"
            }`}
          >
            <Text className="text-3xl">💪</Text>
          </View>
          <Text className={`text-3xl font-extrabold -tracking-wide ${textPrimary}`}>
            Regisztráció
          </Text>
          <Text className={`text-sm ${textSub}`}>Csatlakozz a Suplex Gymhez</Text>
        </View>

        {success ? (
          <View className={`items-center gap-3.5 pt-5 ${surface} rounded-2xl p-8 border ${border}`}>
            <View
              className="w-[72px] h-[72px] rounded-full items-center justify-center border"
              style={{
                backgroundColor: isDark ? "rgba(74,222,128,0.15)" : "rgba(22,163,74,0.1)",
                borderColor: isDark ? "rgba(74,222,128,0.3)" : "rgba(22,163,74,0.25)",
              }}
            >
              <Text className="text-3xl">✓</Text>
            </View>
            <Text className={`text-xl font-bold ${textPrimary}`}>Sikeres regisztráció!</Text>
            <Text className={`text-sm text-center leading-5 ${textSub}`}>
              Ellenőrizd az emailed, majd jelentkezz be.
            </Text>
            <Pressable
              className="bg-[#7c3aed] rounded-2xl py-4 px-8 mt-2"
              style={({ pressed }) => ({ opacity: pressed ? 0.8 : 1 })}
              onPress={() => navigation.navigate("SignIn" as never)}
            >
              <Text className="text-white text-base font-bold">Bejelentkezés</Text>
            </Pressable>
          </View>
        ) : (
          <View className="gap-3.5">
            {FIELDS.map((f) => (
              <View key={f.key} className="gap-[7px]">
                <Text className={`text-xs font-semibold tracking-[0.8px] uppercase ${textSub}`}>
                  {f.label}
                </Text>
                <TextInput
                  className={inputClass}
                  placeholder={f.placeholder}
                  placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.lower ? "none" : "words"}
                  secureTextEntry={!!(f as any).secure}
                  value={(form as any)[f.key]}
                  onChangeText={set(f.key)}
                />
              </View>
            ))}

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
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text className="text-white text-base font-bold">Fiók létrehozása</Text>
              )}
            </Pressable>

            <Pressable
              onPress={() => navigation.navigate("SignIn" as never)}
              className="items-center"
              style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
            >
              <Text className={`text-sm ${textMuted}`}>
                Már van fiókod?{" "}
                <Text className="text-[#8b5cf6] font-bold">Bejelentkezés</Text>
              </Text>
            </Pressable>
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
