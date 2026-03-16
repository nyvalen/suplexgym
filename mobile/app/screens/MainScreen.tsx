import { View, Text } from "react-native";
import { useRestApi } from "../hooks/useRestApi";
import { UsersDTO } from "../types";
import GreetingUser from "../components/User/GreetingUser";
import TicketsListScreen from "./TicketsListScreen";
import NewsListScreen from "./NewsListScreen";

export default function MainScreen() {
  return (
    <View className="">
      <Text>Hello</Text>
    </View>
  );
}
