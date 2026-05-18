import React, { useState, useRef } from "react";
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
  Animated,
} from "react-native";
import { router } from "expo-router";
import { ENDPOINTS, saveTokens } from "./utils/auth";
import { Dumbbell, Eye, EyeOff, AlertCircle } from "lucide-react-native";
import { useTheme } from "./theme/ThemeContext";
import { useLanguage } from "./i18n/LanguageContext";
import { LinearGradient } from "expo-linear-gradient";
import { OfflineTicket, saveTicketsOffline } from "./utils/offline-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { authFetch } from "./utils/auth";

// ─── Validation helpers ───────────────────────────────────────────────────────

function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  // RFC 5322-ish simple check
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address.";
  return null;
}

function validatePassword(password: string): string | null {
  if (!password) return "Password is required.";
  if (password.length < 1) return "Password cannot be empty.";
  return null;
}

// ─── Field component ──────────────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  isDark,
  error,
  autoCapitalize = "none",
  rightElement,
  onSubmitEditing,
  returnKeyType = "next",
  ref: inputRef,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  keyboardType?: any;
  secureTextEntry?: boolean;
  isDark: boolean;
  error?: string | null;
  autoCapitalize?: any;
  rightElement?: React.ReactNode;
  onSubmitEditing?: () => void;
  returnKeyType?: any;
  ref?: React.RefObject<TextInput>;
}) {
  const hasError = !!error;

  return (
    <View style={{ gap: 6 }}>
      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          letterSpacing: 1,
          textTransform: "uppercase",
          color: isDark ? "#a1a1aa" : "#52525b",
        }}
      >
        {label}
      </Text>
      <View style={{ position: "relative" }}>
        <TextInput
          ref={inputRef as any}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={isDark ? "#52525b" : "#a1a1aa"}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          style={{
            borderRadius: 16,
            paddingHorizontal: 18,
            paddingVertical: 14,
            fontSize: 15,
            borderWidth: 1.5,
            color: isDark ? "#fafafa" : "#09090b",
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.03)",
            borderColor: hasError
              ? isDark
                ? "rgba(248,113,113,0.6)"
                : "rgba(220,38,38,0.5)"
              : isDark
              ? "rgba(255,255,255,0.12)"
              : "rgba(0,0,0,0.1)",
            paddingRight: rightElement ? 52 : 18,
          }}
        />
        {rightElement && (
          <View
            style={{
              position: "absolute",
              right: 14,
              top: 0,
              bottom: 0,
              justifyContent: "center",
            }}
          >
            {rightElement}
          </View>
        )}
      </View>
      {hasError && (
        <View
          style={{ flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 2 }}
        >
          <AlertCircle size={12} color={isDark ? "#f87171" : "#dc2626"} />
          <Text
            style={{
              fontSize: 12,
              color: isDark ? "#f87171" : "#dc2626",
              flex: 1,
            }}
          >
            {error}
          </Text>
        </View>
      )}
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignInScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);

  const passwordRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validateForm = (): boolean => {
    const eErr = validateEmail(email);
    const pErr = validatePassword(password);
    setEmailError(eErr);
    setPasswordError(pErr);
    if (eErr || pErr) { shake(); return false; }
    return true;
  };

  const persistTicketsLocally = async () => {
    try {
      const res = await authFetch(ENDPOINTS.orders);
      if (!res.ok) return;
      const orders: { id: number; items: any[] }[] = await res.json();
      const offlineTickets: OfflineTicket[] = orders.flatMap((order) =>
        order.items.map((item) => ({
          id: item.id,
          itemName: item.itemName,
          qrCodeBase64: item.qrCodeBase64 ?? "",
          activatedAt: item.activatedAt,
          expiresAt: item.expiresAt,
          isUsed: item.isUsed ?? false,
          quantity: item.quantity ?? 1,
          price: item.price ?? 0,
          orderId: order.id,
          savedAt: new Date().toISOString(),
        }))
      );
      await saveTicketsOffline(offlineTickets);
    } catch {
      // Non-fatal
    }
  };

  const handleLogin = async () => {
    setServerError("");
    if (!validateForm()) return;

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
        persistTicketsLocally(); // fire-and-forget
        router.replace("/(tabs)/main");
      } else {
        // Map server error to friendly message
        const msg: string = data?.message ?? "";
        if (msg.toLowerCase().includes("disabled") || msg.toLowerCase().includes("inactive")) {
          setServerError("This account has been deactivated. Please contact support.");
        } else if (msg.toLowerCase().includes("invalid") || res.status === 401) {
          setServerError(t("signIn.invalidCredentials"));
          shake();
        } else {
          setServerError(msg || t("signIn.invalidCredentials"));
          shake();
        }
      }
    } catch {
      setServerError(t("signIn.networkError"));
      shake();
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: isDark ? "#09090b" : "#fafafa" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <LinearGradient
        colors={["rgba(124,58,237,0.4)", "rgba(124,58,237,0)"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 720 }}
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
        {/* Back */}
        <Pressable onPress={() => router.back()} style={{ marginBottom: 32 }}>
          <Text style={{ fontSize: 14, color: isDark ? "#71717a" : "#646464" }}>
            {t("signIn.back")}
          </Text>
        </Pressable>

        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 40, gap: 8 }}>
          <View
            style={{
              width: 64,
              height: 64,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 4,
              borderWidth: 1,
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
            style={{
              fontSize: 28,
              fontWeight: "800",
              letterSpacing: -0.5,
              color: isDark ? "#fafafa" : "#09090b",
            }}
          >
            {t("signIn.title")}
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? "#a1a1aa" : "#52525b" }}>
            {t("signIn.subtitle")}
          </Text>
        </View>

        {/* Form */}
        <Animated.View
          style={{ gap: 16, transform: [{ translateX: shakeAnim }] }}
        >
          {/* Email */}
          <FormField
            label={t("signIn.email")}
            value={email}
            onChangeText={(v) => { setEmail(v); if (emailError) setEmailError(null); setServerError(""); }}
            placeholder={t("signIn.emailPlaceholder")}
            keyboardType="email-address"
            isDark={isDark}
            error={emailError}
            onSubmitEditing={() => passwordRef.current?.focus()}
            returnKeyType="next"
          />

          {/* Password */}
          <FormField
            label={t("signIn.password")}
            value={password}
            onChangeText={(v) => { setPassword(v); if (passwordError) setPasswordError(null); setServerError(""); }}
            placeholder="••••••••"
            secureTextEntry={!pwVisible}
            isDark={isDark}
            error={passwordError}
            onSubmitEditing={handleLogin}
            returnKeyType="done"
            ref={passwordRef}
            rightElement={
              <Pressable
                onPress={() => setPwVisible((v) => !v)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                {pwVisible ? (
                  <EyeOff size={16} color={isDark ? "#71717a" : "#a1a1aa"} />
                ) : (
                  <Eye size={16} color={isDark ? "#71717a" : "#a1a1aa"} />
                )}
              </Pressable>
            }
          />

          {/* Server error */}
          {!!serverError && (
            <View
              style={{
                borderRadius: 14,
                padding: 14,
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 10,
                borderWidth: 1,
                backgroundColor: isDark
                  ? "rgba(248,113,113,0.1)"
                  : "rgba(220,38,38,0.07)",
                borderColor: isDark
                  ? "rgba(248,113,113,0.3)"
                  : "rgba(220,38,38,0.2)",
              }}
            >
              <AlertCircle
                size={16}
                color={isDark ? "#f87171" : "#dc2626"}
                style={{ marginTop: 1, flexShrink: 0 }}
              />
              <Text
                style={{
                  fontSize: 13,
                  flex: 1,
                  lineHeight: 18,
                  color: isDark ? "#f87171" : "#dc2626",
                }}
              >
                {serverError}
              </Text>
            </View>
          )}

          {/* Submit */}
          <Pressable
            onPress={handleLogin}
            disabled={loading}
            style={[
              {
                borderRadius: 18,
                paddingVertical: 18,
                alignItems: "center",
                marginTop: 4,
                backgroundColor: "rgba(124,58,237,0.8)",
                borderWidth: 1,
                borderColor: "rgba(124,58,237,0.5)",
              },
              loading && { opacity: 0.7 },
            ]}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text
                style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
              >
                {t("signIn.submit")}
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
              style={{
                flex: 1,
                height: 1,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            />
            <Text
              style={{ fontSize: 12, color: isDark ? "#71717a" : "#a1a1aa" }}
            >
              {t("signIn.or")}
            </Text>
            <View
              style={{
                flex: 1,
                height: 1,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            />
          </View>

          {/* Register link */}
          <Pressable
            onPress={() => router.push("/sign-up")}
            style={{ alignItems: "center" }}
          >
            <Text
              style={{
                fontSize: 14,
                color: isDark ? "#71717a" : "#a1a1aa",
              }}
            >
              {t("signIn.noAccount")}{" "}
              <Text style={{ color: "#8b5cf6", fontWeight: "700" }}>
                {t("signIn.register")}
              </Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
