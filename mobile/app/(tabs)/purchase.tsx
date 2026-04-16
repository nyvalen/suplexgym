import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
  ScrollView,
  Platform,
  Dimensions,
} from "react-native";
import { authFetch, ENDPOINTS } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useCartStore } from "../store";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

interface TicketItem {
  id: number;
  name: string;
  description: string;
  price: number;
  validityDays: number;
  typeName: string;
  type_id: number;
}

type Category = "all" | "daily" | "monthly" | "yearly";
const TYPE_MAP: Record<number, Category> = {
  1: "daily",
  2: "monthly",
  3: "yearly",
};

// Distinct visual config per pass type
const PASS_CONFIG: Record<Category, {
  gradient: [string, string];
  accent: string;
  emoji: string;
  duration: string;
}> = {
  all: {
    gradient: ["#7c3aed", "#4f46e5"],
    accent: "#a78bfa",
    emoji: "🎫",
    duration: "",
  },
  daily: {
    gradient: ["#d97706", "#b45309"],
    accent: "#fbbf24",
    emoji: "☀️",
    duration: "1 nap",
  },
  monthly: {
    gradient: ["#059669", "#047857"],
    accent: "#34d399",
    emoji: "📅",
    duration: "30 nap",
  },
  yearly: {
    gradient: ["#7c3aed", "#5b21b6"],
    accent: "#c4b5fd",
    emoji: "⭐",
    duration: "365 nap",
  },
};

