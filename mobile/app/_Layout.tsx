import { Stack } from "expo-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./reactquery";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { PortalHost } from "@rn-primitives/portal";
import { LanguageProvider } from "./i18n/LanguageContext";
import { ThemeProvider } from "./theme/ThemeContext";
import "./global.css";

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <ThemeProvider>
          <GestureHandlerRootView style={{ flex: 1 }}>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="sign-in" />
              <Stack.Screen
                name="sign-up"
                options={{ presentation: "modal" }}
              />
              <Stack.Screen name="(tabs)" />
            </Stack>
            <PortalHost />
          </GestureHandlerRootView>
        </ThemeProvider>
      </LanguageProvider>
    </QueryClientProvider>
  );
}
