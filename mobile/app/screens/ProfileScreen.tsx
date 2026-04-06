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
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../i18n/LanguageContext";
import { Language } from "../i18n";
import { api_endpoints } from "../config/api";
import { useTheme } from "../theme/ThemeContext";

interface UserProfile { name: string; username: string; email: string; }
interface BillingAddress {
  zipCode: string; name: string; streetAddress: string;
  apartmentNumber: string; city: string; state: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { locale, setLocale } = useLanguage();
  const { isDark, toggleTheme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start();
  }, []);

  const [profile, setProfile] = useState<UserProfile>({ name: "", username: "", email: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [billing, setBilling] = useState<BillingAddress>({
    zipCode: "", name: "", streetAddress: "", apartmentNumber: "", city: "", state: "",
  });
  const [billingLoading, setBillingLoading] = useState(false);
  const [animationsOn, setAnimationsOn] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(api_endpoints.user, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setProfile({ name: data.name ?? "", username: data.username ?? "", email: data.email ?? "" });
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
      const res = await fetch(api_endpoints.user, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (res.ok) Alert.alert("✓", "Profil mentve");
      else Alert.alert("Hiba", "Nem sikerült menteni.");
    } catch { Alert.alert("Hiba", "Hálózati hiba."); }
    finally { setProfileLoading(false); }
  };

  const savePassword = async () => {
    if (!passwords.current || !passwords.next) return;
    setPwLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(api_endpoints.password, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }),
      });
      if (res.ok) { Alert.alert("✓", "Jelszó frissítve"); setPasswords({ current: "", next: "" }); }
      else Alert.alert("Hiba", "Nem sikerült frissíteni.");
    } catch {} finally { setPwLoading(false); }
  };

  const saveBilling = async () => {
    setBillingLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await fetch(api_endpoints.billingaddress, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          zIP_code: parseInt(billing.zipCode) || 0,
          name: billing.name,
          streetAddress: billing.streetAddress,
          apartmentNumber: parseInt(billing.apartmentNumber) || 0,
          city: billing.city,
          state: billing.state,
        }),
      });
      Alert.alert("✓", "Számlázási cím mentve");
    } catch {} finally { setBillingLoading(false); }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    navigation.navigate("Welcome" as never);
  };

  const bg = isDark ? "bg-[#09090b]" : "bg-[#fafafa]";
  const surface = isDark ? "bg-[#18181b]" : "bg-white";
  const surfaceHigh = isDark ? "bg-[#27272a]" : "bg-[#f4f4f5]";
  const border = isDark ? "border-[#3f3f46]" : "border-[#e4e4e7]";
  const textPrimary = isDark ? "text-[#fafafa]" : "text-[#09090b]";
  const textSub = isDark ? "text-[#a1a1aa]" : "text-[#52525b]";
  const textMuted = isDark ? "text-[#71717a]" : "text-[#a1a1aa]";

  const inputClass = `${surfaceHigh} border ${border} rounded-xl px-3.5 py-3 text-sm mb-1 ${textPrimary}`;

  const PrimaryButton = ({ label, onPress, loading: l, danger }: any) => (
    <TouchableOpacity
      onPress={onPress}
      disabled={l}
      activeOpacity={0.75}
      className={`rounded-xl py-3.5 items-center mt-3.5 border ${
        danger
          ? "bg-[rgba(248,113,113,0.1)] border-[rgba(248,113,113,0.35)]"
          : isDark
          ? "bg-[rgba(124,58,237,0.15)] border-[rgba(124,58,237,0.35)]"
          : "bg-[rgba(124,58,237,0.08)] border-[rgba(124,58,237,0.25)]"
      }`}
    >
      {l ? (
        <ActivityIndicator size="small" color={danger ? (isDark ? "#f87171" : "#dc2626") : "#7c3aed"} />
      ) : (
        <Text
          className={`text-sm font-bold tracking-wide ${
            danger ? (isDark ? "text-[#f87171]" : "text-[#dc2626]") : "text-[#7c3aed]"
          }`}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );

  const Card = ({ children }: { children: React.ReactNode }) => (
    <View className={`${surface} rounded-2xl border ${border} p-5 mb-4`}>{children}</View>
  );

  const SectionTitle = ({ title }: { title: string }) => (
    <Text className="text-[11px] font-extrabold text-[#7c3aed] tracking-[2px] uppercase mb-4">
      {title}
    </Text>
  );

  const FieldLabel = ({ label }: { label: string }) => (
    <Text className={`text-[11px] font-semibold tracking-[0.8px] uppercase mb-1.5 mt-2.5 ${textSub}`}>
      {label}
    </Text>
  );

  return (
    <View className={`flex-1 ${bg}`}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" />
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.View className="flex-1" style={{ opacity: fadeAnim }}>
          <ScrollView
            contentContainerStyle={{ padding: 20, paddingTop: 60 }}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar header */}
            <View className="items-center mb-7">
              <View
                className="w-[88px] h-[88px] rounded-full border-[2.5px] border-[#7c3aed] p-[3px] mb-3.5"
              >
                <View className="flex-1 rounded-full bg-[rgba(124,58,237,0.15)] items-center justify-center">
                  <Text className="text-[30px] font-extrabold text-[#7c3aed]">
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              </View>
              <Text className={`text-xl font-bold tracking-wide mb-1 ${textPrimary}`}>
                {profile.name || profile.username}
              </Text>
              <Text className={`text-xs ${textSub}`}>{profile.email}</Text>
            </View>

            {/* Appearance */}
            <Card>
              <SectionTitle title="Megjelenés" />
              <View className={`flex-row justify-between items-center ${surfaceHigh} border ${border} rounded-xl px-3.5 py-3 mb-2.5`}>
                <Text className={`text-sm font-medium ${textPrimary}`}>Sötét mód</Text>
                <Switch
                  value={isDark}
                  onValueChange={toggleTheme}
                  trackColor={{ false: isDark ? "#3f3f46" : "#e4e4e7", true: "#7c3aed88" }}
                  thumbColor={isDark ? "#7c3aed" : (isDark ? "#71717a" : "#a1a1aa")}
                />
              </View>
              <View className={`flex-row justify-between items-center ${surfaceHigh} border ${border} rounded-xl px-3.5 py-3 mb-2.5`}>
                <Text className={`text-sm font-medium ${textPrimary}`}>Animációk</Text>
                <Switch
                  value={animationsOn}
                  onValueChange={setAnimationsOn}
                  trackColor={{ false: isDark ? "#3f3f46" : "#e4e4e7", true: "#7c3aed88" }}
                  thumbColor={animationsOn ? "#7c3aed" : (isDark ? "#71717a" : "#a1a1aa")}
                />
              </View>
              <View className={`flex-row justify-between items-center ${surfaceHigh} border ${border} rounded-xl px-3.5 py-2.5`}>
                <Text className={`text-sm font-medium ${textPrimary}`}>Nyelv</Text>
                <View className="flex-row gap-2">
                  {(["en", "hu"] as Language[]).map((lang) => (
                    <TouchableOpacity
                      key={lang}
                      onPress={() => setLocale(lang)}
                      activeOpacity={0.8}
                      className={`px-4 py-2 rounded-[20px] border ${
                        locale === lang
                          ? "bg-[#7c3aed] border-[#7c3aed]"
                          : `${surfaceHigh} ${border}`
                      }`}
                    >
                      <Text className={`text-xs font-bold ${locale === lang ? "text-white" : textSub}`}>
                        {lang === "en" ? "EN" : "HU"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </Card>

            {/* Personal Info */}
            <Card>
              <SectionTitle title="Személyes Adatok" />
              {[["Teljes Név", "name"], ["Felhasználónév", "username"], ["E-mail", "email"]].map(
                ([label, key]) => (
                  <React.Fragment key={key}>
                    <FieldLabel label={label} />
                    <TextInput
                      value={(profile as any)[key]}
                      onChangeText={(v) => setProfile((p) => ({ ...p, [key]: v }))}
                      className={inputClass}
                      placeholder={label}
                      placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                      keyboardType={key === "email" ? "email-address" : "default"}
                    />
                  </React.Fragment>
                )
              )}
              <PrimaryButton label="Módosítások Mentése" onPress={saveProfile} loading={profileLoading} />
            </Card>

            {/* Password */}
            <Card>
              <SectionTitle title="Jelszó Módosítása" />
              <FieldLabel label="Jelenlegi Jelszó" />
              <TextInput
                value={passwords.current}
                onChangeText={(v) => setPasswords((p) => ({ ...p, current: v }))}
                className={inputClass}
                placeholder="••••••••"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                secureTextEntry
              />
              <FieldLabel label="Új Jelszó" />
              <TextInput
                value={passwords.next}
                onChangeText={(v) => setPasswords((p) => ({ ...p, next: v }))}
                className={inputClass}
                placeholder="••••••••"
                placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                secureTextEntry
              />
              <PrimaryButton label="Jelszó Frissítése" onPress={savePassword} loading={pwLoading} />
            </Card>

            {/* Billing */}
            <Card>
              <SectionTitle title="Számlázási Cím" />
              {(
                [
                  ["Irányítószám", "zipCode", "numeric"],
                  ["Név", "name", "default"],
                  ["Város", "city", "default"],
                  ["Utca, Házszám", "streetAddress", "default"],
                  ["Emelet, Ajtó", "apartmentNumber", "default"],
                  ["Megye", "state", "default"],
                ] as [string, keyof BillingAddress, any][]
              ).map(([label, field, kb]) => (
                <React.Fragment key={field}>
                  <FieldLabel label={label} />
                  <TextInput
                    value={billing[field]}
                    onChangeText={(v) => setBilling((b) => ({ ...b, [field]: v }))}
                    className={inputClass}
                    placeholder={label}
                    placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
                    keyboardType={kb}
                  />
                </React.Fragment>
              ))}
              <PrimaryButton label="Számlázási Cím Mentése" onPress={saveBilling} loading={billingLoading} />
            </Card>

            <PrimaryButton label="Kijelentkezés" onPress={handleLogout} danger />
            <View className="h-10" />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
