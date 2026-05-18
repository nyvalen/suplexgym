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
import { ENDPOINTS } from "./utils/auth";
import { useTheme } from "./theme/ThemeContext";
import { useLanguage } from "./i18n/LanguageContext";
import {
  Dumbbell,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Circle,
} from "lucide-react-native";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

// ─── Validation rules ─────────────────────────────────────────────────────────

export interface PasswordStrength {
  minLength: boolean;   // ≥ 10 characters
  hasUppercase: boolean; // at least 1 uppercase letter
  hasLowercase: boolean; // at least 1 lowercase letter
  hasNumber: boolean;   // at least 1 digit
  hasSpecial: boolean;  // at least 1 special character
}

export function getPasswordStrength(password: string): PasswordStrength {
  return {
    minLength: password.length >= 10,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };
}

export function isPasswordValid(password: string): boolean {
  const s = getPasswordStrength(password);
  return s.minLength && s.hasUppercase && s.hasLowercase && s.hasNumber && s.hasSpecial;
}

function validateEmail(email: string): string | null {
  const trimmed = email.trim();
  if (!trimmed) return "Email is required.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(trimmed)) return "Please enter a valid email address.";
  return null;
}

function validateName(name: string): string | null {
  if (!name.trim()) return "Full name is required.";
  if (name.trim().length < 2) return "Name must be at least 2 characters.";
  return null;
}

function validateUsername(username: string): string | null {
  if (!username.trim()) return "Username is required.";
  if (username.trim().length < 3) return "Username must be at least 3 characters.";
  if (username.trim().length > 15) return "Username cannot exceed 15 characters.";
  if (!/^[a-z0-9_]+$/.test(username.trim()))
    return "Username can only contain lowercase letters, numbers and underscores.";
  return null;
}

function validatePasswordField(password: string): string | null {
  if (!password) return "Password is required.";
  if (!isPasswordValid(password)) {
    return "Password must meet all requirements below.";
  }
  return null;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

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
  inputRef,
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
  inputRef?: React.RefObject<TextInput>;
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
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 5,
            paddingHorizontal: 2,
          }}
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

