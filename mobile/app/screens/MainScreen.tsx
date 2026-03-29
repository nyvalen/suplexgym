import { View, Text } from "react-native";
import { Button } from "@react-navigation/elements";
import TicketsListScreen from "./TicketsListScreen";
import NewsListScreen from "./NewsListScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

export default function MainScreen() {
  const [userRole, setUserRole] = useState("");

  function decodeToken(token: string) {
    const payload = token.split(".")[1];
    const decoded = atob(payload);
    return JSON.parse(decoded);
  }

  useEffect(() => {
    const loadToken = async () => {
      const token = await AsyncStorage.getItem("accessToken");

      if (token) {
        const data = decodeToken(token);
        setUserRole(data.role);
      }
    };

    loadToken();
  }, []);

  return (
    <View className="flex-1 flex-row items-center justify-center">
      <Text>Home Screen {userRole}</Text>

      <Button screen="Settings">Go to Settings</Button>
    </View>
  );
}
