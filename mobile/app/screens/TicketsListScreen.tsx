import React, { useEffect, useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, ScrollView,
  StatusBar, ActivityIndicator, Animated,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { authFetch } from "../utils/auth";
import { api_endpoints } from "../config/api";
import { useTheme, tokens } from "../theme/ThemeContext";

interface PurchaseItem { itemName: string; qrCodeBase64: string; activatedAt: string; expiresAt: string; }
interface Order { id: number; items: PurchaseItem[]; }

function isExpired(e: string) { return new Date(e) < new Date(); }
function daysLeft(e: string) { return Math.max(0, Math.ceil((new Date(e).getTime() - Date.now()) / 86400000)); }
function fmtDate(iso: string) { return new Date(iso).toLocaleDateString("hu-HU", { year: "numeric", month: "short", day: "numeric" }); }

function TicketCard({ item, orderId, onPress, t, isDark }: any) {
  const scale = useRef(new Animated.Value(1)).current;
  const expired = isExpired(item.expiresAt);
  const days = daysLeft(item.expiresAt);
  const statusColor = expired ? t.danger : days <= 3 ? "#f97316" : days <= 7 ? t.warning : t.success;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.97, duration: 80, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
    onPress();
  };

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.95}
        style={[{
          backgroundColor: t.surface, borderRadius: 18,
          borderWidth: 1, borderColor: t.border,
          flexDirection: "row", overflow: "hidden", minHeight: 116,
        }, expired && { opacity: 0.6 }]}
      >
        {/* Left accent stub */}
        <View style={{ width: 56, backgroundColor: t.surfaceHigh, alignItems: "center", justifyContent: "center", gap: 6, paddingVertical: 14 }}>
          <View style={{ position: "absolute", top: -10, width: 20, height: 20, borderRadius: 10, backgroundColor: t.bg }} />
          <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: statusColor }} />
          <Text style={{ fontSize: 11, fontWeight: "800", color: t.textMuted, transform: [{ rotate: "-90deg" }], letterSpacing: 0.5 }}>
            #{orderId}
          </Text>
          <Text style={{ fontSize: 8, fontWeight: "700", color: statusColor, letterSpacing: 0.5 }}>
            {expired ? "LEJÁRT" : "AKTÍV"}
          </Text>
        </View>

        {/* Perforations */}
        <View style={{ width: 12, justifyContent: "space-evenly", alignItems: "center", paddingVertical: 8 }}>
          {Array.from({ length: 9 }).map((_, i) => (
            <View key={i} style={{
              width: 5, height: 5, borderRadius: 2.5,
              backgroundColor: t.bg, borderWidth: 1, borderColor: t.border,
            }} />
          ))}
        </View>

        {/* Body */}
        <View style={{ flex: 1, padding: 14, justifyContent: "space-between" }}>
          <Text style={{ fontSize: 16, fontWeight: "800", color: t.text, letterSpacing: -0.3 }} numberOfLines={1}>
            {item.itemName}
          </Text>

          <View style={{ flexDirection: "row", gap: 20, marginTop: 8 }}>
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 10, color: t.textMuted, fontWeight: "600", letterSpacing: 0.5 }}>AKTIVÁLVA</Text>
              <Text style={{ fontSize: 12, color: t.textSub, fontWeight: "600" }}>{fmtDate(item.activatedAt)}</Text>
            </View>
            <View style={{ gap: 2 }}>
              <Text style={{ fontSize: 10, color: t.textMuted, fontWeight: "600", letterSpacing: 0.5 }}>LEJÁRAT</Text>
              <Text style={{ fontSize: 12, fontWeight: "600", color: statusColor }}>{fmtDate(item.expiresAt)}</Text>
            </View>
          </View>

          {/* Status pill */}
          <View style={{
            flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start",
            paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, marginTop: 8,
            backgroundColor: statusColor + "18", borderWidth: 1, borderColor: statusColor + "40",
          }}>
            <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: statusColor }} />
            <Text style={{ fontSize: 11, fontWeight: "700", color: statusColor }}>
              {expired ? "Lejárt" : `${days} nap van hátra`}
            </Text>
          </View>
        </View>

        {/* QR hint */}
        <View style={{ width: 44, alignItems: "center", justifyContent: "center", borderLeftWidth: 1, borderLeftColor: t.border }}>
          <Text style={{ fontSize: 22, color: t.textMuted }}>▦</Text>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function TicketsListScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();
  const { isDark } = useTheme();
  const t = isDark ? tokens.dark : tokens.light;

  useEffect(() => {
    authFetch(api_endpoints.orders).then(r => r.ok ? r.json() : []).then(setOrders).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const allItems = orders.flatMap(o => o.items.map(item => ({ item, orderId: o.id })));
  const active = allItems.filter(x => !isExpired(x.item.expiresAt));
  const expired = allItems.filter(x => isExpired(x.item.expiresAt));

  return (
    <View style={{ flex: 1, backgroundColor: t.bg }}>
      <StatusBar barStyle={isDark ? "light-content" : "dark-content"} backgroundColor={t.bg} />

      <View style={{ paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 }}>
        <Text style={{ fontSize: 30, fontWeight: "800", color: t.text, letterSpacing: -0.5 }}>Jegyeim</Text>
        <View style={{ flexDirection: "row", gap: 12, marginTop: 6 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.success }} />
            <Text style={{ fontSize: 13, color: t.textSub }}>{active.length} aktív</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: t.danger }} />
            <Text style={{ fontSize: 13, color: t.textSub }}>{expired.length} lejárt</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <ActivityIndicator color={t.primary} style={{ flex: 1 }} />
      ) : allItems.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", gap: 14 }}>
          <Text style={{ fontSize: 52 }}>🎫</Text>
          <Text style={{ fontSize: 20, fontWeight: "700", color: t.text }}>Nincs még jegyed</Text>
          <Text style={{ fontSize: 13, color: t.textSub, textAlign: "center", paddingHorizontal: 40 }}>
            Vásárolj bérletet vagy belépőt a Vásárlás fülön
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40, gap: 10 }} showsVerticalScrollIndicator={false}>
          {active.length > 0 && (
            <>
              <Text style={{ fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 4 }}>
                Aktív jegyek
              </Text>
              {active.map(({ item, orderId }, idx) => (
                <TicketCard key={`a-${orderId}-${idx}`} item={item} orderId={orderId} t={t} isDark={isDark}
                  onPress={() => navigation.navigate("TicketsDetail" as never, { article: item } as never)}
                />
              ))}
            </>
          )}
          {expired.length > 0 && (
            <>
              <Text style={{ fontSize: 11, fontWeight: "700", color: t.textMuted, letterSpacing: 1.5, textTransform: "uppercase", marginTop: 16, marginBottom: 4 }}>
                Lejárt
              </Text>
              {expired.map(({ item, orderId }, idx) => (
                <TicketCard key={`e-${orderId}-${idx}`} item={item} orderId={orderId} t={t} isDark={isDark}
                  onPress={() => navigation.navigate("TicketsDetail" as never, { article: item } as never)}
                />
              ))}
            </>
          )}
        </ScrollView>
      )}
    </View>
  );
}
