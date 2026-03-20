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
import { useRestApi } from "../hooks/useRestApi";
import { ItemDTO, TicketsDTO } from "../types";

export default function PurchaseTickets() {
  const ref = React.useRef<TriggerRef>(null);

  const navigation = useNavigation();

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

  const [refreshing, setRefreshing] = React.useState(false);

  const { items, refetchItems } = useRestApi("/tickets");

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await refetchItems();
    setRefreshing(false);
  }, []);

  const [selectedType, setSelectedType] = React.useState<string | null>(null);

  const jegyek = [
    { label: "Napi", value: "1" },
    { label: "Havi", value: "2" },
    { label: "Éves", value: "3" },
  ];

  return (
    <>
      <View className="h-28">
        <Select>
          <SelectTrigger
            ref={ref}
            className="w-[180px]"
            onTouchStart={Platform.select({ web: onTouchStart })}
          >
            <SelectValue placeholder="Jegy ideje" />
          </SelectTrigger>
          <SelectContent insets={contentInsets} className="w-[180px]">
            <NativeSelectScrollView>
              <SelectGroup>
                <SelectLabel>Jegyek</SelectLabel>
                <SelectItem key="Napi" label="Napi" value="Napi">
                  Napijegy
                </SelectItem>
                <SelectLabel>Bérletek</SelectLabel>
                <SelectItem key="Havi" label="Havi" value="Havi">
                  Havi
                </SelectItem>
                <SelectItem key="Éves" label="Éves" value="Éves">
                  Éves
                </SelectItem>
              </SelectGroup>
            </NativeSelectScrollView>
          </SelectContent>
        </Select>
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
              <SelectGroup>
                <SelectLabel>Jegyek</SelectLabel>
                {jegyek.map((jegy) => (
                  <SelectItem
                    key={jegy.value}
                    label={jegy.label}
                    value={jegy.value}
                    onPress={() => setSelectedType(jegy.label)}
                  >
                    {jegy.label}
                  </SelectItem>
                ))}
              </SelectGroup>
            </NativeSelectScrollView>
          </SelectContent>
        </Select>
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
