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

import { router, useLocalSearchParams } from "expo-router";
import { authFetch, ENDPOINTS } from "../utils/auth";
import type { CartItem } from "./purchase";
import { useTheme, tokens } from "../theme/ThemeContext";

const CATEGORY_COLORS: Record<number, string> = {
  1: "#f59e0b",
  2: "#10b981",
  3: "#7c3aed",
};

export default function PurchaseFinalizationScreen() {
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  const { cart: cartParam } = useLocalSearchParams<{ cart: string }>();
  const cart: CartItem[] = cartParam ? JSON.parse(cartParam) : [];
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const showSuccess = () => {
    setSuccess(true);
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
    setTimeout(() => router.replace("/(tabs)/main"), 2200);
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
      if (res.ok) showSuccess();
      else {
        const err = await res.json().catch(() => ({}));
        setErrMsg(err?.message ?? "Hiba a fizetés során. Próbáld újra.");
      }
    } catch (e: any) {
      setErrMsg(
        e?.message === "SESSION_EXPIRED"
          ? "Lejárt a munkamenet."
          : "Hálózati hiba. Próbáld újra.",
      );
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: t.bg }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={t.bg}
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
              backgroundColor: t.success + "22",
              borderColor: t.success + "55",
              shadowColor: t.success,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <Text className="text-[50px]" style={{ color: t.success }}>
              ✓
            </Text>
          </View>
          <Text
            className="text-[30px] font-extrabold mb-2"
            style={{ color: t.text }}
          >
            Sikeres vásárlás!
          </Text>
          <Text className="text-base" style={{ color: t.textSub }}>
            {totalItems} db jegy hozzáadva a fiókodhoz
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: t.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={t.bg}
      />

      {/* Blob */}
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
            ← Vissza
          </Text>
        </TouchableOpacity>
        <Text
          className="text-[28px] font-extrabold tracking-[-0.5px]"
          style={{ color: t.text }}
        >
          Rendelés összesítő
        </Text>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {cart.length === 0 ? (
          <View className="items-center mt-20 gap-4">
            <Text className="text-lg" style={{ color: t.textSub }}>
              A kosarad üres
            </Text>
            <TouchableOpacity
              onPress={() => router.back()}
              className="bg-[#7c3aed] px-6 py-3.5 rounded-2xl"
            >
              <Text className="text-white font-bold text-[15px]">
                Böngészés
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text
              className="text-[11px] font-bold tracking-[2px] uppercase mb-3"
              style={{ color: t.textMuted }}
            >
              Tételek
            </Text>

            {cart.map((item) => (
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
                <View
                  className="w-1"
                  style={{
                    backgroundColor: CATEGORY_COLORS[item.type_id] ?? "#7c3aed",
                  }}
                />
                <View className="flex-1 p-3.5">
                  <Text
                    className="text-[15px] font-bold"
                    style={{ color: t.text }}
                  >
                    {item.name}
                  </Text>
                  <Text className="text-xs mt-0.5" style={{ color: t.textSub }}>
                    {item.price.toLocaleString("hu-HU")} Ft / db ·{" "}
                    {item.validityDays} nap
                  </Text>
                </View>
                <View className="p-3.5 items-end justify-center gap-1.5">
                  <Text className="text-xs" style={{ color: t.textSub }}>
                    × {item.quantity}
                  </Text>
                  <Text
                    className="text-[15px] font-bold"
                    style={{ color: t.text }}
                  >
                    {(item.price * item.quantity).toLocaleString("hu-HU")} Ft
                  </Text>
                </View>
              </View>
            ))}

            {/* Summary card */}
            <View
              className="rounded-[20px] border p-[18px] mt-2 gap-2.5"
              style={{
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(255,255,255,0.9)",
                borderColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            >
              <View className="flex-row justify-between">
                <Text className="text-sm" style={{ color: t.textSub }}>
                  Tételek száma
                </Text>
                <Text
                  className="text-sm font-semibold"
                  style={{ color: t.text }}
                >
                  {totalItems} db
                </Text>
              </View>
              <View
                className="h-px"
                style={{
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.05)",
                }}
              />
              <View className="flex-row justify-between items-center">
                <Text className="text-base font-bold" style={{ color: t.text }}>
                  Összesen
                </Text>
                <Text className="text-[22px] font-extrabold text-[#7c3aed]">
                  {total.toLocaleString("hu-HU")} Ft
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
                  style={{ color: t.danger }}
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
                  Fizetés megerősítése
                </Text>
                <Text className="text-[17px] font-extrabold text-white">
                  {total.toLocaleString("hu-HU")} Ft
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}
