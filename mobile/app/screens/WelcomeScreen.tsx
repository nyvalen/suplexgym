import { View, Text } from "react-native";
import { Button, Label } from "@react-navigation/elements";
import { useRestApi } from "../hooks/useRestApi";
import { UsersDTO } from "../types";
import TicketsListScreen from "./TicketsListScreen";
import NewsListScreen from "./NewsListScreen";
import { Separator } from "../components/ui/separator";
import { Input } from "../components/ui/input";
export default function MainScreen() {
  return (
    <View className="gap-6 flex-1 items-center justify-center ">
      <View className="gap-1.5">
        <View className="flex-row items-center">
          <Text>Welcome to Suplex Gym</Text>
        </View>
      </View>
      <Button className="w-3/4" screen="SignIn">
        <Text>Log In</Text>
      </Button>
      <View className="flex-row items-center">
        <Separator className="flex-1" />
        <Text className="text-muted-foreground px-4 text-sm">or</Text>
        <Separator className="flex-1" />
      </View>
      <Button className="w-3/4" screen="SignUp">
        <Text>Sign up</Text>
      </Button>
    </View>
  );
}
