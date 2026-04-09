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
import { useTheme, tokens } from "../theme/ThemeContext";
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
export interface CartItem {
  itemId: number;
  name: string;
  price: number;
  validityDays: number;
  typeName: string;
  type_id: number;
  quantity: number;
}

type Category = "all" | "daily" | "monthly" | "yearly";
const TYPE_MAP: Record<number, Category> = {
  1: "daily",
  2: "monthly",
  3: "yearly",
};
const CATEGORY_LABELS: Record<Category, string> = {
  all: "Összes",
  daily: "Napi",
  monthly: "Havi",
  yearly: "Éves",
};
const CATEGORY_COLORS: Record<Category, string> = {
  all: "#6366f1",
  daily: "#f59e0b",
  monthly: "#10b981",
  yearly: "#7c3aed",
};

function CategoryChip({ cat, active, onPress, isDark }: any) {
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
          className="text-[13px] font-normal"
          style={{ color: active ? "#fff" : isDark ? "#a1a1aa" : "#52525b" }}
        >
          {CATEGORY_LABELS[cat as Category]}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

function TicketCard({ item, qty, onAdd, adding, isDark }: any) {
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
      {/* Color accent strip */}
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
              {CATEGORY_LABELS[cat].toUpperCase()}
            </Text>
          </View>
          <Text
            className={`text-[17px] font-extrabold ${isDark ? "text-[#fafafa]" : "text-[#09090b]"}`}
          >
            {item.price.toLocaleString("hu-HU")} Ft
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
          {item.description || `Érvényes ${item.validityDays} napig`}
        </Text>

        <View className="flex-row justify-between items-center mt-1">
          <Text
            className={`text-xs ${isDark ? "text-[#71717a]" : "text-[#a1a1aa]"}`}
          >
            ⏱ {item.validityDays} nap
          </Text>
          <TouchableOpacity
            onPress={onAdd}
            disabled={adding}
            activeOpacity={0.85}
            className="w-[42px] h-[42px] rounded-[13px] items-center justify-center relative"
            style={[{ backgroundColor: color }, adding && { opacity: 0.6 }]}
          >
            {qty > 0 && (
              <View className="absolute -top-[7px] -right-[7px] bg-red-500 w-[19px] h-[19px] rounded-[9.5px] items-center justify-center z-10">
                <Text className="text-white text-[10px] font-extrabold">
                  {qty}
                </Text>
              </View>
            )}
            {adding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text className="text-white text-[24px] font-light leading-7">
                +
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function CartBar({ cart, onCheckout, isDark }: any) {
  const translateY = useRef(new Animated.Value(100)).current;
  const total = cart.reduce(
    (s: number, i: CartItem) => s + i.price * i.quantity,
    0,
  );
  const count = cart.reduce((s: number, i: CartItem) => s + i.quantity, 0);

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: cart.length > 0 ? 0 : 120,
      useNativeDriver: true,
      tension: 80,
      friction: 12,
    }).start();
  }, [cart.length]);

  return (
    <Animated.View
      className="absolute bottom-6 left-5 right-5 bg-[#7c3aed] rounded-[22px] flex-row items-center justify-between py-[18px] px-[22px]"
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
          KOSÁR ÖSSZESEN
        </Text>
        <Text className="text-[21px] font-extrabold text-white">
          {total.toLocaleString("hu-HU")} Ft
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
        <Text className="text-white text-[15px] font-bold">Fizetés →</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function PurchaseTicketsScreen() {
  const [items, setItems] = useState<TicketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("all");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [adding, setAdding] = useState<Record<number, boolean>>({});
  const { isDark } = useTheme();

  useEffect(() => {
    authFetch(ENDPOINTS.items)
      .then((r) => (r.ok ? r.json() : []))
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

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
          setCart((prev) => {
            const ex = prev.find((c) => c.itemId === item.id);
            if (ex)
              return prev.map((c) =>
                c.itemId === item.id ? { ...c, quantity: c.quantity + 1 } : c,
              );
            return [
              ...prev,
              {
                itemId: item.id,
                name: item.name,
                price: item.price,
                validityDays: item.validityDays,
                typeName: item.typeName,
                type_id: item.type_id,
                quantity: 1,
              },
            ];
          });
        }
      } catch {
      } finally {
        setAdding((prev) => ({ ...prev, [item.id]: false }));
      }
    },
    [adding],
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

      {/* Purple blob */}
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
          Jegyvásárlás
        </Text>
        <Text
          className={`text-sm mt-0.5 ${isDark ? "text-[#a1a1aa]" : "text-[#52525b]"}`}
        >
          Válassz bérletet vagy belépőt
        </Text>
      </View>

      {/* Search bar */}
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
            placeholder="Keresés..."
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
          renderItem={({ item }) => (
            <TicketCard
              item={item}
              qty={cart.find((c) => c.itemId === item.id)?.quantity ?? 0}
              adding={!!adding[item.id]}
              isDark={isDark}
              onAdd={() => addToCart(item)}
            />
          )}
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
              Nincs találat
            </Text>
          }
        />
      )}

      <CartBar
        cart={cart}
        isDark={isDark}
        onCheckout={() =>
          cart.length > 0 &&
          router.push({
            pathname: "/(tabs)/purchase-finalization",
            params: { cart: JSON.stringify(cart) },
          })
        }
      />
    </View>
  );
}
