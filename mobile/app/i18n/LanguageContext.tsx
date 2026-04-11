import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import i18n, { Language } from "./index";
import { getLocales } from "expo-localization";

interface LanguageContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (scope: string, options?: Record<string, string | number>) => string;
}

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
  const [locale, setLocaleState] = useState<Language>(() => {
    const sys = detectSystemLanguage();
    i18n.locale = sys;
    return sys;
  });

  const setLocale = useCallback((lang: Language) => {
    i18n.locale = lang;
    setLocaleState(lang);
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
    [locale],
  );

  return (
    <LanguageContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
