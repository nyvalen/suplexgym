import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Switch,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ENDPOINTS } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import {
  User,
  Lock,
  MapPin,
  LogOut,
  ChevronRight,
  ChevronDown,
  Eye,
  EyeOff,
  Sun,
  Moon,
  Monitor,
} from "lucide-react-native";

type ThemePreference = "system" | "light" | "dark";

interface UserProfile {
  name: string;
  username: string;
  email: string;
  createdAt?: string;
}
interface BillingAddress {
  zipCode: string;
  name: string;
  streetAddress: string;
  apartmentNumber: string;
  city: string;
  state: string;
}

// ─── Accordion Section ────────────────────────────────────────────────────────
function Section({
  title,
  icon,
  children,
  isDark,
  defaultOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  isDark: boolean;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const heightAnim = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  const toggle = () => {
    const toValue = open ? 0 : 1;
    setOpen(!open);
    Animated.spring(heightAnim, {
      toValue,
      useNativeDriver: false,
      tension: 80,
      friction: 12,
    }).start();
  };

  return (
    <View
      className="mb-3 rounded-[20px] overflow-hidden border"
      style={{
        backgroundColor: isDark
          ? "rgba(255,255,255,0.04)"
          : "rgba(255,255,255,0.95)",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      }}
    >
      <TouchableOpacity
        onPress={toggle}
        activeOpacity={0.8}
        className="flex-row items-center px-5 py-4 gap-3"
      >
        <View
          className="w-9 h-9 rounded-[11px] items-center justify-center"
          style={{ backgroundColor: "rgba(124,58,237,0.12)" }}
        >
          {icon}
        </View>
        <Text
          className="flex-1 text-[15px] font-semibold"
          style={{ color: isDark ? "#fafafa" : "#09090b" }}
        >
          {title}
        </Text>
        <Animated.View
          style={{
            transform: [
              {
                rotate: heightAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ["0deg", "180deg"],
                }),
              },
            ],
          }}
        >
          <ChevronDown size={16} color={isDark ? "#71717a" : "#a1a1aa"} />
        </Animated.View>
      </TouchableOpacity>

      {open && (
        <View
          className="px-5 pb-5"
          style={{
            borderTopWidth: 1,
            borderTopColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(0,0,0,0.05)",
          }}
        >
          {children}
        </View>
      )}
    </View>
  );
}

// ─── Field ────────────────────────────────────────────────────────────────────
function Field({
  label,
  value,
  onChangeText,
  isDark,
  keyboardType,
  secureTextEntry,
  placeholder,
  autoCapitalize,
  rightElement,
}: {
  label: string;
  value: string;
  onChangeText?: (v: string) => void;
  isDark: boolean;
  keyboardType?: any;
  secureTextEntry?: boolean;
  placeholder?: string;
  autoCapitalize?: any;
  rightElement?: React.ReactNode;
}) {
  return (
    <View className="mt-4">
      <Text
        className="text-[10px] font-bold tracking-[1.5px] uppercase mb-1.5"
        style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
      >
        {label}
      </Text>
      <View className="flex-row items-center">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          placeholder={placeholder || label}
          placeholderTextColor={isDark ? "#52525b" : "#d4d4d8"}
          autoCapitalize={autoCapitalize || "none"}
          className="flex-1 rounded-[14px] px-4 py-3 text-[14px] border"
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.03)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
            color: isDark ? "#fafafa" : "#09090b",
            paddingRight: rightElement ? 48 : 16,
          }}
        />
        {rightElement && (
          <View className="absolute right-3">{rightElement}</View>
        )}
      </View>
    </View>
  );
}

