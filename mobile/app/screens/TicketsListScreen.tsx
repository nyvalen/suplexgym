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
    const res = await fetch("http://192.168.0.209:5103/api/orders", {
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
              className="flex-1 flex-row mt-4 h-36"
              onPress={() =>
                navigation.navigate("TicketsDetail", { article: item })
              }
            >
              <View className="bg-gray-200 rounded-l-lg elevation w-72 border-r-2 border-dashed">
                <View className="border-t-2">
                  <Text className="text-2xl m-1">{item.itemName}</Text>
                  <Text className="text-lg ml-1">{item.expiresAt}</Text>
                </View>
              </View>
              <View className="bg-teal-300 items-center rounded-r-lg justify-center">
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
