import NewsListScreen from "./screens/NewsListScreen";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./reactquery";
import TicketsListScreen from "./screens/TicketsListScreen";
import MainScreen from "./screens/MainScreen";
import ProfileScreen from "./screens/ProfileScreen";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import NewsDetailsScreen from "./screens/NewsDetailsScreen";
import TicketsDetailsScreen from "./screens/TicketDetailsScreen";
import PurchaseTicketsScreen from "./screens/PurchaseTicketsScreen";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import PurchaseFinalizationScreen from "./screens/PurchaseFinalizationScreen";
import { PortalHost } from "@rn-primitives/portal";
import "./global.css";
import {
  NavigationIndependentTree,
  createStaticNavigation,
  StaticParamList,
  DarkTheme,
  DefaultTheme,
} from "@react-navigation/native";
import { NAV_THEME } from "./theme/theme";
import { View, Image } from "react-native";
import { Loader } from "./components/Loader/Loader";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SignInForm } from "./components/sign-in-form";
import { SignUpForm } from "./components/sign-up-form";
import {
  HeaderButton,
  Text,
  Assets as NavigationAssets,
} from "@react-navigation/elements";
import SignInScreen from "./screens/SignInScreen";

import { Asset } from "expo-asset";
import { createURL } from "expo-linking";
import * as React from "react";
import PurchaseTickets from "./screens/PurchaseTicketsScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WelcomeScreen from "./screens/WelcomeScreen";
import { UserMenu } from "./components/user-menu";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ThemeProvider } from "./theme/ThemeContext";
import SignUpScreen from "./screens/SignUpScreen";

Asset.loadAsync([...NavigationAssets]);

// SplashScreen.preventAutoHideAsync();

const prefix = createURL("/");

const NavTabs = createBottomTabNavigator({
  screens: {
    Main: {
      screen: MainScreen,
      options: {
        title: "Főoldal",
        tabBarIcon: ({ color, size }) => (
          <Image
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Vásárlás: {
      screen: PurchaseTicketsScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Image
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Jegyek: {
      screen: TicketsListScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Image
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Hírek: {
      screen: NewsListScreen,
      options: {
        tabBarIcon: ({ color, size }) => (
          <Image
            tintColor={color}
            style={{
              width: size,
              height: size,
            }}
          />
        ),
      },
    },
    Profil: {
      screen: ProfileScreen,
      options: {},
    },
  },
});

const RootStack = createNativeStackNavigator({
  screens: {
    Welcome: {
      screen: WelcomeScreen,
      linking: {
        path: ":user(@[a-zA-Z0-9-_]+)",
        parse: {
          user: (value) => value.replace(/^@/, ""),
        },
        stringify: {
          user: (value) => `@${value}`,
        },
      },
      options: { title: "Bejelentkezés", headerShown: false },
    },
    SignIn: {
      screen: SignInScreen,
      linking: {
        path: ":user(@[a-zA-Z0-9-_]+)",
        parse: {
          user: (value) => value.replace(/^@/, ""),
        },
        stringify: {
          user: (value) => `@${value}`,
        },
      },
      options: { title: "Bejelentkezés", headerShown: false },
    },
    NavTabs: {
      screen: NavTabs,
      options: {
        title: "Navigáció",
        headerShown: false,
      },
    },

    SignUp: {
      screen: SignUpScreen,
      options: ({ navigation }) => ({
        presentation: "modal",
        headerRight: () => (
          <HeaderButton onPress={navigation.goBack}>
            <Text>Close</Text>
          </HeaderButton>
        ),
        title: "Bejelentkezés",
        headerShown: false,
      }),
    },
    NewsDetail: {
      screen: NewsDetailsScreen,
      options: {
        title: "Hír részletei",
        headerShown: false,
      },
    },

    TicketsDetail: {
      screen: TicketsDetailsScreen,
      options: {
        title: "Jegy részletei",
        headerShown: false,
      },
    },
    PurchaseFinalization: {
      screen: PurchaseFinalizationScreen,
      options: {
        title: "Vásárlás véglegesítése",
        headerShown: false,
      },
    },
  },
});

export const Navigation = createStaticNavigation(RootStack);

type RootStackParamList = StaticParamList<typeof RootStack>;

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <GestureHandlerRootView className="flex-1">
            <View className="flex-1 h-full justify-center">
              <NavigationIndependentTree>
                <Navigation
                  theme={NAV_THEME["light"]}
                  linking={{
                    enabled: "auto",
                    prefixes: [prefix],
                  }}
                  onReady={() => {
                    // SplashScreen.hideAsync();
                  }}
                />
              </NavigationIndependentTree>
            </View>

            <PortalHost />
          </GestureHandlerRootView>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
