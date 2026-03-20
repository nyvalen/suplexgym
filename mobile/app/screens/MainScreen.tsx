import { View, Text } from "react-native";
import { Button } from "@react-navigation/elements";
import { useRestApi } from "../hooks/useRestApi";
import { UsersDTO } from "../types";
import TicketsListScreen from "./TicketsListScreen";
import NewsListScreen from "./NewsListScreen";
export default function MainScreen() {
  return (
    <View className="flex-1 flex-row items-center justify-center">
      <Text>Home Screen</Text>
      <Text>Open up 'src/App.tsx' to start working on your app!</Text>
      <Button screen="SignIn" params={{ user: "jane" }}>
        Go to Profile
      </Button>
      <Button screen="Settings">Go to Settings</Button>
    </View>
  );
}
