import { NativeTabs, Label, Icon } from "expo-router/unstable-native-tabs";
import React, { useState } from "react";
import { TabBarContext } from "../context/tab-bar-context";
import { useLanguage } from "../i18n/LanguageContext";
import { DynamicColorIOS } from "react-native";

export default function TabLayout() {
  const [isTabBarHidden, setIsTabBarHidden] = useState(false);
  const { t } = useLanguage();

  return (
    <TabBarContext value={{ setIsTabBarHidden }}>
      <NativeTabs
        hidden={isTabBarHidden}
        labelStyle={{
          // For the text color
          color: DynamicColorIOS({
            dark: "rgba(124,58,237,0.8)",
            light: "rgba(124,58,237,1)",
          }),
        }}
        // For the selected icon color
        tintColor={DynamicColorIOS({
          dark: "#rgba(124,58,237,0.8)",
          light: "rgba(124,58,237,1)",
        })}
      >
        <NativeTabs.Trigger name="main">
          <Icon
            sf={{ default: "house", selected: "house.fill" }}
            androidSrc={require("./house.svg")}
          />
          <Label>{t("tabs.home")}</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="news-list">
          <Icon
            sf={{ default: "newspaper", selected: "newspaper.fill" }}
            drawable="custom_newspaper_drawable"
          />
          <Label>{t("tabs.news")}</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="tickets-list">
          <Icon
            sf={{ default: "wallet.pass", selected: "wallet.pass.fill" }}
            drawable="custom_ticket_drawable"
          />
          <Label>{t("tabs.tickets")}</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="purchase">
          <Icon
            sf={{ default: "cart", selected: "cart.fill" }}
            drawable="custom_cart_drawable"
          />
          <Label>{t("tabs.purchase")}</Label>
        </NativeTabs.Trigger>

        <NativeTabs.Trigger name="profile">
          <Icon
            sf={{ default: "person", selected: "person.fill" }}
            drawable="custom_person_drawable"
          />
          <Label>{t("tabs.profile")}</Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </TabBarContext>
  );
}
