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
import { useTheme, tokens } from "../../theme/ThemeContext";

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

  return (
    <View className="flex-1" style={{ backgroundColor: t.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Blob */}
      <View
        pointerEvents="none"
        className="absolute -top-[30px] -right-[30px] w-[200px] h-[200px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      {/* Header */}
      <View className="px-5 pt-[60px] pb-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="mb-2.5"
          activeOpacity={0.7}
        >
          <Text className="text-[#7c3aed] text-[15px] font-semibold">
            ← Vissza
          </Text>
        </TouchableOpacity>
        <Text
          className="text-[28px] font-extrabold tracking-[-0.5px]"
          style={{ color: t.text }}
        >
          Belépőjegy
        </Text>
      </View>

      <Animated.View
        className="flex-1"
        style={{ opacity: fadeIn, transform: [{ translateY: slideUp }] }}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {/* Ticket card */}
          <View
            className="mx-5 rounded-[24px] border overflow-hidden items-center pb-6"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.9)",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
            }}
          >
            {/* Color top strip */}
            <View
              className="w-full h-1"
              style={{ backgroundColor: statusColor }}
            />
            <View
              className="w-full h-0.5 mb-5"
              style={{ backgroundColor: "rgba(124,58,237,0.3)" }}
            />

            <Text
              className="text-[11px] font-extrabold tracking-[3px] mb-1"
              style={{ color: t.textMuted }}
            >
              SUPLEX GYM
            </Text>
            <Text
              className="text-[22px] font-extrabold tracking-[-0.5px] mb-3.5 text-center px-5"
              style={{ color: t.text }}
            >
              {article.itemName}
            </Text>

            {/* Status chip */}
            <View
              className="flex-row items-center gap-2 px-3.5 py-2 rounded-[20px] mb-[18px] border"
              style={{
                backgroundColor: statusColor + "18",
                borderColor: statusColor + "44",
              }}
            >
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: statusColor }}
              />
              <Text
                className="text-[13px] font-bold"
                style={{ color: statusColor }}
              >
                {expired ? "Lejárt" : `${days} nap van hátra`}
              </Text>
            </View>

            {/* Perforations */}
            <View className="flex-row w-full justify-center mb-5 gap-[5px]">
              {Array.from({ length: 20 }).map((_, i) => (
                <View
                  key={i}
                  className="w-2.5 h-0.5 rounded-sm"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.1)"
                      : "rgba(0,0,0,0.08)",
                  }}
                />
              ))}
            </View>

            {/* QR code */}
            {article.qrCodeBase64 ? (
              <View
                className="bg-white rounded-[20px] overflow-hidden items-center justify-center border-2"
                style={{
                  width: QR_SIZE,
                  height: QR_SIZE,
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
                  <View className="absolute w-full h-full items-center justify-center rounded-[18px] bg-black/55">
                    <Text
                      className="text-[30px] font-black tracking-[4px]"
                      style={{ color: t.danger }}
                    >
                      LEJÁRT
                    </Text>
                  </View>
                )}
              </View>
            ) : (
              <View
                className="rounded-[20px] items-center justify-center border"
                style={{
                  width: QR_SIZE,
                  height: QR_SIZE,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.05)"
                    : "rgba(0,0,0,0.03)",
                  borderColor: isDark
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.06)",
                }}
              >
                <Text style={{ fontSize: 80, color: t.textMuted }}>▦</Text>
              </View>
            )}

            <Text
              className="text-xs mt-4 tracking-[0.5px]"
              style={{ color: t.textMuted }}
            >
              Mutasd be a belépéshez
            </Text>
          </View>

          {/* Details card */}
          <View
            className="mx-5 mt-3.5 rounded-[18px] border p-[18px]"
            style={{
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(255,255,255,0.9)",
              borderColor: isDark
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.06)",
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
                    className="h-px"
                    style={{
                      backgroundColor: isDark
                        ? "rgba(255,255,255,0.06)"
                        : "rgba(0,0,0,0.05)",
                    }}
                  />
                )}
                <View className="flex-row justify-between py-2.5">
                  <Text
                    className="text-[13px] font-semibold"
                    style={{ color: t.textMuted }}
                  >
                    {row.label}
                  </Text>
                  <Text
                    className="text-[13px] font-semibold text-right flex-1 ml-3"
                    style={{ color: row.color }}
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
