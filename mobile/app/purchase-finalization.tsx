import React, { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Animated,
  ActivityIndicator,
  StatusBar,
} from "react-native";
import { router } from "expo-router";
import { authFetch, ENDPOINTS } from "./utils/auth";
import { useCartStore } from "./store";
import { useTheme, tokens } from "./theme/ThemeContext";
import { useLanguage } from "./i18n/LanguageContext";

const CATEGORY_COLORS: Record<number, string> = {
  1: "#f59e0b",
  2: "#10b981",
  3: "#7c3aed",
};

export default function PurchaseFinalizationScreen() {
  const { isDark } = useTheme();
  const { t } = useLanguage();
  const tokenSet = isDark ? tokens.dark : tokens.light;

  const cart = useCartStore((s) => s.cart);
  const clearCart = useCartStore((s) => s.clearCart);

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Each cart item is exactly 1 ticket, so total = sum of prices
  const total = cart.reduce((s, i) => s + i.price, 0);

  const showSuccess = () => {
    setSuccess(true);
    clearCart();
    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 60,
        friction: 8,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
    setTimeout(() => router.replace("/(tabs)/tickets-list"), 2200);
  };

  const handleCheckout = async () => {
    if (loading || cart.length === 0) return;
    setErrMsg("");
    setLoading(true);
    try {
      const res = await authFetch(ENDPOINTS.checkout, {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (res.ok) {
        showSuccess();
      } else {
        const err = await res.json().catch(() => ({}));
        setErrMsg(err?.message ?? t("finalization.paymentError"));
      }
    } catch (e: any) {
      setErrMsg(
        e?.message === "SESSION_EXPIRED"
          ? t("finalization.sessionExpired")
          : t("finalization.networkError"),
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Success splash ───────────────────────────────────────────────────────────
  if (success) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: tokenSet.bg }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={tokenSet.bg}
        />
        <View
          pointerEvents="none"
          className="absolute rounded-full w-[300px] h-[300px] -ml-[150px]"
          style={{
            top: "20%",
            left: "50%",
            backgroundColor: isDark
              ? "rgba(74,222,128,0.08)"
              : "rgba(22,163,74,0.05)",
          }}
        />
        <Animated.View
          className="items-center"
          style={{
            transform: [{ scale: successScale }],
            opacity: successOpacity,
          }}
        >
          <View
            className="w-[110px] h-[110px] rounded-full items-center justify-center border-2 mb-7"
            style={{
              backgroundColor: tokenSet.success + "22",
              borderColor: tokenSet.success + "55",
              shadowColor: tokenSet.success,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <Text className="text-[50px]" style={{ color: tokenSet.success }}>
              ✓
            </Text>
          </View>
          <Text
            className="text-[30px] font-extrabold mb-2"
            style={{ color: tokenSet.text }}
          >
            {t("finalization.successTitle")}
          </Text>
          <Text className="text-base" style={{ color: tokenSet.textSub }}>
            {`${t("finalization.successMessage")}`}
          </Text>
        </Animated.View>
      </View>
    );
  }

  // ── Main view ────────────────────────────────────────────────────────────────
  return (
    <View className="flex-1" style={{ backgroundColor: tokenSet.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={tokenSet.bg}
      />

      <View
        pointerEvents="none"
        className="absolute -top-10 -right-10 w-[220px] h-[220px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      <View className="px-5 pt-[60px] pb-5">
        <TouchableOpacity onPress={() => router.back()} className="mb-3">
          <Text className="text-[#7c3aed] text-[15px] font-semibold">
            {t("finalization.back")}
          </Text>
        </TouchableOpacity>
        <Text
          className="text-[28px] font-extrabold tracking-[-0.5px]"
          style={{ color: tokenSet.text }}
        >
          {t("finalization.title")}
        </Text>
        <Text className="text-sm mt-0.5" style={{ color: tokenSet.textSub }}>
          {cart.length} {t("finalization.ticketCount")}
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {cart.length === 0 ? (
          <View className="items-center mt-20 gap-4">
            <Text className="text-lg" style={{ color: tokenSet.textSub }}>
              {t("finalization.cartEmpty")}
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-[#7c3aed] px-6 py-3.5 rounded-2xl"
            >
              <Text className="text-white font-bold text-[15px]">
                {t("finalization.browse")}
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {/* Ticket list */}
            {cart.map((item) => {
              const color = CATEGORY_COLORS[item.type_id] ?? "#7c3aed";
              return (
                <View
                  key={item.itemId}
                  className="rounded-[18px] border flex-row overflow-hidden mb-2.5"
                  style={{
                    backgroundColor: isDark
                      ? "rgba(255,255,255,0.05)"
                      : "rgba(255,255,255,0.9)",
                    borderColor: isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  }}
                >
                  <View className="w-1" style={{ backgroundColor: color }} />
                  <View className="flex-1 p-4">
                    <Text
                      className="text-[15px] font-bold"
                      style={{ color: tokenSet.text }}
                    >
                      {item.name}
                    </Text>
                    <Text
                      className="text-xs mt-1"
                      style={{ color: tokenSet.textSub }}
                    >
                      {t("purchase.validFor")} {item.validityDays}{" "}
                      {t("purchase.days")}
                    </Text>
                  </View>
                  <View className="p-4 items-end justify-center">
                    <Text
                      className="text-[16px] font-extrabold"
                      style={{ color: tokenSet.text }}
                    >
                      {item.price.toLocaleString()} Ft
                    </Text>
                  </View>
                </View>
              );
            })}

            {/* Total summary */}
            <View
              className="rounded-[20px] border p-[18px] mt-2"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.9)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            >
              <View className="flex-row justify-between items-center">
                <Text
                  className="text-base font-bold"
                  style={{ color: tokenSet.text }}
                >
                  {t("finalization.total")}
                </Text>
                <Text className="text-[24px] font-extrabold text-[#7c3aed]">
                  {total.toLocaleString()} Ft
                </Text>
              </View>
            </View>

            {!!errMsg && (
              <View
                className="rounded-xl p-3.5 mt-3.5 border"
                style={{
                  backgroundColor: isDark
                    ? "rgba(248,113,113,0.1)"
                    : "rgba(220,38,38,0.07)",
                  borderColor: isDark
                    ? "rgba(248,113,113,0.25)"
                    : "rgba(220,38,38,0.2)",
                }}
              >
                <Text
                  className="text-[13px] text-center"
                  style={{ color: tokenSet.danger }}
                >
                  {errMsg}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View className="absolute bottom-6 left-5 right-5">
          <TouchableOpacity
            className="bg-[#7c3aed] rounded-[22px] py-5 px-[26px] flex-row justify-between items-center"
            style={[
              {
                shadowColor: "#7c3aed",
                shadowOffset: { width: 0, height: 12 },
                shadowOpacity: 0.45,
                shadowRadius: 20,
                elevation: 12,
              },
              loading && { opacity: 0.6 },
            ]}
            onPress={handleCheckout}
            activeOpacity={0.85}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text className="text-[17px] font-bold text-white">
                  {t("finalization.confirm")}
                </Text>
                <Text className="text-[17px] font-extrabold text-white">
                  {total.toLocaleString()} Ft
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
