import { View, StyleSheet } from "react-native";
import { Loader } from "./components/Loader/Loader";
import NewsListScreen from "./screens/NewsListScreen";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./reactquery";
import LoaderBackground from "./components/Loader/LoaderBackground";
import TicketsListScreen from "./screens/TicketsListScreen";
import MainScreen from "./screens/MainScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import NewsDetailsScreen from "./screens/NewsDetailsScreen";
import TicketsDetailsScreen from "./screens/TicketDetailsScreen";
import PurchaseTicketsScreen from "./screens/PurchaseTicketsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PurchaseFinalizationScreen from "./screens/PurchaseFinalizationScreen";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function PurchaseStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="PurchaseTickets"
        component={PurchaseTicketsScreen}
        options={{ title: "Vásárlás" }}
      />
      <Stack.Screen
        name="PurchaseFinalization"
        component={PurchaseFinalizationScreen}
        options={{ title: "Véglegesítés" }}
      />
    </Stack.Navigator>
  );
}

function TicketsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="TicketsList"
        component={TicketsListScreen}
        options={{ title: "Jegyek" }}
      />
      <Stack.Screen
        name="TicketsDetail"
        component={TicketsDetailsScreen}
        options={{ title: "Részletek" }}
      />
    </Stack.Navigator>
  );
}

function NewsStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="NewsList"
        component={NewsListScreen}
        options={{ title: "Hírek" }}
      />
      <Stack.Screen
        name="NewsDetail"
        component={NewsDetailsScreen}
        options={{ title: "Részletek" }}
      />
    </Stack.Navigator>
  );
}

function Navigator() {
  return (
    <QueryClientProvider client={queryClient}>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarLabelPosition: "below-icon",
          tabBarActiveTintColor: "purple",
          tabBarStyle: { position: "relative" },
          tabBarBackground: () => (
            <BlurView
              tint="extraLight"
              intensity={100}
              style={StyleSheet.absoluteFill}
            />
          ),
        }}
      >
        <Tab.Screen
          name="MainTab"
          component={MainScreen}
          options={{
            tabBarLabel: "Főoldal",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="pokeball"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="PurchaseTab"
          component={PurchaseStack}
          options={{
            tabBarLabel: "Vásárlás",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="pokeball"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="TicketsTab"
          component={TicketsStack}
          options={{
            tabBarLabel: "Jegyek",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="pokeball"
                size={size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="NewsTab"
          component={NewsStack}
          options={{
            tabBarLabel: "Hírek",
            tabBarIcon: ({ color, size }) => (
              <MaterialCommunityIcons
                name="pokeball"
                size={size}
                color={color}
              />
            ),
          }}
        />
      </Tab.Navigator>
    </QueryClientProvider>
  );
}

export default function Index() {
  return (
    <QueryClientProvider client={queryClient}>
      <View className="flex-1 h-full justify-center">
        {/* <Loader /> */}
        <Navigator />
      </View>
    </QueryClientProvider>
  );
}
