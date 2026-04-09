import { NativeTabs, Label, Icon } from "expo-router/unstable-native-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import React, { useState } from "react";
import { TabBarContext } from "../context/tab-bar-context";
import { House } from "lucide-react-native";

export default function TabLayout() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);

  return (
    <TabBarContext value={{ setIsTabBarHidden }}>
      <NativeTabs hidden={isTabBarHidden}>
        <NativeTabs.Trigger name="main">
          <Icon
            sf={{ default: "house", selected: "house.fill" }}
            androidSrc={require("./house.svg")}
          />
          <Label>Főoldal</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="news/index">
          <Icon
            sf={{ default: "newspaper", selected: "newspaper.fill" }}
            drawable="custom_newspaper_drawable"
          />
          <Label>Hírek</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="tickets/index">
          <Icon
            sf={{ default: "wallet.pass", selected: "wallet.pass.fill" }}
            drawable="custom_ticket_drawable"
          />
          <Label>Jegyek</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="purchase">
          <Icon
            sf={{ default: "cart", selected: "cart.fill" }}
            drawable="custom_cart_drawable"
          />
          <Label>Vásárlás</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Icon
            sf={{ default: "newspaper", selected: "newspaper.fill" }}
            drawable="custom_newspaper_drawable"
          />
          <Label>Profil</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabBarContext>
  );
}
