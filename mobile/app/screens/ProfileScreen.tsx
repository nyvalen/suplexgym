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
  StyleSheet,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../i18n/LanguageContext";
import { Language } from "../i18n";
import { api_endpoints } from "../config/api";

// ─── Types ────────────────────────────────────────────────────────────────────
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

interface AppSettings {
  darkMode: boolean;
  animation: boolean;
  language: Language;
}

// ─── Theme ────────────────────────────────────────────────────────────────────
const getTheme = (dark: boolean) => ({
  bg: dark ? "#0e0e12" : "#f5f4f0",
  surface: dark ? "#18181f" : "#ffffff",
  surfaceAlt: dark ? "#1f1f2a" : "#f0efe9",
  border: dark ? "#2a2a3a" : "#e0ddd4",
  text: dark ? "#eeeae0" : "#1a1916",
  textSub: dark ? "#7a7890" : "#8a8775",
  accent: dark ? "#c8a96e" : "#b8944a",
  accentSoft: dark ? "#c8a96e22" : "#b8944a18",
  danger: dark ? "#e06060" : "#c84444",
  success: dark ? "#6ec87a" : "#3a9a48",
  switchTrack: dark ? "#2a2a3a" : "#d4d0c4",
  inputBg: dark ? "#1a1a24" : "#faf9f5",
});

// ─── Reusable Components ──────────────────────────────────────────────────────
const SectionHeader = ({
  label,
  theme,
}: {
  label: string;
  theme: ReturnType<typeof getTheme>;
}) => (
  <Text style={[styles.sectionHeader, { color: theme.accent }]}>{label}</Text>
);

const StyledInput = ({
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  theme,
  keyboardType,
}: {
  value: string;
  onChangeText: (v: string) => void;
  placeholder: string;
  secureTextEntry?: boolean;
  theme: ReturnType<typeof getTheme>;
  keyboardType?: "default" | "email-address" | "numeric";
}) => (
  <TextInput
    value={value}
    onChangeText={onChangeText}
    placeholder={placeholder}
    placeholderTextColor={theme.textSub}
    secureTextEntry={secureTextEntry}
    keyboardType={keyboardType}
    style={[
      styles.input,
      {
        backgroundColor: theme.inputBg,
        borderColor: theme.border,
        color: theme.text,
      },
    ]}
  />
);

const PrimaryButton = ({
  label,
  onPress,
  theme,
  loading,
  variant,
}: {
  label: string;
  onPress: () => void;
  theme: ReturnType<typeof getTheme>;
  loading?: boolean;
  variant?: "danger";
}) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={loading}
    activeOpacity={0.75}
    style={[
      styles.button,
      {
        backgroundColor:
          variant === "danger" ? theme.danger + "22" : theme.accentSoft,
        borderColor: variant === "danger" ? theme.danger : theme.accent,
      },
    ]}
  >
    {loading ? (
      <ActivityIndicator
        size="small"
        color={variant === "danger" ? theme.danger : theme.accent}
      />
    ) : (
      <Text
        style={[
          styles.buttonText,
          { color: variant === "danger" ? theme.danger : theme.accent },
        ]}
      >
        {label}
      </Text>
    )}
  </TouchableOpacity>
);

const RowSwitch = ({
  label,
  value,
  onValueChange,
  theme,
}: {
  label: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  theme: ReturnType<typeof getTheme>;
}) => (
  <View
    style={[
      styles.switchRow,
      { backgroundColor: theme.surface, borderColor: theme.border },
    ]}
  >
    <Text style={[styles.switchLabel, { color: theme.text }]}>{label}</Text>
    <Switch
      value={value}
      onValueChange={onValueChange}
      trackColor={{ false: theme.switchTrack, true: theme.accent + "66" }}
      thumbColor={value ? theme.accent : theme.textSub}
    />
  </View>
);

