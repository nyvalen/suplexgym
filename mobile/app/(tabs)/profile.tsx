import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Switch,
  Alert,
  Animated,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLanguage } from "../i18n/LanguageContext";
import { Language } from "../i18n";
import { ENDPOINTS } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

interface UserProfile {
  name: string;
  username: string;
  email: string;
}
interface BillingAddress {
  zipCode: string;
  name: string;
  streetAddress: string;
  apartmentNumber: string;
  city: string;
  state: string;
}

export default function ProfileScreen() {
  const { locale, setLocale, t } = useLanguage();
  const { isDark } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    username: "",
    email: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
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
  const [animationsOn, setAnimationsOn] = useState(true);

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
      if (data.settings?.language) {
        setLocale(data.settings.language as Language);
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
      if (res.ok) Alert.alert(t("profile.saved"), t("profile.profileSaved"));
      else Alert.alert(t("common.error"), t("profile.saveError"));
    } catch {
      Alert.alert(t("common.error"), t("profile.networkError"));
    } finally {
      setProfileLoading(false);
    }
  };

  const savePassword = async () => {
    if (!passwords.current || !passwords.next) return;
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
          currentPassword: passwords.current,
          newPassword: passwords.next,
        }),
      });
      if (res.ok) {
        Alert.alert(t("profile.saved"), t("profile.passwordUpdated"));
        setPasswords({ current: "", next: "" });
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
      Alert.alert(t("profile.saved"), t("profile.billingSaved"));
    } catch {
      Alert.alert(t("common.error"), t("profile.networkError"));
    } finally {
      setBillingLoading(false);
    }
  };

  const saveLanguageToServer = async (lang: Language) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await fetch(ENDPOINTS.settings, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          darkMode: isDark,
          animation: animationsOn,
          language: lang,
        }),
      });
    } catch {
      // silently ignore
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("refreshToken");
    router.replace("/");
  };

  const inputStyle = {
    backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
    borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
  };

  const ActionButton = ({ label, onPress, loading: l, danger }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={l}
      activeOpacity={0.75}
      className="rounded-2xl py-3.5 items-center mt-3.5 border"
      style={{
        backgroundColor: danger
          ? isDark
            ? "rgba(248,113,113,0.1)"
            : "rgba(220,38,38,0.06)"
          : isDark
            ? "rgba(124,58,237,0.15)"
            : "rgba(124,58,237,0.07)",
        borderColor: danger
          ? isDark
            ? "rgba(248,113,113,0.3)"
            : "rgba(220,38,38,0.2)"
          : isDark
            ? "rgba(124,58,237,0.35)"
            : "rgba(124,58,237,0.2)",
      }}
    >
      {l ? (
        <ActivityIndicator
          size="small"
          color={danger ? (isDark ? "#f87171" : "#dc2626") : "#7c3aed"}
        />
      ) : (
        <Text
          className="text-sm font-bold tracking-[0.3px]"
          style={{
            color: danger ? (isDark ? "#f87171" : "#dc2626") : "#7c3aed",
          }}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View
      className="rounded-[20px] border p-5 mb-4"
      style={{
        backgroundColor: isDark
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.9)",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </View>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-[11px] font-extrabold text-[#7c3aed] tracking-[2px] uppercase mb-4">
      {title}
    </Text>
  );

  const FieldLabel = ({ label }: { label: string }) => (
    <Text
      className={`text-[11px] font-semibold tracking-[1px] uppercase mb-1.5 mt-2.5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
    >
      {label}
    </Text>
  );

  return (
    <View
      className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}
      style={{
        paddingBottom: Platform.OS === "android" ? 140 : 66,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <View
        pointerEvents="none"
        className="absolute -top-10 -left-10 w-60 h-60 rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.12)"
            : "rgba(124,58,237,0.05)",
        }}
      />
      <LinearGradient
        colors={["rgba(124,58,237,0.4)", "rgba(124,58,237,0)"]}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          height: 1200,
        }}
        start={{ x: 0, y: 0.9 }}
        end={{ x: 0, y: 0 }}
      />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingTop: 64 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar header */}
            <View className="items-center mb-7">
              <View className="w-[88px] h-[88px] rounded-full border-[2.5px] border-[#7c3aed] p-[3px] mb-3.5">
                <View
                  className="flex-1 rounded-full items-center justify-center"
                  style={{ backgroundColor: "rgba(124,58,237,0.15)" }}
                >
                  <Text className="text-[30px] font-extrabold text-[#7c3aed]">
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              </View>
              <Text
                className={`text-xl font-bold tracking-[0.3px] mb-1 ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
              >
                {profile.name || profile.username}
              </Text>
              <Text
                className={`text-xs ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
              >
                {profile.email}
              </Text>
            </View>

            {/* Appearance */}
            <Card>
              <SectionTitle title={t("profile.appearance")} />

              {/* Language */}
              <View
                className="flex-row justify-between items-center rounded-xl px-3.5 py-2.5 border"
                style={inputStyle}
              >
                <Text
                  className={`text-sm font-medium ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                >
                  {t("profile.language")}
                </Text>
                <View className="flex-row gap-2">
                  {(["en", "hu"] as Language[]).map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => {
                        setLocale(lang);
                        saveLanguageToServer(lang);
                      }}
                      activeOpacity={0.8}
                      className="px-4 py-2 rounded-full border"
                      style={{
                        backgroundColor:
                          locale === lang ? "#7c3aed" : "transparent",
                        borderColor:
                          locale === lang
                            ? "#7c3aed"
                            : isDark
                              ? "rgba(255,255,255,0.1)"
                              : "rgba(0,0,0,0.08)",
                      }}
                    >
                      <Text
                        className="text-xs font-bold"
                        style={{
                          color:
                            locale === lang
                              ? "#fff"
                              : isDark
                                ? "#a1a1aa"
                                : "#52525b",
                        }}
                      >
                        {lang === "en" ? "EN" : "HU"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>

            {/* Personal Info */}
            <Card>
              <SectionTitle title={t("profile.personalInfo")} />
              {[
                [t("profile.fullName"), "name"],
                [t("profile.username"), "username"],
                [t("profile.email"), "email"],
              ].map(([label, key]) => (
                <React.Fragment key={key}>
                  <FieldLabel label={label} />
                  <TextInput
                    value={(profile as any)[key]}
                    onChangeText={(v) =>
                      setProfile((p) => ({ ...p, [key]: v }))
                    }
                    className={`rounded-xl px-3.5 py-3 text-sm mb-1 border ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                    style={inputStyle}
                    placeholder={label}
                    placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                    keyboardType={key === "email" ? "email-address" : "default"}
                  />
                </React.Fragment>
              ))}
              <ActionButton
                label={t("profile.saveChanges")}
                onPress={saveProfile}
                loading={profileLoading}
              />
            </Card>

            {/* Password */}
            <Card>
              <SectionTitle title={t("profile.changePassword")} />
              <FieldLabel label={t("profile.currentPassword")} />
              <TextInput
                value={passwords.current}
                onChangeText={(v) =>
                  setPasswords((p) => ({ ...p, current: v }))
                }
                className={`rounded-xl px-3.5 py-3 text-sm mb-1 border ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                style={inputStyle}
                placeholder="••••••••"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                secureTextEntry
              />
              <FieldLabel label={t("profile.newPassword")} />
              <TextInput
                value={passwords.next}
                onChangeText={(v) => setPasswords((p) => ({ ...p, next: v }))}
                className={`rounded-xl px-3.5 py-3 text-sm mb-1 border ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                style={inputStyle}
                placeholder="••••••••"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                secureTextEntry
              />
              <ActionButton
                label={t("profile.updatePassword")}
                onPress={savePassword}
                loading={pwLoading}
              />
            </Card>

            {/* Billing */}
            <Card>
              <SectionTitle title={t("profile.billingAddress")} />
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
                <React.Fragment key={field}>
                  <FieldLabel label={label} />
                  <TextInput
                    value={billing[field]}
                    onChangeText={(v) =>
                      setBilling((b) => ({ ...b, [field]: v }))
                    }
                    className={`rounded-xl px-3.5 py-3 text-sm mb-1 border ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
                    style={inputStyle}
                    placeholder={label}
                    placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                    keyboardType={kb}
                  />
                </React.Fragment>
              ))}
              <ActionButton
                label={t("profile.saveBilling")}
                onPress={saveBilling}
                loading={billingLoading}
              />
            </Card>

            <ActionButton
              label={t("profile.logout")}
              onPress={handleLogout}
              danger
            />
            <View className="h-5" />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
