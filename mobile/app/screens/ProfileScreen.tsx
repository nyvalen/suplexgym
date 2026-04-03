import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  Switch, Alert, Animated, StatusBar,
  KeyboardAvoidingView, Platform, ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../i18n/LanguageContext";
import { Language } from "../i18n";
import { api_endpoints } from "../config/api";
import { useTheme, tokens } from "../theme/ThemeContext";

interface UserProfile { name: string; username: string; email: string; }
interface BillingAddress { zipCode: string; name: string; streetAddress: string; apartmentNumber: string; city: string; state: string; }
interface AppSettings { darkMode: boolean; animation: boolean; language: Language; }

export default function ProfileScreen() {
  const navigation = useNavigation();
  const { t: translate, locale, setLocale } = useLanguage();
  const { isDark, toggleTheme } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  const fadeAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => { Animated.timing(fadeAnim, { toValue: 1, duration: 450, useNativeDriver: true }).start(); }, []);

  const [profile, setProfile] = useState<UserProfile>({ name: "", username: "", email: "" });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwords, setPasswords] = useState({ current: "", next: "" });
  const [pwLoading, setPwLoading] = useState(false);
  const [billing, setBilling] = useState<BillingAddress>({ zipCode: "", name: "", streetAddress: "", apartmentNumber: "", city: "", state: "" });
  const [billingLoading, setBillingLoading] = useState(false);
  const [animationsOn, setAnimationsOn] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(api_endpoints.user, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      setProfile({ name: data.name ?? "", username: data.username ?? "", email: data.email ?? "" });
      if (data.billingAddress) {
        setBilling({ zipCode: String(data.billingAddress.zipCode ?? ""), name: data.billingAddress.name ?? "", streetAddress: data.billingAddress.streetAddress ?? "", apartmentNumber: String(data.billingAddress.apartmentNumber ?? ""), city: data.billingAddress.city ?? "", state: data.billingAddress.state ?? "" });
      }
    })();
  }, []);

  const inputStyle = {
    backgroundColor: t.surfaceHigh, borderWidth: 1.5, borderColor: t.border,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12,
    color: t.text, fontSize: 15, marginBottom: 4,
  };

  const cardStyle = {
    backgroundColor: t.surface, borderRadius: 20, borderWidth: 1,
    borderColor: t.border, padding: 20, marginBottom: 16,
  };

  const saveProfile = async () => {
    setProfileLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      const res = await fetch(api_endpoints.user, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(profile) });
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
      const res = await fetch(api_endpoints.password, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.next }) });
      if (res.ok) { Alert.alert("✓", "Jelszó frissítve"); setPasswords({ current: "", next: "" }); }
      else Alert.alert("Hiba", "Nem sikerült frissíteni.");
    } catch {} finally { setPwLoading(false); }
  };

  const saveBilling = async () => {
    setBillingLoading(true);
    try {
      const token = await AsyncStorage.getItem("accessToken");
      await fetch(api_endpoints.billingaddress, { method: "PUT", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify({ zIP_code: parseInt(billing.zipCode) || 0, name: billing.name, streetAddress: billing.streetAddress, apartmentNumber: parseInt(billing.apartmentNumber) || 0, city: billing.city, state: billing.state }) });
      Alert.alert("✓", "Számlázási cím mentve");
    } catch {} finally { setBillingLoading(false); }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("accessToken");
    navigation.navigate("Welcome" as never);
  };

  const PrimaryButton = ({ label, onPress, loading: l, danger }: any) => (
    <TouchableOpacity onPress={onPress} disabled={l} activeOpacity={0.75} style={{
      borderRadius: 12, paddingVertical: 14, alignItems: "center", marginTop: 14,
      backgroundColor: danger ? t.danger + "18" : t.primarySoft,
      borderWidth: 1.5, borderColor: danger ? t.danger + "55" : t.primaryBorder,
    }}>
      {l ? <ActivityIndicator size="small" color={danger ? t.danger : t.primary} /> : (
        <Text style={{ fontSize: 14, fontWeight: "700", color: danger ? t.danger : t.primary, letterSpacing: 0.4 }}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={t.bg} />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
          <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 60 }} showsVerticalScrollIndicator={false}>

            {/* Avatar header */}
            <View style={{ alignItems: "center", marginBottom: 28 }}>
              <View style={{
                width: 88, height: 88, borderRadius: 44,
                borderWidth: 2.5, borderColor: t.primary,
                padding: 3, marginBottom: 14,
              }}>
                <View style={{
                  flex: 1, borderRadius: 40, backgroundColor: t.primarySoft,
                  alignItems: "center", justifyContent: "center",
                }}>
                  <Text style={{ fontSize: 30, fontWeight: "800", color: t.primary }}>
                    {profile.name?.charAt(0)?.toUpperCase() || "?"}
                  </Text>
                </View>
              </View>
              <Text style={{ fontSize: 22, fontWeight: "700", color: t.text, letterSpacing: 0.2, marginBottom: 4 }}>
                {profile.name || profile.username}
              </Text>
              <Text style={{ fontSize: 13, color: t.textSub }}>{profile.email}</Text>
            </View>

            {/* Appearance */}
            <View style={cardStyle}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: t.primary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                Megjelenés
              </Text>

              {/* Dark mode */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: t.surfaceHigh, borderRadius: 12, borderWidth: 1, borderColor: t.border, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10 }}>
                <Text style={{ fontSize: 15, color: t.text, fontWeight: "500" }}>Sötét mód</Text>
                <Switch value={isDark} onValueChange={toggleTheme} trackColor={{ false: t.border, true: t.primary + "88" }} thumbColor={isDark ? t.primary : t.textMuted} />
              </View>

              {/* Animations */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: t.surfaceHigh, borderRadius: 12, borderWidth: 1, borderColor: t.border, paddingHorizontal: 14, paddingVertical: 13, marginBottom: 10 }}>
                <Text style={{ fontSize: 15, color: t.text, fontWeight: "500" }}>Animációk</Text>
                <Switch value={animationsOn} onValueChange={setAnimationsOn} trackColor={{ false: t.border, true: t.primary + "88" }} thumbColor={animationsOn ? t.primary : t.textMuted} />
              </View>

              {/* Language */}
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: t.surfaceHigh, borderRadius: 12, borderWidth: 1, borderColor: t.border, paddingHorizontal: 14, paddingVertical: 10 }}>
                <Text style={{ fontSize: 15, color: t.text, fontWeight: "500" }}>Nyelv</Text>
                <View style={{ flexDirection: "row", gap: 8 }}>
                  {(["en", "hu"] as Language[]).map(lang => (
                    <TouchableOpacity key={lang} onPress={() => setLocale(lang)} activeOpacity={0.8} style={{
                      paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20,
                      backgroundColor: locale === lang ? t.primary : t.surfaceHigh,
                      borderWidth: 1.5, borderColor: locale === lang ? t.primary : t.border,
                    }}>
                      <Text style={{ color: locale === lang ? "#fff" : t.textSub, fontSize: 12, fontWeight: "700" }}>
                        {lang === "en" ? "EN" : "HU"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* Personal Info */}
            <View style={cardStyle}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: t.primary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                Személyes Adatok
              </Text>
              {[["Teljes Név", "name"], ["Felhasználónév", "username"], ["E-mail", "email"]].map(([label, key]) => (
                <React.Fragment key={key}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: t.textSub, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, marginTop: 10 }}>{label}</Text>
                  <TextInput
                    value={(profile as any)[key]} onChangeText={v => setProfile(p => ({ ...p, [key]: v }))}
                    style={inputStyle} placeholder={label} placeholderTextColor={t.textMuted}
                    keyboardType={key === "email" ? "email-address" : "default"}
                  />
                </React.Fragment>
              ))}
              <PrimaryButton label="Módosítások Mentése" onPress={saveProfile} loading={profileLoading} />
            </View>

            {/* Password */}
            <View style={cardStyle}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: t.primary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                Jelszó Módosítása
              </Text>
              <Text style={{ fontSize: 11, fontWeight: "600", color: t.textSub, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6 }}>Jelenlegi Jelszó</Text>
              <TextInput value={passwords.current} onChangeText={v => setPasswords(p => ({ ...p, current: v }))} style={inputStyle} placeholder="••••••••" placeholderTextColor={t.textMuted} secureTextEntry />
              <Text style={{ fontSize: 11, fontWeight: "600", color: t.textSub, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, marginTop: 10 }}>Új Jelszó</Text>
              <TextInput value={passwords.next} onChangeText={v => setPasswords(p => ({ ...p, next: v }))} style={inputStyle} placeholder="••••••••" placeholderTextColor={t.textMuted} secureTextEntry />
              <PrimaryButton label="Jelszó Frissítése" onPress={savePassword} loading={pwLoading} />
            </View>

            {/* Billing Address */}
            <View style={cardStyle}>
              <Text style={{ fontSize: 11, fontWeight: "800", color: t.primary, letterSpacing: 2, textTransform: "uppercase", marginBottom: 16 }}>
                Számlázási Cím
              </Text>
              {([["Irányítószám", "zipCode", "numeric"], ["Név", "name", "default"], ["Város", "city", "default"], ["Utca, Házszám", "streetAddress", "default"], ["Emelet, Ajtó", "apartmentNumber", "default"], ["Megye", "state", "default"]] as [string, keyof BillingAddress, any][]).map(([label, field, kb]) => (
                <React.Fragment key={field}>
                  <Text style={{ fontSize: 11, fontWeight: "600", color: t.textSub, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 6, marginTop: 10 }}>{label}</Text>
                  <TextInput value={billing[field]} onChangeText={v => setBilling(b => ({ ...b, [field]: v }))} style={inputStyle} placeholder={label} placeholderTextColor={t.textMuted} keyboardType={kb} />
                </React.Fragment>
              ))}
              <PrimaryButton label="Számlázási Cím Mentése" onPress={saveBilling} loading={billingLoading} />
            </View>

            {/* Logout */}
            <PrimaryButton label="Kijelentkezés" onPress={handleLogout} danger />

            <View style={{ height: 40 }} />
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </View>
  );
}
