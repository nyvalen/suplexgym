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
  Image,
  Dimensions,
} from "react-native";
import { authFetch, ENDPOINTS, resolveImageUrl } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useCartStore } from "../store";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const CARD_HEIGHT = 210;

// Fallback gym images per type when no imagePath is set
const FALLBACK_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&w=800&q=80",
  2: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&w=800&q=80",
  3: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&w=800&q=80",
};

const TYPE_ACCENT: Record<number, string> = {
  1: "#f59e0b",
  2: "#10b981",
  3: "#7c3aed",
};

interface TicketItem {
  id: number;
  name: string;
  description: string;
  price: number;
  validityDays: number;
  typeName: string;
  type_id: number;
  imagePath?: string | null;
}

type Category = "all" | "daily" | "monthly" | "yearly";
const TYPE_MAP: Record<number, Category> = { 1: "daily", 2: "monthly", 3: "yearly" };
const CATEGORY_ACCENT: Record<Category, string> = {
  all: "#7c3aed",
  daily: "#f59e0b",
  monthly: "#10b981",
  yearly: "#7c3aed",
};
const CATEGORY_EMOJI: Record<Category, string> = {
  all: "🎫",
  daily: "☀️",
  monthly: "📅",
  yearly: "⭐",
};

// ─── Ticket Banner Card ────────────────────────────────────────────────────────
function TicketBannerCard({ item, inCart, onAdd, onRemove, adding, isDark, t }: any) {
  const accent = TYPE_ACCENT[item.type_id] ?? "#7c3aed";
  const imageUri =
    resolveImageUrl(item.imagePath) ??
    FALLBACK_IMAGES[item.type_id] ??
    FALLBACK_IMAGES[1];

  const scale = useRef(new Animated.Value(1)).current;
  const pressIn = () =>
    Animated.timing(scale, { toValue: 0.978, duration: 90, useNativeDriver: true }).start();
  const pressOut = () =>
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        marginBottom: 16,
        borderRadius: 24,
        overflow: "hidden",
        height: CARD_HEIGHT,
        shadowColor: accent,
        shadowOffset: { width: 0, height: inCart ? 10 : 6 },
        shadowOpacity: inCart ? 0.5 : 0.22,
        shadowRadius: 22,
        elevation: inCart ? 12 : 7,
        // Highlight border when in cart
        borderWidth: inCart ? 2 : 0,
        borderColor: inCart ? accent : "transparent",
      }}
    >
      {/* ── Full-bleed background image ── */}
      <Image
        source={{ uri: imageUri }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />

      {/* ── Gradient scrim (bottom-heavy so text pops) ── */}
      <LinearGradient
        colors={["rgba(0,0,0,0)", "rgba(0,0,0,0.3)", "rgba(0,0,0,0.82)"]}
        locations={[0, 0.35, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={{ position: "absolute", inset: 0 }}
      />

      {/* ── Subtle accent tint ── */}
      <View style={{ position: "absolute", inset: 0, backgroundColor: accent, opacity: inCart ? 0.14 : 0.06 }} />

      {/* ── TOP badges ── */}
      {/* Type badge – top-left */}
      <View style={{ position: "absolute", top: 14, left: 14 }}>
        <View style={{
          backgroundColor: accent + "dd",
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
        }}>
          <Text style={{ color: "#fff", fontSize: 10, fontWeight: "800", letterSpacing: 1, textTransform: "uppercase" }}>
            {item.typeName}
          </Text>
        </View>
      </View>

      {/* Duration badge – top-right */}
      <View style={{ position: "absolute", top: 14, right: 14 }}>
        <View style={{
          backgroundColor: "rgba(0,0,0,0.5)",
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.18)",
        }}>
          <Text style={{ color: "rgba(255,255,255,0.9)", fontSize: 11, fontWeight: "600" }}>
            ⏱ {item.validityDays} {t("purchase.days")}
          </Text>
        </View>
      </View>

      {/* ── BOTTOM glass panel ── */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          // Simulated glass: semi-transparent dark panel with blur fallback
          backgroundColor: isDark ? "rgba(9,9,11,0.75)" : "rgba(20,20,24,0.72)",
          // On iOS we'd use BlurView but keeping it dep-free here
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.1)",
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        {/* Name + Price */}
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{ color: "#fff", fontSize: 16, fontWeight: "800", letterSpacing: -0.3 }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.description ? (
            <Text
              style={{ color: "rgba(255,255,255,0.55)", fontSize: 11, marginTop: 1 }}
              numberOfLines={1}
            >
              {item.description}
            </Text>
          ) : null}
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 3, marginTop: 3 }}>
            <Text style={{ color: accent, fontSize: 20, fontWeight: "900" }}>
              {item.price.toLocaleString()}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.5)", fontSize: 12 }}>Ft</Text>
          </View>
        </View>

        {/* Action button */}
        {inCart ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View style={{
              backgroundColor: "rgba(74,222,128,0.18)",
              borderRadius: 14,
              paddingHorizontal: 12,
              paddingVertical: 7,
              borderWidth: 1,
              borderColor: "rgba(74,222,128,0.4)",
            }}>
              <Text style={{ color: "#4ade80", fontSize: 12, fontWeight: "700" }}>✓ {t("purchase.added")}</Text>
            </View>
            <TouchableOpacity
              onPress={onRemove}
              onPressIn={pressIn}
              onPressOut={pressOut}
              style={{
                width: 34,
                height: 34,
                borderRadius: 17,
                backgroundColor: "rgba(248,113,113,0.18)",
                borderWidth: 1,
                borderColor: "rgba(248,113,113,0.4)",
                alignItems: "center",
                justifyContent: "center",
              }}
              activeOpacity={0.75}
            >
              <Text style={{ color: "#f87171", fontSize: 14, fontWeight: "700" }}>✕</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onAdd}
            onPressIn={pressIn}
            onPressOut={pressOut}
            disabled={adding}
            activeOpacity={0.85}
            style={[
              {
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: 10,
                backgroundColor: accent,
                alignItems: "center",
                justifyContent: "center",
                minWidth: 96,
              },
              adding && { opacity: 0.55 },
            ]}
          >
            {adding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={{ color: "#fff", fontSize: 13, fontWeight: "700" }}>
                {t("purchase.addToCart")}
              </Text>
            )}
          </TouchableOpacity>
        )}
      </View>
    </Animated.View>
  );
}

