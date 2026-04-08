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
import { useNavigation } from "@react-navigation/native";
import { authFetch, ENDPOINTS } from "../utils/auth";
import { useTheme, tokens } from "../theme/ThemeContext";

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
  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const textSub = isDark ? "#a1a1aa" : "#52525b";

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
        style={{
          paddingHorizontal: 16,
          paddingVertical: 9,
          borderRadius: 22,
          borderWidth: 1.5,
          backgroundColor: active ? color : surface,
          borderColor: active ? color : surfaceBorder,
        }}
      >
        {/* Fix: explicit minWidth prevents text from being clipped on "Összes" */}
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            fontWeight: "400",
            color: active ? "#fff" : textSub,
          }}
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
  const surface = isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.9)";
  const surfaceBorder = isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";
  const textMuted = isDark ? "#71717a" : "#a1a1aa";

  return (
    <View
      style={{
        backgroundColor: surface,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: surfaceBorder,
        flexDirection: "row",
        overflow: "hidden",
      }}
    >
      {/* Color accent strip */}
      <View style={{ width: 4, backgroundColor: color }} />
      <View style={{ flex: 1, padding: 16, gap: 6 }}>
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: color + "22",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: color + "44",
            }}
          >
            <Text
              style={{
                fontSize: 10,
                fontWeight: "800",
                color,
                letterSpacing: 0.5,
              }}
            >
              {CATEGORY_LABELS[cat].toUpperCase()}
            </Text>
          </View>
          <Text style={{ fontSize: 17, fontWeight: "800", color: textPrimary }}>
            {item.price.toLocaleString("hu-HU")} Ft
          </Text>
        </View>

        <Text style={{ fontSize: 16, fontWeight: "700", color: textPrimary }}>
          {item.name}
        </Text>
        <Text
          style={{ fontSize: 13, color: textSub, lineHeight: 18 }}
          numberOfLines={2}
        >
          {item.description || `Érvényes ${item.validityDays} napig`}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
            <Text style={{ fontSize: 12, color: textMuted }}>
              ⏱ {item.validityDays} nap
            </Text>
          </View>
          <TouchableOpacity
            onPress={onAdd}
            disabled={adding}
            activeOpacity={0.85}
            style={[
              {
                width: 42,
                height: 42,
                borderRadius: 13,
                backgroundColor: color,
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              },
              adding && { opacity: 0.6 },
            ]}
          >
            {qty > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: -7,
                  right: -7,
                  backgroundColor: "#ef4444",
                  width: 19,
                  height: 19,
                  borderRadius: 9.5,
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                }}
              >
                <Text
                  style={{ color: "#fff", fontSize: 10, fontWeight: "800" }}
                >
                  {qty}
                </Text>
              </View>
            )}
            {adding ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text
                style={{
                  color: "#fff",
                  fontSize: 24,
                  fontWeight: "300",
                  lineHeight: 28,
                }}
              >
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
      style={[
        {
          position: "absolute",
          bottom: 24,
          left: 20,
          right: 20,
          backgroundColor: "#7c3aed",
          borderRadius: 22,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingVertical: 18,
          paddingHorizontal: 22,
          shadowColor: "#7c3aed",
          shadowOffset: { width: 0, height: 12 },
          shadowOpacity: 0.5,
          shadowRadius: 24,
          elevation: 16,
        },
        { transform: [{ translateY }] },
      ]}
      pointerEvents={cart.length > 0 ? "auto" : "none"}
    >
      <View>
        <Text
          style={{
            fontSize: 11,
            color: "rgba(255,255,255,0.6)",
            fontWeight: "600",
            letterSpacing: 1,
          }}
        >
          KOSÁR ÖSSZESEN
        </Text>
        <Text style={{ fontSize: 21, fontWeight: "800", color: "#fff" }}>
          {total.toLocaleString("hu-HU")} Ft
        </Text>
      </View>
      <TouchableOpacity
        onPress={onCheckout}
        style={{
          backgroundColor: "rgba(255,255,255,0.18)",
          borderRadius: 14,
          paddingHorizontal: 18,
          paddingVertical: 12,
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
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#7c3aed", fontSize: 12, fontWeight: "800" }}>
            {count}
          </Text>
        </View>
        <Text style={{ color: "#fff", fontSize: 15, fontWeight: "700" }}>
          Fizetés →
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
  const [cart, setCart] = useState<CartItem[]>([]);
  const [adding, setAdding] = useState<Record<number, boolean>>({});
  const navigation = useNavigation();
  const { isDark } = useTheme();

  const bg = isDark ? "#09090b" : "#fafafa";
  const inputBg = isDark ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,0.9)";
  const inputBorder = isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)";
  const textPrimary = isDark ? "#fafafa" : "#09090b";
  const textSub = isDark ? "#a1a1aa" : "#52525b";
  const textMuted = isDark ? "#71717a" : "#a1a1aa";

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
    const srch =
      !q ||
      item.name.toLowerCase().includes(q) ||
      (item.description ?? "").toLowerCase().includes(q);
    return catMatch && srch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: bg }}>
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor="transparent"
        translucent
      />

      {/* Purple blob */}
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
            ? "rgba(124,58,237,0.12)"
            : "rgba(124,58,237,0.06)",
        }}
      />

      <View
        style={{ paddingHorizontal: 20, paddingTop: 64, paddingBottom: 12 }}
      >
        <Text
          style={{
            fontSize: 30,
            fontWeight: "800",
            color: textPrimary,
            letterSpacing: -0.5,
          }}
        >
          Jegyvásárlás
        </Text>
        <Text style={{ fontSize: 14, color: textSub, marginTop: 3 }}>
          Válassz bérletet vagy belépőt
        </Text>
      </View>

      {/* Search bar */}
      <View style={{ paddingHorizontal: 20, paddingBottom: 12 }}>
        <View
          style={{
            backgroundColor: inputBg,
            borderWidth: 1,
            borderColor: inputBorder,
            borderRadius: 16,
            paddingHorizontal: 16,
            paddingVertical: 13,
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          <TextInput
            style={{ flex: 1, color: textPrimary, fontSize: 15 }}
            placeholder="Keresés..."
            placeholderTextColor={textMuted}
            value={search}
            onChangeText={setSearch}
          />
        </View>
      </View>

      {/* Category chips — fixed with proper flex/shrink */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, marginBottom: 14 }}
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
        <ActivityIndicator color="#7c3aed" style={{ flex: 1 }} />
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
              style={{
                textAlign: "center",
                color: textSub,
                marginTop: 60,
                fontSize: 15,
              }}
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
          navigation.navigate(
            "PurchaseFinalization" as never,
            { cart } as never,
          )
        }
      />
    </View>
  );
}
