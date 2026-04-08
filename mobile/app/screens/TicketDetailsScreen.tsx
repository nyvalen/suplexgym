import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  Animated,
  StatusBar,
  Dimensions,
  ScrollView,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useTheme, tokens } from "../theme/ThemeContext";

const { width } = Dimensions.get("window");
const QR_SIZE = width - 80;

function isExpired(e: string) {
  return new Date(e) < new Date();
}
function daysLeft(e: string) {
  return Math.max(
    0,
    Math.ceil((new Date(e).getTime() - Date.now()) / 86400000),
  );
}
function fmtDateTime(iso: string) {
  return new Date(iso).toLocaleDateString("hu-HU", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TicketsDetailsScreen({ route }: any) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;
  const { article } = route.params;

  const expired = isExpired(article.expiresAt);
  const days = daysLeft(article.expiresAt);
  const statusColor = expired
    ? t.danger
    : days <= 3
      ? "#f97316"
      : days <= 7
        ? t.warning
        : t.success;

  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(slideUp, {
        toValue: 0,
        tension: 60,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Blob */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -30,
          right: -30,
          width: 200,
          height: 200,
          borderRadius: 100,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      {/* Header */}
      <View
        style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 16 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 10 }}
          activeOpacity={0.7}
        >
          <Text style={{ color: "#7c3aed", fontSize: 15, fontWeight: "600" }}>
            ← Vissza
          </Text>
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 28,
            fontWeight: "800",
            color: t.text,
            letterSpacing: -0.5,
          }}
        >
          Belépőjegy
        </Text>
      </View>

      <Animated.View
        style={{
          flex: 1,
          opacity: fadeIn,
          transform: [{ translateY: slideUp }],
        }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Ticket card */}
          <View
            style={{
              marginHorizontal: 20,
              backgroundColor: surface,
              borderRadius: 24,
              borderWidth: 1,
              borderColor: surfaceBorder,
              overflow: "hidden",
              alignItems: "center",
              paddingBottom: 24,
            }}
          >
            {/* Color top strip */}
            <View
              style={{ width: "100%", height: 4, backgroundColor: statusColor }}
            />
            {/* Purple accent below strip */}
            <View
              style={{
                width: "100%",
                height: 2,
                backgroundColor: "rgba(124,58,237,0.3)",
                marginBottom: 20,
              }}
            />

            <Text
              style={{
                fontSize: 11,
                fontWeight: "800",
                color: t.textMuted,
                letterSpacing: 3,
                marginBottom: 4,
              }}
            >
              SUPLEX GYM
            </Text>
            <Text
              style={{
                fontSize: 22,
                fontWeight: "800",
                color: t.text,
                letterSpacing: -0.5,
                marginBottom: 14,
                textAlign: "center",
                paddingHorizontal: 20,
              }}
            >
              {article.itemName}
            </Text>

            {/* Status chip */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                paddingHorizontal: 14,
                paddingVertical: 8,
                borderRadius: 20,
                backgroundColor: statusColor + "18",
                borderWidth: 1,
                borderColor: statusColor + "44",
                marginBottom: 18,
              }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: statusColor,
                }}
              />
              <Text
                style={{ fontSize: 13, fontWeight: "700", color: statusColor }}
              >
                {expired ? "Lejárt" : `${days} nap van hátra`}
              </Text>
            </View>

            {/* Perforations */}
            <View
              style={{
                flexDirection: "row",
                width: "100%",
                justifyContent: "center",
                marginBottom: 20,
                gap: 5,
              }}
            >
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  style={{
                    width: 10,
                    height: 2,
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)",
                    borderRadius: 1,
                  }}
                />
              ))}
            </View>

            {/* QR code */}
            {article.qrCodeBase64 ? (
              <View
                style={{
                  width: QR_SIZE,
                  height: QR_SIZE,
                  backgroundColor: "#fff",
                  borderRadius: 20,
                  overflow: "hidden",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 2,
                  borderColor: "rgba(124,58,237,0.3)",
                }}
              >
                <Image
                  source={{
                    uri: `data:image/png;base64,${article.qrCodeBase64}`,
                  }}
                  style={[
                    { width: QR_SIZE - 24, height: QR_SIZE - 24 },
                    expired && { opacity: 0.2 },
                  ]}
                  resizeMode="contain"
                />
                {expired && (
                  <View
                    style={{
                      position: "absolute",
                      width: "100%",
                      height: "100%",
                      backgroundColor: "rgba(0,0,0,0.55)",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: 18,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 30,
                        fontWeight: "900",
                        color: t.danger,
                        letterSpacing: 4,
                      }}
                    >
                      LEJÁRT
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View
                style={{
                  width: QR_SIZE,
                  height: QR_SIZE,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderRadius: 20,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                <Text style={{ fontSize: 80, color: t.textMuted }}>▦</Text>
              </View>
            )}

            <Text
              style={{
                fontSize: 12,
                color: t.textMuted,
                marginTop: 16,
                letterSpacing: 0.5,
              }}
            >
              Mutasd be a belépéshez
            </Text>
          </View>

          {/* Details card */}
          <View
            style={{
              marginHorizontal: 20,
              marginTop: 14,
              backgroundColor: surface,
              borderRadius: 18,
              borderWidth: 1,
              borderColor: surfaceBorder,
              padding: 18,
            }}
          >
            {[
              {
                label: "Aktiválva",
                value: fmtDateTime(article.activatedAt),
                color: t.text,
              },
              {
                label: "Lejárat",
                value: fmtDateTime(article.expiresAt),
                color: statusColor,
              },
            ].map((row, i) => (
              <View key={row.label}>
                {i > 0 && (
                  <View
                    style={{
                      height: 1,
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingVertical: 10,
                  }}
                >
                  <Text
                    style={{
                      fontSize: 13,
                      color: t.textMuted,
                      fontWeight: "600",
                    }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    style={{
                      fontSize: 13,
                      fontWeight: "600",
                      color: row.color,
                      textAlign: "right",
                      flex: 1,
                      marginLeft: 12,
                    }}
                  >
                    {row.value}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}
