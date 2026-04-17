import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  ActivityIndicator,
  Animated,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { IP_STORAGE_KEY, refreshCachedApiBase } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";

// ─── This component only exists in development ────────────────────────────────
// It is never rendered in production builds because of the __DEV__ guard in
// the parent. If you are reading this in a production bundle, something is wrong.

interface DevIpSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export function DevIpSettings({ visible, onClose }: DevIpSettingsProps) {
  const { isDark } = useTheme();
  const { t } = useLanguage();

  const [ip, setIp] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem(IP_STORAGE_KEY).then((v) => {
        setIp(v ?? "");
        setSaved(false);
      });
      Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      // Auto-focus after modal animation
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }).start();
    }
  }, [visible]);

  const handleSave = async () => {
    Keyboard.dismiss();
    setSaving(true);
    try {
      const trimmed = ip.trim();
      if (trimmed) {
        await AsyncStorage.setItem(IP_STORAGE_KEY, trimmed);
      } else {
        await AsyncStorage.removeItem(IP_STORAGE_KEY);
      }
      await refreshCachedApiBase();
      setSaved(true);
      setTimeout(() => {
        onClose();
      }, 800);
    } finally {
      setSaving(false);
    }
  };

  const cardBg = isDark ? "#18181b" : "#fff";
  const borderColor = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const textColor = isDark ? "#fafafa" : "#09090b";
  const subtextColor = isDark ? "#71717a" : "#a1a1aa";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)";

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => { Keyboard.dismiss(); onClose(); }}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback onPress={() => { Keyboard.dismiss(); onClose(); }}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" }}>
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  backgroundColor: cardBg,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 24,
                  paddingBottom: Platform.OS === "ios" ? 36 : 24,
                  borderTopWidth: 1,
                  borderColor: borderColor,
                }}
              >
                {/* Dev badge */}
                <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 8 }}>
                  <View style={{
                    backgroundColor: "rgba(251,191,36,0.15)",
                    borderRadius: 6,
                    paddingHorizontal: 8,
                    paddingVertical: 3,
                    borderWidth: 1,
                    borderColor: "rgba(251,191,36,0.3)",
                  }}>
                    <Text style={{ color: "#fbbf24", fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
                      {t("devSettings.devBadge")}
                    </Text>
                  </View>
                  <Text style={{ color: subtextColor, fontSize: 11 }}>
                    {t("devSettings.devNote")}
                  </Text>
                </View>

                <Text style={{ color: textColor, fontSize: 18, fontWeight: "700", marginBottom: 4 }}>
                  {t("devSettings.title")}
                </Text>
                <Text style={{ color: subtextColor, fontSize: 13, marginBottom: 20, lineHeight: 18 }}>
                  {t("devSettings.subtitle")}
                </Text>

                {/* IP Input */}
                <Text style={{ color: subtextColor, fontSize: 11, fontWeight: "600", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
                  {t("devSettings.ipLabel")}
                </Text>
                <TextInput
                  ref={inputRef}
                  value={ip}
                  onChangeText={setIp}
                  placeholder="192.168.0.100"
                  placeholderTextColor={subtextColor}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={{
                    backgroundColor: inputBg,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: borderColor,
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    fontSize: 16,
                    color: textColor,
                    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                    marginBottom: 8,
                  }}
                />
                <Text style={{ color: subtextColor, fontSize: 11, marginBottom: 24 }}>
                  {t("devSettings.portNote")}
                </Text>

                {/* Buttons */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => { Keyboard.dismiss(); onClose(); }}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: borderColor,
                      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={{ color: subtextColor, fontSize: 15, fontWeight: "600" }}>
                      {t("common.cancel")}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSave}
                    disabled={saving}
                    style={{
                      flex: 2,
                      paddingVertical: 14,
                      borderRadius: 14,
                      alignItems: "center",
                      backgroundColor: saved ? "rgba(74,222,128,0.85)" : "rgba(124,58,237,0.85)",
                      opacity: saving ? 0.7 : 1,
                    }}
                    activeOpacity={0.8}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
                        {saved ? `✓ ${t("devSettings.saved")}` : t("devSettings.apply")}
                      </Text>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </TouchableWithoutFeedback>
          </KeyboardAvoidingView>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}
