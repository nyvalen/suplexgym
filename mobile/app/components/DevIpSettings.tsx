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

// ─── This component only exists in development ────────────────────────────────
// It is never rendered in production builds because of the __DEV__ guard below.
// If you are reading this in a production bundle, something is wrong.

interface DevIpSettingsProps {
  visible: boolean;
  onClose: () => void;
}

export function DevIpSettings({ visible, onClose }: DevIpSettingsProps) {
  // Dev-only check using React Native's __DEV__ global
  if (!__DEV__) {
    return null;
  }

  const { isDark } = useTheme();

  const [ip, setIp] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const inputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      AsyncStorage.getItem(IP_STORAGE_KEY).then((v) => {
        setIp(v ?? "");
        setSaved(false);
        setError("");
      });
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
      // Auto-focus after modal animation
      setTimeout(() => inputRef.current?.focus(), 300);
    } else {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleSave = async () => {
    Keyboard.dismiss();

    // Validate IP format
    const trimmed = ip.trim();
    const ipv4 = /^(\d{1,3}\.){3}\d{1,3}$/;
    if (trimmed && !ipv4.test(trimmed)) {
      setError("Enter a valid IPv4 address (e.g. 192.168.1.100)");
      return;
    }

    setSaving(true);
    try {
      if (trimmed) {
        await AsyncStorage.setItem(IP_STORAGE_KEY, trimmed);
      } else {
        await AsyncStorage.removeItem(IP_STORAGE_KEY);
      }
      await refreshCachedApiBase();
      setSaved(true);
      setError("");
      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setError("Failed to save IP address");
    } finally {
      setSaving(false);
    }
  };

  // Theme colors
  const colors = isDark
    ? {
        cardBg: "#18181b",
        borderColor: "rgba(255,255,255,0.1)",
        textColor: "#fafafa",
        subtextColor: "#71717a",
        inputBg: "rgba(255,255,255,0.06)",
        devBadgeBg: "rgba(251,191,36,0.15)",
        devBadgeText: "#fbbf24",
        devBadgeBorder: "rgba(251,191,36,0.3)",
        errorColor: "#ff6b6b",
        successColor: "#4ade80",
        successBg: "rgba(74,222,128,0.85)",
        primaryBg: "rgba(124,58,237,0.85)",
      }
    : {
        cardBg: "#ffffff",
        borderColor: "rgba(0,0,0,0.08)",
        textColor: "#09090b",
        subtextColor: "#6b7280",
        inputBg: "rgba(0,0,0,0.03)",
        devBadgeBg: "rgba(251,191,36,0.1)",
        devBadgeText: "#ca8a04",
        devBadgeBorder: "rgba(251,191,36,0.2)",
        errorColor: "#dc2626",
        successColor: "#16a34a",
        successBg: "rgba(34,197,94,0.85)",
        primaryBg: "rgba(147,51,234,0.85)",
      };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      onRequestClose={() => {
        Keyboard.dismiss();
        onClose();
      }}
      statusBarTranslucent
    >
      <TouchableWithoutFeedback
        onPress={() => {
          Keyboard.dismiss();
          onClose();
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: isDark ? "rgba(0,0,0,0.6)" : "rgba(50,50,100,0.3)",
            justifyContent: "flex-end",
          }}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            keyboardVerticalOffset={0}
          >
            <TouchableWithoutFeedback onPress={() => {}}>
              <Animated.View
                style={{
                  opacity: fadeAnim,
                  backgroundColor: colors.cardBg,
                  borderTopLeftRadius: 24,
                  borderTopRightRadius: 24,
                  padding: 24,
                  paddingBottom: Platform.OS === "ios" ? 36 : 24,
                  borderTopWidth: 1,
                  borderColor: colors.borderColor,
                }}
              >
                {/* Dev badge */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 16,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: colors.devBadgeBg,
                      borderRadius: 6,
                      paddingHorizontal: 8,
                      paddingVertical: 3,
                      borderWidth: 1,
                      borderColor: colors.devBadgeBorder,
                    }}
                  >
                    <Text
                      style={{
                        color: colors.devBadgeText,
                        fontSize: 10,
                        fontWeight: "700",
                        letterSpacing: 1,
                      }}
                    >
                      DEV
                    </Text>
                  </View>
                  <Text
                    style={{
                      color: colors.subtextColor,
                      fontSize: 11,
                    }}
                  >
                    Development only
                  </Text>
                </View>

                <Text
                  style={{
                    color: colors.textColor,
                    fontSize: 18,
                    fontWeight: "700",
                    marginBottom: 4,
                  }}
                >
                  API Server Settings
                </Text>
                <Text
                  style={{
                    color: colors.subtextColor,
                    fontSize: 13,
                    marginBottom: 20,
                    lineHeight: 18,
                  }}
                >
                  Enter the IP address of the machine running the backend. This
                  allows the app to be accessed from any device on the same
                  network.
                </Text>

                {/* IP Input */}
                <Text
                  style={{
                    color: colors.subtextColor,
                    fontSize: 11,
                    fontWeight: "600",
                    letterSpacing: 1,
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Server IP Address
                </Text>
                <TextInput
                  ref={inputRef}
                  value={ip}
                  onChangeText={(text) => {
                    setIp(text);
                    setError("");
                  }}
                  placeholder="192.168.1.100"
                  placeholderTextColor={colors.subtextColor}
                  keyboardType="numbers-and-punctuation"
                  returnKeyType="done"
                  onSubmitEditing={handleSave}
                  autoCorrect={false}
                  autoCapitalize="none"
                  style={{
                    backgroundColor: colors.inputBg,
                    borderRadius: 14,
                    borderWidth: 1,
                    borderColor: colors.borderColor,
                    paddingHorizontal: 16,
                    paddingVertical: 13,
                    fontSize: 16,
                    color: colors.textColor,
                    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
                    marginBottom: error ? 4 : 8,
                  }}
                />
                {error && (
                  <Text
                    style={{
                      color: colors.errorColor,
                      fontSize: 11,
                      marginBottom: 16,
                    }}
                  >
                    {error}
                  </Text>
                )}
                <Text
                  style={{
                    color: colors.subtextColor,
                    fontSize: 11,
                    marginBottom: 24,
                  }}
                >
                  Port 3000 will be used by default
                </Text>

                {/* Buttons */}
                <View style={{ flexDirection: "row", gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => {
                      Keyboard.dismiss();
                      onClose();
                    }}
                    style={{
                      flex: 1,
                      paddingVertical: 14,
                      borderRadius: 14,
                      alignItems: "center",
                      borderWidth: 1,
                      borderColor: colors.borderColor,
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.04)"
                        : "rgba(0,0,0,0.03)",
                    }}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={{
                        color: colors.subtextColor,
                        fontSize: 15,
                        fontWeight: "600",
                      }}
                    >
                      Cancel
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
                      backgroundColor: saved
                        ? colors.successBg
                        : colors.primaryBg,
                      opacity: saving ? 0.7 : 1,
                    }}
                    activeOpacity={0.8}
                  >
                    {saving ? (
                      <ActivityIndicator color="#fff" size="small" />
                    ) : (
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 15,
                          fontWeight: "700",
                        }}
                      >
                        {saved ? `✓ Saved` : "Save & Apply"}
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
