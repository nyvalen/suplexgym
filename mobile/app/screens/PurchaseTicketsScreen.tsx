import { cn } from "@/app/theme/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import type { TriggerRef } from "@rn-primitives/select";
import * as React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Button } from "@react-navigation/elements";
import { Text } from "@/app/components/ui/text";
import { Input } from "@/app/components/ui/input";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api_endpoints } from "../config/api";
import { useEffect, useState } from "react";

interface ItemsListScreenItem {
  id: number;
  name: string;
  description: string;
  imagePath: string;
  price: number;
  validityDays: number;
  typeName: string;
}

async function fetchTickets(): Promise<ItemsListScreenItem[]> {
  try {
    const token = await AsyncStorage.getItem("accessToken");
    const res = await fetch(api_endpoints.items, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });
    if (!res.ok) throw new Error("Failed fetch");
    return (await res.json()) as ItemsListScreenItem[];
  } catch (err) {
    console.error("Error fetching items:", err);
    return [];
  }
}

export default function PurchaseTickets() {
  const [items, setItems] = useState<ItemsListScreenItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const ref = React.useRef<TriggerRef>(null);

  const navigation = useNavigation();

  // Filter items by search query
  const filteredItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.typeName.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Group filtered items by typeName
  const groupedByType = filteredItems.reduce(
    (acc, item) => {
      if (!acc[item.typeName]) {
        acc[item.typeName] = [];
      }
      acc[item.typeName].push(item);
      return acc;
    },
    {} as Record<string, ItemsListScreenItem[]>,
  );

  const insets = useSafeAreaInsets();
  const contentInsets = {
    top: insets.top,
    bottom: Platform.select({
      ios: insets.bottom,
      android: insets.bottom + 24,
    }),
    left: 12,
    right: 12,
  };

  // Workaround for rn-primitives/select not opening on web-mobile
  function onTouchStart() {
    ref.current?.open();
  }

  const [selectedType, setSelectedType] = React.useState<string | null>(null);
  console.log(items);
  useEffect(() => {
    let active = true;
    fetchTickets().then((items) => {
      if (active) setItems(items);
    });
    return () => {
      active = false;
    };
  }, []);
  return (
    <>
      <View className="gap-4 p-4">
        <Input
          placeholder="Search products..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          className="w-full"
        />
        <View className="h-96">
          <Select>
            <SelectTrigger
              ref={ref}
              className="w-[180px]"
              onTouchStart={Platform.select({ web: onTouchStart })}
            >
              <SelectValue placeholder="Jegy fajtája" />
            </SelectTrigger>
            <SelectContent insets={contentInsets} className="w-[180px]">
              <NativeSelectScrollView>
                {Object.entries(groupedByType).map(([typeName, typeItems]) => (
                  <SelectGroup key={typeName}>
                    <SelectLabel>{typeName}</SelectLabel>
                    {typeItems.map((item) => (
                      <SelectItem
                        key={item.id}
                        label={`${item.name} (${item.price}Ft)`}
                        value={item.id.toString()}
                        onPress={() => setSelectedType(item.typeName)}
                      >
                        {item.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </NativeSelectScrollView>
            </SelectContent>
          </Select>
        </View>
        <Button
          className="w-full"
          onPressIn={() => {
            navigation.navigate("PurchaseFinalization", { type: selectedType });
          }}
        >
          <Text>Folytat</Text>
        </Button>
        <Button
          className="w-full"
          onPressIn={() => {
            navigation.navigate("PurchaseFinalization", {
              type: "Összes opció",
            });
          }}
        >
          <Text>Összes opció</Text>
        </Button>
      </View>
    </>
  );
}

/**
 * @platform Native only
 * Returns the children on the web
 */
function NativeSelectScrollView({
  className,
  ...props
}: React.ComponentProps<typeof ScrollView>) {
  if (Platform.OS === "web") {
    return <>{props.children}</>;
  }
  return <ScrollView className={cn("max-h-52", className)} {...props} />;
}
