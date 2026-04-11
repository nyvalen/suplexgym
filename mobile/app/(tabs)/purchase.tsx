import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Animated,
  StatusBar,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { authFetch, ENDPOINTS } from "../utils/auth";
import { useTheme } from "../theme/ThemeContext";
import { useLanguage } from "../i18n/LanguageContext";
import { useCartStore } from "../store";
import { router } from "expo-router";

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
const CATEGORY_COLORS: Record<Category, string> = {
  all: "#6366f1",
  daily: "#f59e0b",
  monthly: "#10b981",
  yearly: "#7c3aed",
};

function CategoryChip({ cat, active, onPress, isDark, label }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const color = CATEGORY_COLORS[cat as Category];

  const press = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: 0.9,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity
        onPress={press}
        activeOpacity={0.85}
        className="px-4 py-[9px] rounded-[22px] border-2"
        style={{
          backgroundColor: active
            ? color
            : isDark
              ? "rgba(255,255,255,0.05)"
              : "rgba(0,0,0,0.03)",
          borderColor: active
            ? color
            : isDark
              ? "rgba(255,255,255,0.1)"
              : "rgba(0,0,0,0.08)",
        }}
      >
        <Text
          numberOfLines={1}
          className="text-[13px] font-normal h-4"
          style={{ color: active ? "#fff" : isDark ? "#a1a1aa" : "#52525b" }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TicketCard({
  item,
  qty,
  onAdd,
  onDecrement,
  onRemove,
  adding,
  isDark,
  t,
}: any) {
  const cat: Category = TYPE_MAP[item.type_id] ?? "all";
  const color = CATEGORY_COLORS[cat];

  return (
    <View
      className="rounded-[20px] border flex-row overflow-hidden"
      style={{
        backgroundColor: isDark
          ? "rgba(255,255,255,0.05)"
          : "rgba(255,255,255,0.9)",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
      }}
    >
      <View className="w-1" style={{ backgroundColor: color }} />
      <View className="flex-1 p-4 gap-1.5">
        <View className="flex-row justify-between items-center">
          <View
            className="px-2 py-1 rounded-lg border"
            style={{ backgroundColor: color + "22", borderColor: color + "44" }}
          >
            <Text
              className="text-[10px] font-extrabold tracking-[0.5px]"
              style={{ color }}
            >
              {item.typeName?.toUpperCase() ?? cat.toUpperCase()}
            </Text>
          </View>
          <Text
            className={`text-[17px] font-extrabold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
          >
            {item.price.toLocaleString()} Ft
          </Text>
        </View>

        <Text
          className={`text-base font-bold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
        >
          {item.name}
        </Text>
        <Text
          className={`text-[13px] leading-[18px] ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
          numberOfLines={2}
        >
          {item.description ||
            `${t("purchase.validFor")} ${item.validityDays} ${t("purchase.days")}`}
        </Text>

        <View className="flex-row justify-between items-center mt-1">
          <Text
            className={`text-xs ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
          >
            ⏱ {item.validityDays} {t("purchase.days")}
          </Text>

          {qty > 0 ? (
            /* ── In-cart controls: remove / count / add ── */
            <View className="flex-row items-center gap-2">
              <TouchableOpacity
                onPress={qty === 1 ? onRemove : onDecrement}
                activeOpacity={0.8}
                className="w-[36px] h-[36px] rounded-[11px] items-center justify-center border"
                style={{
                  borderColor:
                    qty === 1
                      ? isDark
                        ? "rgba(248,113,113,0.4)"
                        : "rgba(220,38,38,0.3)"
                      : isDark
                        ? "rgba(255,255,255,0.15)"
                        : "rgba(0,0,0,0.12)",
                  backgroundColor:
                    qty === 1
                      ? isDark
                        ? "rgba(248,113,113,0.1)"
                        : "rgba(220,38,38,0.06)"
                      : isDark
                        ? "rgba(255,255,255,0.07)"
                        : "rgba(0,0,0,0.04)",
                }}
              >
                <Text
                  className="text-[18px] font-bold leading-5"
                  style={{
                    color:
                      qty === 1
                        ? isDark
                          ? "#f87171"
                          : "#dc2626"
                        : isDark
                          ? "#a1a1aa"
                          : "#52525b",
                  }}
                >
                  {qty === 1 ? "✕" : "−"}
                </Text>
              </TouchableOpacity>

              <View
                className="w-[32px] h-[32px] rounded-[10px] items-center justify-center border"
                style={{
                  borderColor: color + "55",
                  backgroundColor: color + "18",
                }}
              >
                <Text className="text-[14px] font-extrabold" style={{ color }}>
                  {qty}
                </Text>
              </View>

              <TouchableOpacity
                onPress={onAdd}
                disabled={adding}
                activeOpacity={0.85}
                className="w-[36px] h-[36px] rounded-[11px] items-center justify-center"
                style={[{ backgroundColor: color }, adding && { opacity: 0.6 }]}
              >
                {adding ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="text-white text-[22px] font-light leading-6">
                    +
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          ) : (
            /* ── Not in cart — single add button ── */
            <TouchableOpacity
              onPress={onAdd}
              disabled={adding}
              activeOpacity={0.85}
              className="w-[42px] h-[42px] rounded-[13px] items-center justify-center"
              style={[{ backgroundColor: color }, adding && { opacity: 0.6 }]}
            >
              {adding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text className="text-white text-[24px] font-light leading-7">
                  +
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

function CartBar({ cart, onCheckout, isDark, t }: any) {
  const translateY = useRef(new Animated.Value(100)).current;
  const total = cart.reduce((s: number, i: any) => s + i.price * i.quantity, 0);
  const count = cart.reduce((s: number, i: any) => s + i.quantity, 0);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: cart.length > 0 ? 0 : 250,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [cart.length]);

  return (
    <Animated.View
      className="absolute ios:bottom-24 android:bottom-32 left-5 right-5 bg-[#7c3aed] rounded-[22px] flex-row items-center justify-between py-[18px] px-[22px]"
      style={{
        shadowColor: "#7c3aed",
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.5,
        shadowRadius: 24,
        elevation: 16,
        transform: [{ translateY }],
      }}
      pointerEvents={cart.length > 0 ? "auto" : "none"}
    >
      <View>
        <Text className="text-[11px] text-white/60 font-semibold tracking-[1px]">
          {t("purchase.cartTotal")}
        </Text>
        <Text className="text-[21px] font-extrabold text-white">
          {total.toLocaleString()} Ft
        </Text>
      </View>
      <TouchableOpacity
        onPress={onCheckout}
        className="bg-white/20 rounded-xl px-[18px] py-3 flex-row items-center gap-2 border border-white/25"
        activeOpacity={0.85}
      >
        <View className="bg-white w-6 h-6 rounded-full items-center justify-center">
          <Text className="text-[#7c3aed] text-xs font-extrabold">{count}</Text>
        </View>
        <Text className="text-white text-[15px] font-bold">
          {t("purchase.checkout")}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PurchaseTicketsScreen() {
  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [adding, setAdding] = useState<Record<number, boolean>>({});

  const { isDark } = useTheme();
  const { t } = useLanguage();

  const cart = useCartStore((s) => s.cart);
  const addItem = useCartStore((s) => s.addItem);
  const decrementItem = useCartStore((s) => s.decrementItem);
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

  // Add one to server cart + Zustand
  const addToCart = useCallback(
    async (item: TicketItem) => {
      if (adding[item.id]) return;
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
    [adding, addItem],
  );

  // Decrement by 1 (optimistic, then sync)
  const decrementFromCart = useCallback(
    async (item: TicketItem) => {
      const cartItem = cart.find((c) => c.itemId === item.id);
      if (!cartItem || cartItem.quantity <= 1) return;
      decrementItem(item.id);
      try {
        const cartRes = await authFetch(ENDPOINTS.cart);
        if (cartRes.ok) {
          const serverCart = await cartRes.json();
          const serverItem = serverCart.items?.find(
            (i: any) => i.item_id === item.id,
          );
          if (serverItem) {
            await authFetch(ENDPOINTS.cartItem(serverItem.id), {
              method: "PUT",
              body: JSON.stringify({ quantity: cartItem.quantity - 1 }),
            });
          }
        }
      } catch {
        addItem({ ...cartItem, quantity: 1 });
      }
    },
    [cart, decrementItem, addItem],
  );

  // Remove entirely (optimistic, then sync)
  const removeFromCart = useCallback(
    async (item: TicketItem) => {
      const cartItem = cart.find((c) => c.itemId === item.id);
      if (!cartItem) return;
      removeItem(item.id);
      try {
        const cartRes = await authFetch(ENDPOINTS.cart);
        if (cartRes.ok) {
          const serverCart = await cartRes.json();
          const serverItem = serverCart.items?.find(
            (i: any) => i.item_id === item.id,
          );
          if (serverItem) {
            await authFetch(ENDPOINTS.cartItem(serverItem.id), {
              method: "DELETE",
            });
          }
        }
      } catch {
        addItem(cartItem);
      }
    },
    [cart, removeItem, addItem],
  );

  const filtered = items.filter((item) => {
    const catMatch = category === "all" || TYPE_MAP[item.type_id] === category;
    const q = search.toLowerCase();
    return (
      catMatch &&
      (!q ||
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q))
    );
  });

  return (
    <View className={`flex-1 ${isDark ? "bg-[#09090b]" : "bg-[#fafafa]"}`}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      <View
        pointerEvents="none"
        className="absolute -top-10 -right-10 w-[220px] h-[220px] rounded-full"
        style={{
          backgroundColor: isDark
            ? "rgba(124,58,237,0.12)"
            : "rgba(124,58,237,0.06)",
        }}
      />

      <View className="px-5 pt-16 pb-3">
        <Text
          className={`text-[30px] font-extrabold tracking-[-0.5px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
        >
          {t("purchase.title")}
        </Text>
        <Text
          className={`text-sm mt-0.5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
        >
          {t("purchase.subtitle")}
        </Text>
      </View>

      {/* Search */}
      <View className="px-5 pb-3">
        <View
          className="rounded-2xl px-4 py-3.5 flex-row items-center gap-2.5 border"
          style={{
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(255,255,255,0.9)",
            borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
          }}
        >
          <TextInput
            className={`flex-1 text-[15px] ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
            placeholder={t("purchase.searchPlaceholder")}
            placeholderTextColor={isDark ? "#71717a" : "#a1a1aa"}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        className="flex-grow-0 mb-3.5"
        contentContainerStyle={{
          paddingHorizontal: 20,
          gap: 8,
          flexDirection: "row",
          paddingRight: 20,
        }}
      >
        {(["all", "daily", "monthly", "yearly"] as Category[]).map((cat) => (
          <CategoryChip
            key={cat}
            cat={cat}
            active={category === cat}
            isDark={isDark}
            label={CATEGORY_LABELS[cat]}
            onPress={() => setCategory(cat)}
          />
        ))}
      </ScrollView>

      {loading ? (
        <ActivityIndicator color="#7c3aed" className="flex-1" />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(i) => String(i.id)}
          renderItem={({ item }) => {
            const qty = cart.find((c) => c.itemId === item.id)?.quantity ?? 0;
            return (
              <TicketCard
                item={item}
                qty={qty}
                adding={!!adding[item.id]}
                isDark={isDark}
                t={t}
                onAdd={() => addToCart(item)}
                onDecrement={() => decrementFromCart(item)}
                onRemove={() => removeFromCart(item)}
              />
            );
          }}
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: 130,
            gap: 12,
          }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text
              className={`text-center mt-[60px] text-[15px] ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
            >
              {t("purchase.noResults")}
            </Text>
          }
        />
      )}

      <CartBar
        cart={cart}
        isDark={isDark}
        t={t}
        onCheckout={() =>
          cart.length > 0 && router.push("/purchase-finalization")
        }
      />
    </View>
  );
}
