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
} from "react-native";
import { authFetch, ENDPOINTS, resolveImageUrl } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useCartStore } from "../store";
import { router } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";

const CARD_HEIGHT = 210;

const FALLBACK_IMAGES: Record<number, string> = {
  1: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&w=800&q=80",
  2: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?auto=format&w=800&q=80",
  3: "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&w=800&q=80",
  4: "https://images.unsplash.com/photo-1549060279-7e168fcee0c2?auto=format&w=800&q=80",
};

const TYPE_CONFIG: Record<number, { accent: string; label: string }> = {
  1: { accent: "#f59e0b", label: "Napi" },
  2: { accent: "#10b981", label: "Havi" },
  3: { accent: "#6366f1", label: "Éves" },
  4: { accent: "#7c3aed", label: "Szezonális" },
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

function TicketCard({ item, inCart, onAdd, onRemove, adding, isDark, t }: any) {
  const cfg = TYPE_CONFIG[item.type_id] ?? {
    accent: "#7c3aed",
    label: "Pass",
  };
  const imageUri =
    resolveImageUrl(item.imagePath) ||
    FALLBACK_IMAGES[item.type_id] ||
    FALLBACK_IMAGES[1];
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View
      style={{
        transform: [{ scale }],
        marginBottom: 16,
        borderRadius: 24,
        overflow: "hidden",
        height: CARD_HEIGHT,
        shadowColor: cfg.accent,
        shadowOffset: { width: 0, height: inCart ? 10 : 5 },
        shadowOpacity: inCart ? 0.5 : 0.2,
        shadowRadius: 20,
        elevation: inCart ? 12 : 6,
        borderWidth: inCart ? 2 : 0,
        borderColor: inCart ? cfg.accent : "transparent",
      }}
    >
      <Image
        source={{ uri: imageUri }}
        style={{ position: "absolute", width: "100%", height: "100%" }}
        resizeMode="cover"
      />
      <View
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
        }}
      />
      <View
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: cfg.accent,
          opacity: inCart ? 0.1 : 0.04,
        }}
      />

      {/* Type + duration badges */}
      <View
        style={{
          position: "absolute",
          top: 14,
          left: 14,
          flexDirection: "row",
          gap: 8,
        }}
      >
        <View
          style={{
            backgroundColor: cfg.accent + "dd",
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 10,
              fontWeight: "800",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {cfg.label}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            borderRadius: 20,
            paddingHorizontal: 10,
            paddingVertical: 4,
            borderWidth: 1,
            borderColor: "rgba(255,255,255,0.18)",
          }}
        >
          <Text
            style={{
              color: "rgba(255,255,255,0.9)",
              fontSize: 11,
              fontWeight: "600",
            }}
          >
            ⏱ {item.validityDays} {t("purchase.days")}
          </Text>
        </View>
      </View>

      {/* Bottom panel */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          backgroundColor: isDark ? "rgba(9,9,11,0.82)" : "rgba(15,15,18,0.80)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.09)",
          paddingHorizontal: 18,
          paddingVertical: 14,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <View style={{ flex: 1, marginRight: 12 }}>
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "800",
              letterSpacing: -0.3,
            }}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.description ? (
            <Text
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: 11,
                marginTop: 1,
              }}
              numberOfLines={3}
            >
              {item.description}
            </Text>
          ) : null}
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              gap: 3,
              marginTop: 4,
            }}
          >
            <Text
              style={{ color: cfg.accent, fontSize: 20, fontWeight: "900" }}
            >
              {item.price.toLocaleString()}
            </Text>
            <Text style={{ color: "rgba(255,255,255,0.45)", fontSize: 12 }}>
              Ft
            </Text>
          </View>
        </View>

        {inCart ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
            <View
              style={{
                backgroundColor: "rgba(74,222,128,0.18)",
                borderRadius: 14,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderWidth: 1,
                borderColor: "rgba(74,222,128,0.4)",
              }}
            >
              <Text
                style={{ color: "#4ade80", fontSize: 12, fontWeight: "700" }}
              >
                ✓ {t("purchase.added")}
              </Text>
            </View>
            <TouchableOpacity
              onPress={onRemove}
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
              <Text
                style={{ color: "#f87171", fontSize: 14, fontWeight: "700" }}
              >
                ✕
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            onPress={onAdd}
            disabled={adding}
            activeOpacity={0.85}
            style={[
              {
                borderRadius: 14,
                paddingHorizontal: 18,
                paddingVertical: 10,
                backgroundColor: cfg.accent,
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

function CartBar({ cart, t }: any) {
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
          <Text
            style={{
              fontSize: 10,
              color: "rgba(255,255,255,0.55)",
              fontWeight: "600",
              letterSpacing: 1,
              textTransform: "uppercase",
            }}
          >
            {t("purchase.cartTotal")}
          </Text>
          <Text style={{ fontSize: 22, fontWeight: "900", color: "#fff" }}>
            {total.toLocaleString()} Ft
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.push("/purchase-finalization")}
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
            <Text style={{ color: "#7c3aed", fontSize: 11, fontWeight: "900" }}>
              {cart.length}
            </Text>
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
      setAdding((p) => ({ ...p, [item.id]: true }));
      try {
        const res = await authFetch(ENDPOINTS.cartAdd, {
          method: "POST",
          body: JSON.stringify({ item_id: item.id, quantity: 1 }),
        });
        if (res.ok)
          addItem({
            itemId: item.id,
            name: item.name,
            price: item.price,
            validityDays: item.validityDays,
            typeName: item.typeName,
            type_id: item.type_id,
            quantity: 1,
          });
      } catch {
      } finally {
        setAdding((p) => ({ ...p, [item.id]: false }));
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
          const sc = await cartRes.json();
          const si = sc.items?.find((i: any) => i.item_id === item.id);
          if (si)
            await authFetch(ENDPOINTS.cartItem(si.id), { method: "DELETE" });
        }
      } catch {
        addItem(cartItem);
      }
    },
    [cart, removeItem, addItem],
  );

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
      <LinearGradient
        colors={["rgba(124,58,237,0.28)", "rgba(124,58,237,0)"]}
        style={{ position: "absolute", left: 0, right: 0, top: 0, height: 220 }}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 4 }}>
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
        <Text
          style={{
            fontSize: 13,
            marginTop: 2,
            color: isDark ? "#a1a1aa" : "#52525b",
          }}
        >
          {t("purchase.subtitle")}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator color="#7c3aed" style={{ flex: 1 }} />
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingTop: 16,
            paddingBottom:
              cart.length > 0
                ? Platform.OS === "android"
                  ? 200
                  : 90
                : Platform.OS === "android"
                  ? 160
                  : 10,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Tickets */}
          <View style={{ paddingHorizontal: 20 }}>
            {items.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Text
                  style={{
                    fontSize: 15,
                    color: isDark ? "#a1a1aa" : "#52525b",
                  }}
                >
                  {t("purchase.noResults")}
                </Text>
              </View>
            ) : (
              items.map((item) => (
                <TicketCard
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
          </View>
        </ScrollView>
      )}

      <CartBar cart={cart} isDark={isDark} t={t} />
    </View>
  );
}