// ─── Language Pill Selector ───────────────────────────────────────────────────
const LanguageSelector = ({
  selected,
  onChange,
  theme,
  t,
}: {
  selected: Language;
  onChange: (l: Language) => void;
  theme: ReturnType<typeof getTheme>;
  t: (s: string) => string;
}) => (
  <View
    style={[
      styles.langRow,
      { backgroundColor: theme.surface, borderColor: theme.border },
    ]}
  >
    <Text style={[styles.switchLabel, { color: theme.text }]}>
      {t("profile.language")}
    </Text>
    <View style={styles.langPills}>
      {(["en", "hu"] as Language[]).map((lang) => (
        <TouchableOpacity
          key={lang}
          onPress={() => onChange(lang)}
          activeOpacity={0.8}
          style={[
            styles.pill,
            {
              backgroundColor:
                selected === lang ? theme.accent : theme.surfaceAlt,
              borderColor: selected === lang ? theme.accent : theme.border,
            },
          ]}
        >
          <Text
            style={[
              styles.pillText,
              { color: selected === lang ? "#fff" : theme.textSub },
            ]}
          >
            {lang === "en" ? "EN" : "HU"}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

// ─── Main Screen ──────────────────────────────────────────────────────────────
export default function ProfileScreen() {
  const navigation = useNavigation();
  const { t, locale, setLocale } = useLanguage();

  // Theme
  const [darkMode, setDarkMode] = useState(false);
  const theme = getTheme(darkMode);

  // Fade-in animation
  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 450,
      useNativeDriver: true,
    }).start();
  }, []);

  // Profile state
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    username: "",
    email: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);

  // Password state
  const [passwords, setPasswords] = useState({
    current: "",
    next: "",
  });
  const [pwLoading, setPwLoading] = useState(false);

  // Billing state
  const [billing, setBilling] = useState<BillingAddress>({
    zipCode: "",
    name: "",
    streetAddress: "",
    apartmentNumber: "",
    city: "",
    state: "",
  });
  const [billingLoading, setBillingLoading] = useState(false);

  // Animations toggle
  const [animationsOn, setAnimationsOn] = useState(true);

  // ─── Fetch profile on mount ──────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const res = await fetch(api_endpoints.user, {
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
        if (data.settings) {
          setDarkMode(data.settings.darkMode ?? false);
          setAnimationsOn(data.settings.animation ?? true);
          if (
            data.settings.language === "hu" ||
            data.settings.language === "en"
          ) {
            setLocale(data.settings.language);
          }
        }
      } catch {}
    })();
  }, []);

  // ─── Handlers ────────────────────────────────────────────────────────────
  const saveProfile = async () => {
    setProfileLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(api_endpoints.user, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      if (res.ok) Alert.alert("✓", t("profile.saveChanges"));
      else Alert.alert("Error", t("common.error"));
    } catch {
      Alert.alert("Error", t("common.error"));
    } finally {
      setProfileLoading(false);
    }
  };

  const savePassword = async () => {
    if (!passwords.current || !passwords.next) return;
    setPwLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(api_endpoints.password, {
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
        Alert.alert("✓", t("profile.updatePassword"));
        setPasswords({ current: "", next: "" });
      } else {
        Alert.alert("Error", t("common.error"));
      }
    } catch {
      Alert.alert("Error", t("common.error"));
    } finally {
      setPwLoading(false);
    }
  };

  const saveBilling = async () => {
    setBillingLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(`${api_endpoints.billingaddress}`, {
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
      if (res.ok) Alert.alert("✓", t("profile.saveBilling"));
      else Alert.alert("Error", t("common.error"));
    } catch {
      Alert.alert("Error", t("common.error"));
    } finally {
      setBillingLoading(false);
    }
  };

  const saveSettings = async (
    nextDark: boolean,
    nextAnim: boolean,
    nextLang: Language,
  ) => {
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await fetch(`${api_endpoints.user}/settings`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          darkMode: nextDark,
          animation: nextAnim,
          language: nextLang,
        }),
      });
    } catch {}
  };

  const handleDarkMode = (val: boolean) => {
    setDarkMode(val);
    saveSettings(val, animationsOn, locale);
  };

  const handleAnimations = (val: boolean) => {
    setAnimationsOn(val);
    saveSettings(darkMode, val, locale);
  };

  const handleLanguage = (lang: Language) => {
    setLocale(lang);
    saveSettings(darkMode, animationsOn, lang);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    navigation.navigate("Welcome" as never);
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: theme.bg }}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        backgroundColor={theme.bg}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView
            contentContainerStyle={[
              styles.container,
              { backgroundColor: theme.bg },
            ]}
            showsVerticalScrollIndicator={false}
          >
            {/* ── Header ── */}
            <View style={styles.header}>
              <View style={[styles.avatarRing, { borderColor: theme.accent }]}>
                <View
                  style={[
                    styles.avatarInner,
                    { backgroundColor: theme.accent },
                  ]}
                >
                  <Text style={styles.avatarInitial}>
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              </View>
              <Text style={[styles.headerName, { color: theme.text }]}>
                {profile.name || profile.username}
              </Text>
              <Text style={[styles.headerEmail, { color: theme.textSub }]}>
                {profile.email}
              </Text>
            </View>

            {/* ── Appearance ── */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <SectionHeader label={t("profile.appearance")} theme={theme} />

              <RowSwitch
                label={t("profile.darkMode")}
                value={darkMode}
                onValueChange={handleDarkMode}
                theme={theme}
              />
              <View style={{ height: 8 }} />
              <RowSwitch
                label={t("profile.animations")}
                value={animationsOn}
                onValueChange={handleAnimations}
                theme={theme}
              />
              <View style={{ height: 8 }} />
              <LanguageSelector
                selected={locale}
                onChange={handleLanguage}
                theme={theme}
                t={t}
              />
            </View>

            {/* ── Personal Info ── */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <SectionHeader label={t("profile.personalInfo")} theme={theme} />

              <Text style={[styles.fieldLabel, { color: theme.textSub }]}>
                {t("profile.name")}
              </Text>
              <StyledInput
                value={profile.name}
                onChangeText={(v) => setProfile((p) => ({ ...p, name: v }))}
                placeholder={t("profile.name")}
                theme={theme}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSub }]}>
                {t("profile.username")}
              </Text>
              <StyledInput
                value={profile.username}
                onChangeText={(v) => setProfile((p) => ({ ...p, username: v }))}
                placeholder={t("profile.username")}
                theme={theme}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSub }]}>
                {t("profile.email")}
              </Text>
              <StyledInput
                value={profile.email}
                onChangeText={(v) => setProfile((p) => ({ ...p, email: v }))}
                placeholder={t("profile.email")}
                keyboardType="email-address"
                theme={theme}
              />

              <PrimaryButton
                label={t("profile.saveChanges")}
                onPress={saveProfile}
                loading={profileLoading}
                theme={theme}
              />
            </View>

            {/* ── Change Password ── */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <SectionHeader
                label={t("profile.changePassword")}
                theme={theme}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSub }]}>
                {t("profile.currentPassword")}
              </Text>
              <StyledInput
                value={passwords.current}
                onChangeText={(v) =>
                  setPasswords((p) => ({ ...p, current: v }))
                }
                placeholder="••••••••"
                secureTextEntry
                theme={theme}
              />

              <Text style={[styles.fieldLabel, { color: theme.textSub }]}>
                {t("profile.newPassword")}
              </Text>
              <StyledInput
                value={passwords.next}
                onChangeText={(v) => setPasswords((p) => ({ ...p, next: v }))}
                placeholder="••••••••"
                secureTextEntry
                theme={theme}
              />

              <PrimaryButton
                label={t("profile.updatePassword")}
                onPress={savePassword}
                loading={pwLoading}
                theme={theme}
              />
            </View>

            {/* ── Billing Address ── */}
            <View
              style={[
                styles.card,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
            >
              <SectionHeader
                label={t("profile.billingAddress")}
                theme={theme}
              />

              {(
                [
                  ["profile.zipCode", "zipCode", "numeric"],
                  ["profile.name", "name", "default"],
                  ["profile.city", "city", "default"],
                  ["profile.street", "streetAddress", "default"],
                  ["profile.apartment", "apartmentNumber", "default"],
                  ["profile.state", "state", "default"],
                ] as [string, keyof BillingAddress, "default" | "numeric"][]
              ).map(([labelKey, field, kb]) => (
                <React.Fragment key={field}>
                  <Text style={[styles.fieldLabel, { color: theme.textSub }]}>
                    {t(labelKey)}
                  </Text>
                  <StyledInput
                    value={billing[field]}
                    onChangeText={(v) =>
                      setBilling((b) => ({ ...b, [field]: v }))
                    }
                    placeholder={t(labelKey)}
                    keyboardType={kb}
                    theme={theme}
                  />
                </React.Fragment>
              ))}

              <PrimaryButton
                label={t("profile.saveBilling")}
                onPress={saveBilling}
                loading={billingLoading}
                theme={theme}
              />
            </View>

            {/* ── Logout ── */}
            <PrimaryButton
              label={t("profile.logout")}
              onPress={handleLogout}
              theme={theme}
              variant="danger"
            />

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 56,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  avatarRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 2,
    padding: 3,
    marginBottom: 12,
  },
  avatarInner: {
    flex: 1,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarInitial: {
    fontSize: 28,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 1,
  },
  headerName: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: 0.3,
    marginBottom: 4,
  },
  headerEmail: {
    fontSize: 13,
    letterSpacing: 0.2,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 20,
    marginBottom: 16,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.8,
    textTransform: "uppercase",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 15,
    marginBottom: 2,
  },
  button: {
    borderRadius: 10,
    borderWidth: 1,
    paddingVertical: 13,
    alignItems: "center",
    marginTop: 16,
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.6,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
  },
  switchLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  langRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  langPills: {
    flexDirection: "row",
    gap: 8,
  },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
