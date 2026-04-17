import { Stack, router } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./reactquery";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost } from "@rn-primitives/portal";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ThemeProvider } from "./theme/ThemeContext";
import "./global.css";
import { useEffect } from "react";
import {
  checkAndRefreshSession,
  clearTokens,
  registerSessionRefreshListener,
  refreshCachedApiBase,
} from "./utils/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

function SessionGuard() {
  useEffect(() => {
    const init = async () => {
      // Always refresh the cached base URL first (reads stored IP in dev)
      await refreshCachedApiBase();

      const hasToken = !!(await AsyncStorage.getItem("accessToken"));
      if (!hasToken) return;

      const valid = await checkAndRefreshSession();
      if (!valid) {
        await clearTokens();
        router.replace("/");
      }
    };
    init();

    const unsubscribe = registerSessionRefreshListener(async () => {
      router.replace("/");
    });

    return unsubscribe;
  }, []);

  return null;
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <SessionGuard />
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="sign-in" options={{ presentation: "modal" }} />
              <Stack.Screen name="sign-up" options={{ presentation: "modal" }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="purchase-finalization" />
              <Stack.Screen name="news-detail" />
              <Stack.Screen name="tickets-detail" />
              <Stack.Screen name="rules" />
            </Stack>
            <PortalHost />
          </GestureHandlerRootView>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