// ─── Save Button ──────────────────────────────────────────────────────────────
function SaveButton({
  label,
  onPress,
  loading,
  danger,
}: {
  label: string;
  onPress: () => void;
  loading?: boolean;
  danger?: boolean;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.75}
      className="rounded-[16px] py-3.5 items-center mt-5 border"
      style={{
        backgroundColor: danger
          ? "rgba(220,38,38,0.06)"
          : "rgba(124,58,237,0.1)",
        borderColor: danger ? "rgba(220,38,38,0.2)" : "rgba(124,58,237,0.25)",
        opacity: loading ? 0.6 : 1,
      }}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={danger ? "#dc2626" : "#7c3aed"}
        />
      ) : (
        <Text
          className="text-[14px] font-bold"
          style={{ color: danger ? "#dc2626" : "#7c3aed" }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

// ─── Theme Selector ───────────────────────────────────────────────────────────
function ThemeSelector({
  isDark,
  themePreference,
  setThemePreference,
  t,
}: {
  isDark: boolean;
  themePreference: ThemePreference;
  setThemePreference: (p: ThemePreference) => void;
  t: (key: string) => string;
}) {
  const options: {
    value: ThemePreference;
    icon: React.ReactNode;
    label: string;
  }[] = [
    {
      value: "light",
      icon: (
        <Sun
          size={14}
          color={
            themePreference === "light"
              ? "#fff"
              : isDark
                ? "#a1a1aa"
                : "#52525b"
          }
        />
      ),
      label: "Light",
    },
    {
      value: "system",
      icon: (
        <Monitor
          size={14}
          color={
            themePreference === "system"
              ? "#fff"
              : isDark
                ? "#a1a1aa"
                : "#52525b"
          }
        />
      ),
      label: "System",
    },
    {
      value: "dark",
      icon: (
        <Moon
          size={14}
          color={
            themePreference === "dark" ? "#fff" : isDark ? "#a1a1aa" : "#52525b"
          }
        />
      ),
      label: "Dark",
    },
  ];

  return (
    <View className="mt-4">
      <Text
        className="text-[10px] font-bold tracking-[1.5px] uppercase mb-2"
        style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
      >
        Theme
      </Text>
      <View
        className="flex-row rounded-[14px] p-1 gap-1"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.04)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }}
      >
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setThemePreference(opt.value)}
            activeOpacity={0.8}
            className="flex-1 flex-row items-center justify-center gap-1.5 py-2.5 rounded-[10px]"
            style={{
              backgroundColor:
                themePreference === opt.value ? "#7c3aed" : "transparent",
            }}
          >
            {opt.icon}
            <Text
              className="text-[12px] font-semibold"
              style={{
                color:
                  themePreference === opt.value
                    ? "#fff"
                    : isDark
                      ? "#a1a1aa"
                      : "#52525b",
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Language Selector ────────────────────────────────────────────────────────
function LanguageSelector({
  isDark,
  locale,
  setLocale,
  t,
}: {
  isDark: boolean;
  locale: string;
  setLocale: (lang: string) => void;
  t: (key: string) => string;
}) {
  const options: { value: string; label: string }[] = [
    { value: "en", label: "English" },
    { value: "hu", label: "Magyar" },
  ];

  return (
    <View className="mt-4">
      <Text
        className="text-[10px] font-bold tracking-[1.5px] uppercase mb-2"
        style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
      >
        Language
      </Text>
      <View
        className="flex-row rounded-[14px] p-1 gap-1"
        style={{
          backgroundColor: isDark
            ? "rgba(255,255,255,0.05)"
            : "rgba(0,0,0,0.04)",
          borderWidth: 1,
          borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
        }}
      >
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.value}
            onPress={() => setLocale(opt.value)}
            activeOpacity={0.8}
            className="flex-1 items-center justify-center py-2.5 rounded-[10px]"
            style={{
              backgroundColor: locale === opt.value ? "#7c3aed" : "transparent",
            }}
          >
            <Text
              className="text-[12px] font-semibold"
              style={{
                color:
                  locale === opt.value
                    ? "#fff"
                    : isDark
                      ? "#a1a1aa"
                      : "#52525b",
              }}
            >
              {opt.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const { isDark, themePreference, setThemePreference } = useTheme();
  const { locale, setLocale, t } = useLanguage();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, []);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    username: "",
    email: "",
    createdAt: undefined,
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [pwLoading, setPwLoading] = useState(false);

  const [billing, setBilling] = useState<BillingAddress>({
    zipCode: "",
    name: "",
    streetAddress: "",
    apartmentNumber: "",
    city: "",
    state: "",
  });
  const [billingLoading, setBillingLoading] = useState(false);

  // Load profile
  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(ENDPOINTS.user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfile({
        name: data.name ?? "",
        username: data.username ?? "",
        email: data.email ?? "",
        createdAt: data.createdAt,
      });
      if (data.billingAddress) {
        setBilling({
          zipCode: String(data.billingAddress.zipCode ?? ""),
          name: data.billingAddress.name ?? "",
          streetAddress: data.billingAddress.streetAddress ?? "",
          apartmentNumber: String(data.billingAddress.apartmentNumber ?? ""),
          city: data.billingAddress.city ?? "",
          state: data.billingAddress.state ?? "",
        });
      }
    })();
  }, []);

  const saveProfile = async () => {
    setProfileLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(ENDPOINTS.user, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (res.ok) Alert.alert("✓", t("profile.profileSaved"));
      else Alert.alert(t("common.error"), t("profile.saveError"));
    } catch {
      Alert.alert(t("common.error"), t("profile.networkError"));
    } finally {
      setProfileLoading(false);
    }
  };

  const savePassword = async () => {
    if (!currentPw || !newPw) return;
    setPwLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(ENDPOINTS.password, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: currentPw,
          newPassword: newPw,
        }),
      });
      if (res.ok) {
        Alert.alert("✓", t("profile.passwordUpdated"));
        setCurrentPw("");
        setNewPw("");
      } else {
        const data = await res.json().catch(() => ({}));
        Alert.alert(
          t("common.error"),
          data?.message ?? t("profile.wrongPassword"),
        );
      }
    } catch {
      Alert.alert(t("common.error"), t("profile.networkError"));
    } finally {
      setPwLoading(false);
    }
  };

  const saveBilling = async () => {
    setBillingLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await fetch(ENDPOINTS.billing, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          zIP_code: parseInt(billing.zipCode) || 0,
          name: billing.name,
          streetAddress: billing.streetAddress,
          apartmentNumber: parseInt(billing.apartmentNumber) || 0,
          city: billing.city,
          state: billing.state,
        }),
      });
      Alert.alert("✓", t("profile.billingSaved"));
    } catch {
      Alert.alert(t("common.error"), t("profile.networkError"));
    } finally {
      setBillingLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(t("profile.logout"), "Are you sure?", [
      { text: t("common.cancel"), style: "cancel" },
      {
        text: t("profile.logout"),
        style: "destructive",
        onPress: async () => {
          await AsyncStorage.removeItem("accessToken");
          await AsyncStorage.removeItem("refreshToken");
          router.replace("/");
        },
      },
    ]);
  };

  const initials = profile.name?.charAt(0)?.toUpperCase() || "?";
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).getFullYear()
    : null;

  return (
    <View
      className="flex-1"
      style={{
        backgroundColor: isDark ? "#09090b" : "#fafafa",
        paddingBottom: Platform.OS === "android" ? 140 : 66,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Background gradient */}
      <LinearGradient
        colors={["rgba(124,58,237,0.35)", "rgba(124,58,237,0)"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 300 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.ScrollView
          style={{ opacity: fadeAnim }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 60,
            paddingBottom: 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* ── Hero header ── */}
          <View className="items-center mb-8 mt-2">
            {/* Avatar */}
            <View
              className="w-20 h-20 rounded-[28px] items-center justify-center mb-4"
              style={{
                backgroundColor: "rgba(124,58,237,0.15)",
                borderWidth: 2,
                borderColor: "rgba(124,58,237,0.3)",
              }}
            >
              <Text
                className="text-[32px] font-black"
                style={{ color: "#7c3aed" }}
              >
                {initials}
              </Text>
            </View>

            {/* Name */}
            <Text
              className="text-[22px] font-extrabold tracking-[-0.3px]"
              style={{ color: isDark ? "#fafafa" : "#09090b" }}
            >
              {profile.name || profile.username || "—"}
            </Text>

            {/* Email */}
            <Text
              className="text-[13px] mt-0.5"
              style={{ color: isDark ? "#71717a" : "#a1a1aa" }}
            >
              {profile.email}
            </Text>

            {/* Member since badge */}
            {memberSince && (
              <View
                className="mt-3 flex-row items-center gap-1.5 px-3 py-1.5 rounded-full border"
                style={{
                  backgroundColor: "rgba(124,58,237,0.08)",
                  borderColor: "rgba(124,58,237,0.2)",
                }}
              >
                <Text className="text-[11px] font-semibold text-[#8b5cf6]">
                  {t("profile.memberSince")} {memberSince}
                </Text>
              </View>
            )}
          </View>

          {/* ── Personal Info ── */}
          <Section
            title={t("profile.personalInfo")}
            icon={<User size={17} color="#7c3aed" />}
            isDark={isDark}
            defaultOpen
          >
            <Field
              label={t("profile.fullName")}
              value={profile.name}
              onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))}
              isDark={isDark}
              autoCapitalize="words"
            />
            <Field
              label={t("profile.username")}
              value={profile.username}
              onChangeText={(v) => setProfile((p) => ({ ...p, username: v }))}
              isDark={isDark}
            />
            <Field
              label={t("profile.email")}
              value={profile.email}
              onChangeText={(v) => setProfile((p) => ({ ...p, email: v }))}
              isDark={isDark}
              keyboardType="email-address"
            />
            <SaveButton
              label={t("profile.saveChanges")}
              onPress={saveProfile}
              loading={profileLoading}
            />
          </Section>

          {/* ── Security ── */}
          <Section
            title={t("profile.security")}
            icon={<Lock size={17} color="#7c3aed" />}
            isDark={isDark}
          >
            <Field
              label={t("profile.currentPassword")}
              value={currentPw}
              onChangeText={setCurrentPw}
              isDark={isDark}
              secureTextEntry={!pwVisible}
              placeholder="••••••••"
              rightElement={
                <TouchableOpacity
                  onPress={() => setPwVisible((v) => !v)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  {pwVisible ? (
                    <EyeOff size={16} color={isDark ? "#71717a" : "#a1a1aa"} />
                  ) : (
                    <Eye size={16} color={isDark ? "#71717a" : "#a1a1aa"} />
                  )}
                </TouchableOpacity>
              }
            />
            <Field
              label={t("profile.newPassword")}
              value={newPw}
              onChangeText={setNewPw}
              isDark={isDark}
              secureTextEntry={!pwVisible}
              placeholder="••••••••"
            />
            <SaveButton
              label={t("profile.updatePassword")}
              onPress={savePassword}
              loading={pwLoading}
            />
          </Section>

          {/* ── Billing Address ── */}
          <Section
            title={t("profile.billingAddress")}
            icon={<MapPin size={17} color="#7c3aed" />}
            isDark={isDark}
          >
            {(
              [
                [t("profile.zipCode"), "zipCode", "numeric"],
                [t("profile.name"), "name", "default"],
                [t("profile.city"), "city", "default"],
                [t("profile.street"), "streetAddress", "default"],
                [t("profile.apartment"), "apartmentNumber", "default"],
                [t("profile.state"), "state", "default"],
              ] as [string, keyof BillingAddress, any][]
            ).map(([label, field, kb]) => (
              <Field
                key={field}
                label={label}
                value={billing[field]}
                onChangeText={(v) => setBilling((b) => ({ ...b, [field]: v }))}
                isDark={isDark}
                keyboardType={kb}
              />
            ))}
            <SaveButton
              label={t("profile.saveBilling")}
              onPress={saveBilling}
              loading={billingLoading}
            />
          </Section>

          {/* ── Preferences ── */}
          <Section
            title={t("profile.preferences")}
            icon={<Monitor size={17} color="#7c3aed" />}
            isDark={isDark}
          >
            <ThemeSelector
              isDark={isDark}
              themePreference={themePreference as ThemePreference}
              setThemePreference={
                setThemePreference as (p: ThemePreference) => void
              }
              t={t}
            />
            <LanguageSelector
              isDark={isDark}
              locale={locale}
              setLocale={setLocale}
              t={t}
            />
          </Section>

          {/* ── Logout ── */}
          <TouchableOpacity
            onPress={handleLogout}
            activeOpacity={0.75}
            className="rounded-[18px] py-4 items-center flex-row justify-center gap-2 border mt-2"
            style={{
              backgroundColor: "rgba(220,38,38,0.05)",
              borderColor: "rgba(220,38,38,0.18)",
            }}
          >
            <LogOut size={16} color="#dc2626" />
            <Text className="text-[14px] font-bold text-[#dc2626]">
              {t("profile.logout")}
            </Text>
          </TouchableOpacity>

          <View className="h-4" />
        </Animated.ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
