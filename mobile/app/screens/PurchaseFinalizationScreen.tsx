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
import { useNavigation } from "@react-navigation/native";
import { authFetch, ENDPOINTS } from "../utils/auth";
import type { CartItem } from "./PurchaseTicketsScreen";
import { useTheme, tokens } from "../theme/ThemeContext";

const CATEGORY_COLORS: Record<number, string> = {
  1: "#f59e0b",
  2: "#10b981",
  3: "#7c3aed",
};

export default function PurchaseFinalizationScreen({ route }: any) {
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  const cart: CartItem[] = route?.params?.cart ?? [];
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
  const totalItems = cart.reduce((s, i) => s + i.quantity, 0);

  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";

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
    setTimeout(
      () =>
        navigation.navigate("NavTabs" as never, { screen: "Jegyek" } as never),
      2200,
    );
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
        style={{
          flex: 1,
          backgroundColor: t.bg,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={t.bg}
        />

        {/* Blob */}
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            top: "20%",
            left: "50%",
            width: 300,
            height: 300,
            borderRadius: 150,
            marginLeft: -150,
            backgroundColor: isDark
              ? "rgba(74,222,128,0.08)"
              : "rgba(22,163,74,0.05)",
          }}
        />

        <Animated.View
          style={{
            transform: [{ scale: successScale }],
            opacity: successOpacity,
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: 110,
              height: 110,
              borderRadius: 55,
              backgroundColor: t.success + "22",
              alignItems: "center",
              justifyContent: "center",
              borderWidth: 2,
              borderColor: t.success + "55",
              marginBottom: 28,
              shadowColor: t.success,
              shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.3,
              shadowRadius: 24,
              elevation: 12,
            }}
          >
            <Text style={{ fontSize: 50, color: t.success }}>✓</Text>
          </View>
          <Text
            style={{
              fontSize: 30,
              fontWeight: "800",
              color: t.text,
              marginBottom: 8,
            }}
          >
            Sikeres vásárlás!
          </Text>
          <Text style={{ fontSize: 16, color: t.textSub }}>
            {totalItems} db jegy hozzáadva a fiókodhoz
          </Text>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={t.bg}
      />

      {/* Blob */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -40,
          right: -40,
          width: 220,
          height: 220,
          borderRadius: 110,
          backgroundColor: isDark
            ? "rgba(124,58,237,0.1)"
            : "rgba(124,58,237,0.05)",
        }}
      />

      <View
        style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ marginBottom: 12 }}
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
          Rendelés összesítő
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {cart.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 80, gap: 16 }}>
            <Text style={{ fontSize: 18, color: t.textSub }}>
              A kosarad üres
            </Text>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={{
                backgroundColor: "#7c3aed",
                paddingHorizontal: 24,
                paddingVertical: 14,
                borderRadius: 16,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "700", fontSize: 15 }}>
                Böngészés
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "700",
                color: t.textMuted,
                letterSpacing: 2,
                textTransform: "uppercase",
                marginBottom: 12,
              }}
            >
              Tételek
            </Text>

            {cart.map((item) => (
              <View
                key={item.itemId}
                style={{
                  backgroundColor: surface,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: surfaceBorder,
                  flexDirection: "row",
                  overflow: "hidden",
                  marginBottom: 10,
                }}
              >
                <View
                  style={{
                    width: 4,
                    backgroundColor: CATEGORY_COLORS[item.type_id] ?? "#7c3aed",
                  }}
                />
                <View style={{ flex: 1, padding: 14 }}>
                  <Text
                    style={{ fontSize: 15, fontWeight: "700", color: t.text }}
                  >
                    {item.name}
                  </Text>
                  <Text
                    style={{ fontSize: 12, color: t.textSub, marginTop: 3 }}
                  >
                    {item.price.toLocaleString("hu-HU")} Ft / db ·{" "}
                    {item.validityDays} nap
                  </Text>
                </View>
                <View
                  style={{
                    padding: 14,
                    alignItems: "flex-end",
                    justifyContent: "center",
                    gap: 6,
                  }}
                >
                  <Text style={{ fontSize: 12, color: t.textSub }}>
                    × {item.quantity}
                  </Text>
                  <Text
                    style={{ fontSize: 15, fontWeight: "700", color: t.text }}
                  >
                    {(item.price * item.quantity).toLocaleString("hu-HU")} Ft
                  </Text>
                </View>
              </View>
            ))}

            {/* Summary card */}
            <View
              style={{
                backgroundColor: surface,
                borderRadius: 20,
                borderWidth: 1,
                borderColor: surfaceBorder,
                padding: 18,
                marginTop: 8,
                gap: 10,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                }}
              >
                <Text style={{ fontSize: 14, color: t.textSub }}>
                  Tételek száma
                </Text>
                <Text
                  style={{ fontSize: 14, color: t.text, fontWeight: "600" }}
                >
                  {totalItems} db
                </Text>
              </View>
              <View
                style={{
                  height: 1,
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.05)",
                }}
              />
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: t.text }}
                >
                  Összesen
                </Text>
                <Text
                  style={{ fontSize: 22, fontWeight: "800", color: "#7c3aed" }}
                >
                  {total.toLocaleString("hu-HU")} Ft
                </Text>
              </View>
            </View>

            {!!errMsg && (
              <View
                style={{
                  backgroundColor: isDark
                    ? "rgba(248,113,113,0.1)"
                    : "rgba(220,38,38,0.07)",
                  borderRadius: 12,
                  padding: 14,
                  marginTop: 14,
                  borderWidth: 1,
                  borderColor: isDark
                    ? "rgba(248,113,113,0.25)"
                    : "rgba(220,38,38,0.2)",
                }}
              >
                <Text
                  style={{ color: t.danger, fontSize: 13, textAlign: "center" }}
                >
                  {errMsg}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {cart.length > 0 && (
        <View style={{ position: "absolute", bottom: 24, left: 20, right: 20 }}>
          <TouchableOpacity
            style={[
              {
                backgroundColor: "#7c3aed",
                borderRadius: 22,
                paddingVertical: 20,
                paddingHorizontal: 26,
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
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
                <Text
                  style={{ fontSize: 17, fontWeight: "700", color: "#fff" }}
                >
                  Fizetés megerősítése
                </Text>
                <Text
                  style={{ fontSize: 17, fontWeight: "800", color: "#fff" }}
                >
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
