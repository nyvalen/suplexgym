import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import i18n, { Language } from "./index";
import { getLocales } from "expo-localization";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LanguageContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (scope: string, options?: Record<string, string | number>) => string;
}

const LANG_KEY = "suplex_language_preference";

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (scope) => scope,
});

function detectSystemLanguage(): Language {
  const code = getLocales()[0]?.languageCode ?? "en";
  return code === "hu" ? "hu" : "en";
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const systemLang = detectSystemLanguage();
  const [locale, setLocaleState] = useState<Language>(systemLang);
  const [loaded, setLoaded] = useState(false);

  // Load saved language preference; if none, use system language
  useEffect(() => {
    AsyncStorage.getItem(LANG_KEY).then((stored) => {
      if (stored === "en" || stored === "hu") {
        i18n.locale = stored;
        setLocaleState(stored);
      } else {
        // First launch: use system language and save it
        i18n.locale = systemLang;
        setLocaleState(systemLang);
        AsyncStorage.setItem(LANG_KEY, systemLang);
      }
      setLoaded(true);
    });
  }, []);

  const setLocale = useCallback((lang: Language) => {
    i18n.locale = lang;
    setLocaleState(lang);
    AsyncStorage.setItem(LANG_KEY, lang);
  }, []);

  // t is re-created whenever locale changes, so all consumers re-render
  const t = useCallback(
    (scope: string, options?: Record<string, string | number>): string => {
      try {
        return i18n.t(scope, options) ?? scope;
      } catch {
        return scope;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale]
  );

  if (!loaded) return null;

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