function PasswordStrengthIndicator({
  password,
  isDark,
}: {
  password: string;
  isDark: boolean;
}) {
  if (!password) return null;
  const s = getPasswordStrength(password);

  const rules: { key: keyof PasswordStrength; label: string }[] = [
    { key: "minLength", label: "At least 10 characters" },
    { key: "hasUppercase", label: "One uppercase letter (A–Z)" },
    { key: "hasLowercase", label: "One lowercase letter (a–z)" },
    { key: "hasNumber", label: "One number (0–9)" },
    { key: "hasSpecial", label: "One special character (!@#$…)" },
  ];

  const passed = Object.values(s).filter(Boolean).length;
  const total = rules.length;

  // Progress bar color
  const barColor =
    passed <= 1
      ? "#ef4444"
      : passed <= 2
      ? "#f97316"
      : passed <= 3
      ? "#eab308"
      : passed === 4
      ? "#84cc16"
      : "#22c55e";

  return (
    <View
      style={{
        borderRadius: 14,
        padding: 14,
        gap: 10,
        backgroundColor: isDark
          ? "rgba(255,255,255,0.04)"
          : "rgba(0,0,0,0.03)",
        borderWidth: 1,
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      }}
    >
      {/* Progress bar */}
      <View>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 6,
          }}
        >
          <Text
            style={{
              fontSize: 11,
              fontWeight: "600",
              color: isDark ? "#71717a" : "#a1a1aa",
            }}
          >
            Password strength
          </Text>
          <Text
            style={{ fontSize: 11, fontWeight: "700", color: barColor }}
          >
            {passed === 0
              ? "Very Weak"
              : passed === 1
              ? "Weak"
              : passed === 2
              ? "Fair"
              : passed === 3
              ? "Good"
              : passed === 4
              ? "Strong"
              : "Very Strong"}
          </Text>
        </View>
        <View
          style={{
            height: 4,
            borderRadius: 2,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.08)",
            overflow: "hidden",
          }}
        >
          <View
            style={{
              height: "100%",
              width: `${(passed / total) * 100}%`,
              backgroundColor: barColor,
              borderRadius: 2,
            }}
          />
        </View>
      </View>

      {/* Rules */}
      <View style={{ gap: 6 }}>
        {rules.map((rule) => {
          const ok = s[rule.key];
          return (
            <View
              key={rule.key}
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              {ok ? (
                <CheckCircle size={13} color="#22c55e" />
              ) : (
                <Circle
                  size={13}
                  color={isDark ? "#52525b" : "#d4d4d8"}
                />
              )}
              <Text
                style={{
                  fontSize: 12,
                  color: ok
                    ? isDark
                      ? "#a1a1aa"
                      : "#52525b"
                    : isDark
                    ? "#52525b"
                    : "#a1a1aa",
                  textDecorationLine: ok ? "none" : "none",
                }}
              >
                {rule.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function SignUpScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    name: null as string | null,
    username: null as string | null,
    email: null as string | null,
    password: null as string | null,
  });
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pwVisible, setPwVisible] = useState(false);
  const [showStrength, setShowStrength] = useState(false);

  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const set = (k: keyof typeof form) => (v: string) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: null }));
    setServerError("");
  };

  const shake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 60, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
    ]).start();
  };

  const validateAll = (): boolean => {
    const nameErr = validateName(form.name);
    const usernameErr = validateUsername(form.username);
    const emailErr = validateEmail(form.email);
    const passwordErr = validatePasswordField(form.password);
    setErrors({
      name: nameErr,
      username: usernameErr,
      email: emailErr,
      password: passwordErr,
    });
    const hasErrors = !!(nameErr || usernameErr || emailErr || passwordErr);
    if (hasErrors) shake();
    return !hasErrors;
  };

  const handleRegister = async () => {
    setServerError("");
    if (!validateAll()) return;

    setLoading(true);
    try {
      const res = await fetch(ENDPOINTS.register, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name.trim(),
          username: form.username.trim().toLowerCase(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
        }),
      });
      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
      } else {
        const msg: string = data?.message ?? "";
        if (msg.toLowerCase().includes("email")) {
          setErrors((e) => ({ ...e, email: "This email address is already registered." }));
        } else if (msg.toLowerCase().includes("username")) {
          setErrors((e) => ({ ...e, username: "This username is already taken." }));
        } else {
          setServerError(msg || t("signUp.failed"));
        }
        shake();
      }
    } catch {
      setServerError(t("signUp.networkError"));
      shake();
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: isDark ? "#09090b" : "#fafafa",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 24,
        }}
      >
        <LinearGradient
          colors={["rgba(124,58,237,0.4)", "rgba(124,58,237,0)"]}
          style={{ position: "absolute", left: 0, right: 0, top: 0, height: 400 }}
          start={{ x: 0.3, y: 0.1 }}
          end={{ x: 0.7, y: 0.9 }}
        />
        <View
          style={{
            width: 80,
            height: 80,
            borderRadius: 40,
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 24,
            borderWidth: 2,
            backgroundColor: isDark
              ? "rgba(74,222,128,0.15)"
              : "rgba(22,163,74,0.1)",
            borderColor: isDark
              ? "rgba(74,222,128,0.3)"
              : "rgba(22,163,74,0.25)",
          }}
        >
          <Text style={{ fontSize: 36 }}>✓</Text>
        </View>
        <Text
          style={{
            fontSize: 24,
            fontWeight: "800",
            color: isDark ? "#fafafa" : "#09090b",
            marginBottom: 8,
            textAlign: "center",
          }}
        >
          {t("signUp.successTitle")}
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: isDark ? "#a1a1aa" : "#52525b",
            textAlign: "center",
            lineHeight: 22,
            marginBottom: 32,
          }}
        >
          {t("signUp.successMessage")}
        </Text>
        <Pressable
          onPress={() => router.replace("/sign-in")}
          style={{
            backgroundColor: "rgba(124,58,237,0.8)",
            borderRadius: 18,
            paddingVertical: 16,
            paddingHorizontal: 40,
          }}
        >
          <Text
            style={{ color: "#fff", fontSize: 16, fontWeight: "700" }}
          >
            {t("signUp.goToSignIn")}
          </Text>
        </Pressable>
      </View>
    );
  }

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
          paddingBottom: 60,
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Back */}
        <Pressable onPress={() => router.back()} style={{ marginBottom: 28 }}>
          <Text style={{ fontSize: 14, color: isDark ? "#71717a" : "#646464" }}>
            {t("signIn.back")}
          </Text>
        </Pressable>

        {/* Header */}
        <View style={{ alignItems: "center", marginBottom: 32, gap: 8 }}>
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
            {t("signUp.title")}
          </Text>
          <Text style={{ fontSize: 14, color: isDark ? "#a1a1aa" : "#52525b" }}>
            {t("signUp.subtitle")}
          </Text>
        </View>

        {/* Form */}
        <Animated.View
          style={{ gap: 14, transform: [{ translateX: shakeAnim }] }}
        >
          {/* Full name */}
          <FormField
            label={t("signUp.name")}
            value={form.name}
            onChangeText={set("name")}
            placeholder={t("signUp.namePlaceholder")}
            isDark={isDark}
            error={errors.name}
            autoCapitalize="words"
            onSubmitEditing={() => usernameRef.current?.focus()}
            returnKeyType="next"
          />

          {/* Username */}
          <FormField
            label={t("signUp.username")}
            value={form.username}
            onChangeText={set("username")}
            placeholder={t("signUp.usernamePlaceholder")}
            isDark={isDark}
            error={errors.username}
            inputRef={usernameRef}
            onSubmitEditing={() => emailRef.current?.focus()}
            returnKeyType="next"
          />

          {/* Email */}
          <FormField
            label={t("signUp.email")}
            value={form.email}
            onChangeText={set("email")}
            placeholder={t("signUp.emailPlaceholder")}
            keyboardType="email-address"
            isDark={isDark}
            error={errors.email}
            inputRef={emailRef}
            onSubmitEditing={() => { passwordRef.current?.focus(); setShowStrength(true); }}
            returnKeyType="next"
          />

          {/* Password */}
          <FormField
            label={t("signUp.password")}
            value={form.password}
            onChangeText={(v) => {
              set("password")(v);
              if (!showStrength) setShowStrength(true);
            }}
            placeholder="••••••••••"
            secureTextEntry={!pwVisible}
            isDark={isDark}
            error={errors.password}
            inputRef={passwordRef}
            onSubmitEditing={handleRegister}
            returnKeyType="done"
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

          {/* Password strength indicator */}
          {showStrength && form.password.length > 0 && (
            <PasswordStrengthIndicator
              password={form.password}
              isDark={isDark}
            />
          )}

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
            onPress={handleRegister}
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
                {t("signUp.submit")}
              </Text>
            )}
          </Pressable>

          {/* Login link */}
          <Pressable
            onPress={() => router.push("/sign-in")}
            style={{ alignItems: "center", marginTop: 4 }}
          >
            <Text
              style={{ fontSize: 14, color: isDark ? "#71717a" : "#a1a1aa" }}
            >
              {t("signUp.hasAccount")}{" "}
              <Text style={{ color: "#8b5cf6", fontWeight: "700" }}>
                {t("signUp.signIn")}
              </Text>
            </Text>
          </Pressable>
        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