// ─── Cart Bar ─────────────────────────────────────────────────────────────────
function CartBar({ cart, onCheckout, t }: any) {
  const translateY = useRef(new Animated.Value(200)).current;
  const total = cart.reduce((s: number, i: any) => s + i.price, 0);

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
          <Text style={{ fontSize: 10, color: "rgba(255,255,255,0.55)", fontWeight: "600", letterSpacing: 1, textTransform: "uppercase" }}>
            {t("purchase.cartTotal")}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff" }}>
            {total.toLocaleString()} Ft
          </Text>
        </View>
        <TouchableOpacity
          onPress={onCheckout}
          activeOpacity={0.85}
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
        >
          <View style={{ backgroundColor: "#fff", width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ color: "#7c3aed", fontSize: 11, fontWeight: "900" }}>{cart.length}</Text>
          </View>
          <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>
            {t("purchase.checkout")}
          </Text>
        </TouchableOpacity>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
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

  const CATEGORY_LABELS: Record<Category, string> = {
    all: t("purchase.all"),
    daily: t("purchase.daily"),
    monthly: t("purchase.monthly"),
    yearly: t("purchase.yearly"),
  };

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
    [adding, addItem, cart],
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
          if (serverItem)
            await authFetch(ENDPOINTS.cartItem(serverItem.id), { method: "DELETE" });
        }
      } catch {
        addItem(cartItem);
      }
    },
    [cart, removeItem, addItem],
  );

  const filtered = items.filter((item) =>
    activeCategory === "all" ? true : TYPE_MAP[item.type_id] === activeCategory,
  );

  const categories: Category[] = ["all", "daily", "monthly", "yearly"];

  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#09090b" : "#fafafa", paddingBottom: Platform.OS === "android" ? 140 : 66 }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor="transparent" translucent />

      <LinearGradient
        colors={["rgba(124,58,237,0.3)", "rgba(124,58,237,0)"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 4 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", letterSpacing: -0.5, color: isDark ? "#fafafa" : "#09090b" }}>
          {t("purchase.title")}
        </Text>
        <Text style={{ fontSize: 13, marginTop: 2, color: isDark ? "#a1a1aa" : "#52525b" }}>
          {t("purchase.subtitle")}
        </Text>
      </View>

      {/* Category filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 12, gap: 8, flexDirection: "row" }}
      >
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          const accent = CATEGORY_ACCENT[cat];
          const emoji = CATEGORY_EMOJI[cat];
          return (
            <TouchableOpacity
              key={cat}
              onPress={() => setActiveCategory(cat)}
              activeOpacity={0.8}
              style={[
                {
                  borderRadius: 24,
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderWidth: 1.5,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 5,
                },
                isActive
                  ? { backgroundColor: accent, borderColor: accent }
                  : {
                      backgroundColor: "transparent",
                      borderColor: isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)",
                    },
              ]}
            >
              {cat !== "all" && <Text style={{ fontSize: 13 }}>{emoji}</Text>}
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  color: isActive ? "#fff" : isDark ? "#a1a1aa" : "#52525b",
                }}
              >
                {CATEGORY_LABELS[cat]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Item cards */}
      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ flex: 1 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: cart.length > 0
              ? Platform.OS === "android" ? 200 : 130
              : Platform.OS === "android" ? 160 : 40,
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
            filtered.map((item) => (
              <TicketBannerCard
                key={item.id}
                item={item}
                inCart={!!cart.find((c) => c.itemId === item.id)}
                adding={!!adding[item.id]}
                isDark={isDark}
                t={t}
                onAdd={() => addToCart(item)}
                onRemove={() => removeFromCart(item)}
              />
            ))
          )}
        </ScrollView>
      )}

      <CartBar cart={cart} isDark={isDark} t={t} onCheckout={() => cart.length > 0 && router.push("/purchase-finalization")} />
    </View>
  );
}