function TicketCard({
  item,
  inCart,
  onAdd,
  onRemove,
  adding,
  isDark,
  t,
}: any) {
  const cat: Category = TYPE_MAP[item.type_id] ?? "all";
  const config = PASS_CONFIG[cat];
  const scale = useRef(new Animated.Value(1)).current;

  const animPress = () =>
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        activeOpacity={0.92}
        onPressIn={animPress}
        style={{
          marginBottom: 12,
          borderRadius: 20,
          overflow: "hidden",
          shadowColor: config.gradient[0],
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.3,
          shadowRadius: 16,
          elevation: 8,
        }}
      >
        {/* Gradient header */}
        <LinearGradient
          colors={config.gradient}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ padding: 20, paddingBottom: 16 }}
        >
          <View style={{ flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" }}>
            <View style={{ flex: 1 }}>
              {/* Duration badge */}
              <View
                style={{
                  alignSelf: "flex-start",
                  backgroundColor: "rgba(255,255,255,0.2)",
                  borderRadius: 20,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  marginBottom: 8,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.3)",
                }}
              >
                <Text style={{ color: "#fff", fontSize: 10, fontWeight: "700", letterSpacing: 1 }}>
                  {config.emoji}  {config.duration || item.typeName?.toUpperCase()}
                </Text>
              </View>

              <Text style={{ color: "#fff", fontSize: 20, fontWeight: "800", letterSpacing: -0.5 }}>
                {item.name}
              </Text>
              {item.description ? (
                <Text
                  style={{ color: "rgba(255,255,255,0.7)", fontSize: 12, marginTop: 4, lineHeight: 18 }}
                  numberOfLines={2}
                >
                  {item.description}
                </Text>
              ) : null}
            </View>

            {/* Price bubble */}
            <View
              style={{
                backgroundColor: "rgba(0,0,0,0.25)",
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 8,
                alignItems: "center",
                marginLeft: 12,
              }}
            >
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "900" }}>
                {item.price.toLocaleString()}
              </Text>
              <Text style={{ color: "rgba(255,255,255,0.6)", fontSize: 10, fontWeight: "600" }}>Ft</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Body */}
        <View
          style={{
            backgroundColor: isDark ? "rgba(24,24,27,0.97)" : "#fff",
            paddingHorizontal: 20,
            paddingVertical: 14,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 4 }}>
            <Text style={{ fontSize: 12, color: isDark ? "#71717a" : "#a1a1aa" }}>⏱</Text>
            <Text style={{ fontSize: 12, color: isDark ? "#71717a" : "#a1a1aa", fontWeight: "500" }}>
              {item.validityDays} {t("purchase.days")}
            </Text>
          </View>

          {inCart ? (
            <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
              <View
                style={{
                  backgroundColor: "rgba(74,222,128,0.15)",
                  borderRadius: 20,
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderWidth: 1,
                  borderColor: "rgba(74,222,128,0.3)",
                }}
              >
                <Text style={{ color: "#4ade80", fontSize: 12, fontWeight: "700" }}>✓ {t("purchase.added")}</Text>
              </View>
              <TouchableOpacity
                onPress={onRemove}
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  backgroundColor: "rgba(248,113,113,0.12)",
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(248,113,113,0.3)",
                }}
              >
                <Text style={{ color: "#f87171", fontSize: 14, fontWeight: "700" }}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity
              onPress={onAdd}
              disabled={adding}
              style={[
                {
                  borderRadius: 12,
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                  alignItems: "center",
                  justifyContent: "center",
                },
                adding ? { opacity: 0.5 } : {},
              ]}
            >
              <LinearGradient
                colors={config.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  borderRadius: 12,
                  paddingHorizontal: 20,
                  paddingVertical: 8,
                }}
              >
                {adding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                    {t("purchase.addToCart")}
                  </Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

function CartBar({ cart, onCheckout, isDark, t }: any) {
  const translateY = useRef(new Animated.Value(100)).current;
  const total = cart.reduce((s: number, i: any) => s + i.price, 0);
  const count = cart.length;

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: cart.length > 0 ? 0 : 200,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [cart.length]);

  return (
    <Animated.View
      style={{
        position: "absolute",
        bottom: Platform.OS === "android" ? 104 : 90,
        left: 16,
        right: 16,
        borderRadius: 24,
        overflow: "hidden",
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 16,
        transform: [{ translateY }],
        opacity: cart.length > 0 ? 1 : 0,
      }}
      pointerEvents={cart.length > 0 ? "auto" : "none"}
    >
      <LinearGradient
        colors={["#7c3aed", "#4f46e5"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 16,
          paddingHorizontal: 22,
        }}
      >
        <View>
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.6)", fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
            {t("purchase.cartTotal")}
          </Text>
          <Text style={{ fontSize: 20, fontWeight: "900", color: "#fff" }}>
            {total.toLocaleString()} Ft
          </Text>
        </View>
        <TouchableOpacity
          onPress={onCheckout}
          style={{
            backgroundColor: "rgba(255,255,255,0.18)",
            borderRadius: 14,
            paddingHorizontal: 18,
            paddingVertical: 10,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.25)",
          }}
          activeOpacity={0.85}
        >
          <View
            style={{
              backgroundColor: "#fff",
              width: 22,
              height: 22,
              borderRadius: 11,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#7c3aed", fontSize: 11, fontWeight: "900" }}>{count}</Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            {t("purchase.checkout")}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

export default function PurchaseTicketsScreen() {
  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [adding, setAdding] = useState<Record<number, boolean>>({});

  const { isDark } = useTheme();
  const { t } = useLanguage();

  const cart = useCartStore((s) => s.cart);
  const addItem = useCartStore((s) => s.addItem);
  const removeItem = useCartStore((s) => s.removeItem);

  useEffect(() => {
    authFetch(ENDPOINTS.items)
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addToCart = useCallback(
    async (item: TicketItem) => {
      if (adding[item.id] || cart.find((c) => c.itemId === item.id)) return;
      setAdding((prev) => ({ ...prev, [item.id]: true }));
      try {
        const res = await authFetch(ENDPOINTS.cartAdd, {
          method: "POST",
          body: JSON.stringify({ item_id: item.id, quantity: 1 }),
        });
        if (res.ok) {
          addItem({
            itemId: item.id,
            name: item.name,
            price: item.price,
            validityDays: item.validityDays,
            typeName: item.typeName,
            type_id: item.type_id,
            quantity: 1,
          });
        }
      } catch {
      } finally {
        setAdding((prev) => ({ ...prev, [item.id]: false }));
      }
    },
    [adding, addItem, cart]
  );

  const removeFromCart = useCallback(
    async (item: TicketItem) => {
      const cartItem = cart.find((c) => c.itemId === item.id);
      if (!cartItem) return;
      removeItem(item.id);
      try {
        const cartRes = await authFetch(ENDPOINTS.cart);
        if (cartRes.ok) {
          const serverCart = await cartRes.json();
          const serverItem = serverCart.items?.find((i: any) => i.item_id === item.id);
          if (serverItem) {
            await authFetch(ENDPOINTS.cartItem(serverItem.id), { method: "DELETE" });
          }
        }
      } catch {
        addItem(cartItem);
      }
    },
    [cart, removeItem, addItem]
  );

  const CATEGORY_LABELS: Record<Category, string> = {
    all: t("purchase.all"),
    daily: t("purchase.daily"),
    monthly: t("purchase.monthly"),
    yearly: t("purchase.yearly"),
  };

  const filtered = items.filter((item) => {
    if (activeCategory === "all") return true;
    return TYPE_MAP[item.type_id] === activeCategory;
  });

  const categories: Category[] = ["all", "daily", "monthly", "yearly"];

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? "#09090b" : "#fafafa",
        paddingBottom: Platform.OS === "android" ? 140 : 66,
      }}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Background gradient */}
      <LinearGradient
        colors={["rgba(124,58,237,0.35)", "rgba(124,58,237,0)"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 300 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 8 }}>
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            letterSpacing: -0.5,
            color: isDark ? "#fafafa" : "#09090b",
          }}
        >
          {t("purchase.title")}
        </Text>
        <Text style={{ fontSize: 13, marginTop: 2, color: isDark ? "#a1a1aa" : "#52525b" }}>
          {t("purchase.subtitle")}
        </Text>
      </View>

      {/* Category tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: 16,
          paddingTop: 8,
          gap: 8,
          flexDirection: "row",
        }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const config = PASS_CONFIG[cat];
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
              style={[
                {
                  borderRadius: 24,
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderWidth: 1.5,
                },
                isActive
                  ? {
                      backgroundColor: config.gradient[0],
                      borderColor: config.gradient[0],
                    }
                  : {
                      backgroundColor: "transparent",
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
                    },
              ]}
            >
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: isActive ? "#fff" : isDark ? "#a1a1aa" : "#52525b",
                }}
              >
                {cat !== "all" && `${PASS_CONFIG[cat].emoji} `}
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Items list */}
      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ flex: 1 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom:
              Platform.OS === "android"
                ? cart.length > 0
                  ? 200
                  : 160
                : cart.length > 0
                ? 130
                : 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={{ alignItems: "center", marginTop: 60 }}>
              <Text style={{ fontSize: 15, color: isDark ? "#a1a1aa" : "#52525b" }}>
                {t("purchase.noResults")}
              </Text>
            </View>
          ) : (
            filtered.map((item) => {
              const inCart = !!cart.find((c) => c.itemId === item.id);
              return (
                <TicketCard
                  key={item.id}
                  item={item}
                  inCart={inCart}
                  adding={!!adding[item.id]}
                  isDark={isDark}
                  t={t}
                  onAdd={() => addToCart(item)}
                  onRemove={() => removeFromCart(item)}
                />
              );
            })
          )}
        </ScrollView>
      )}

      <CartBar
        cart={cart}
        isDark={isDark}
        t={t}
        onCheckout={() => cart.length > 0 && router.push("/purchase-finalization")}
      />
    </View>
  );
}
