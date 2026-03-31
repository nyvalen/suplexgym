import { useCallback, useEffect, useState } from "react";
import {
  ImageSourcePropType,
  ListRenderItemInfo,
  View,
  Image,
  Text,
  TouchableOpacity,
  FlatList,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_endpoints } from "@/app/config/api";

interface TicketsListScreenItem {
  id: number;
  items: ItemsListScreenItem[];
}

interface ItemsListScreenItem {
  itemName: string;
  qrCodeBase64: string;
  activatedAt: string;
  expiresAt: string;
}

async function fetchTickets(): Promise<TicketsListScreenItem[]> {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    const res = await fetch(api_endpoints.orders, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed fetch");
    return (await res.json()) as TicketsListScreenItem[];
  } catch (err) {
    console.error("Error fetching news:", err);
    return [];
  }
}

export default function TicketsListScreen() {
  const [tickets, setTickets] = useState<TicketsListScreenItem[]>([]);
  const [items, setItems] = useState<ItemsListScreenItem[]>([]);

  useEffect(() => {
    let active = true;
    fetchTickets().then((items) => {
      if (active) setTickets(items);
    });
    return () => {
      active = false;
    };
  }, []);

  const navigation = useNavigation();
  console.log(tickets);
  console.log(items);
  return (
    <View className="flex-1">
      {tickets.map(({ id, items }) =>
        items.map((item, index) => {
          return (
            <TouchableOpacity
              key={`${id}-${index}`}
              className="flex-1 flex-row mt-4 h-24 self-center"
              onPress={() =>
                navigation.navigate("TicketsDetail", { article: item })
              }
            >
              <View className="bg-gray-200 rounded-l-lg elevation border-r-2 border-dashed h-24">
                <View>
                  <Text className="text-2xl m-1">{item.itemName}</Text>
                  <Text className="text-lg ml-1">
                    {new Date(item.expiresAt).toLocaleString()}
                  </Text>
                </View>
              </View>
              <View className="bg-teal-300 items-center rounded-r-lg justify-center h-24">
                <View className="-rotate-90 items-center">
                  <Text className="mt-1">Jegyszám:</Text>
                  <Text className="mt-1">{id}</Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        }),
      )}
    </View>
  );
}
