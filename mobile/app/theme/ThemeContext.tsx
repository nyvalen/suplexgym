import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type ColorScheme = "light" | "dark";

interface ThemeContextType {
  colorScheme: ColorScheme;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: "dark",
  toggleTheme: () => {},
  isDark: true,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ColorScheme>("dark");

  useEffect(() => {
    AsyncStorage.getItem("colorScheme").then((stored) => {
      if (stored === "light" || stored === "dark") setColorScheme(stored);
    });
  }, []);

  const toggleTheme = () => {
    const next: ColorScheme = colorScheme === "dark" ? "light" : "dark";
    setColorScheme(next);
    AsyncStorage.setItem("colorScheme", next);
  };

  return (
    <ThemeContext.Provider
      value={{ colorScheme, toggleTheme, isDark: colorScheme === "dark" }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Design tokens matching the web purple theme
export const tokens = {
  dark: {
    bg: "#09090b",
    surface: "#18181b",
    surfaceHigh: "#27272a",
    border: "#3f3f46",
    text: "#fafafa",
    textSub: "#a1a1aa",
    textMuted: "#71717a",
    primary: "#7c3aed",
    primaryLight: "#8b5cf6",
    primarySoft: "rgba(124,58,237,0.15)",
    primaryBorder: "rgba(124,58,237,0.35)",
    accent: "#c4b5fd",
    danger: "#f87171",
    success: "#4ade80",
    warning: "#fbbf24",
  },
  light: {
    bg: "#fafafa",
    surface: "#ffffff",
    surfaceHigh: "#f4f4f5",
    border: "#e4e4e7",
    text: "#09090b",
    textSub: "#52525b",
    textMuted: "#a1a1aa",
    primary: "#7c3aed",
    primaryLight: "#8b5cf6",
    primarySoft: "rgba(124,58,237,0.08)",
    primaryBorder: "rgba(124,58,237,0.25)",
    accent: "#6d28d9",
    danger: "#dc2626",
    success: "#16a34a",
    warning: "#d97706",
  },
};
