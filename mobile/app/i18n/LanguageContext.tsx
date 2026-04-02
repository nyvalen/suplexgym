import React, { createContext, useContext, useState, useCallback } from "react";
import i18n, { Language } from "./index";

interface LanguageContextType {
  locale: Language;
  setLocale: (lang: Language) => void;
  t: (scope: string) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  t: (scope) => scope,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Language>(
    (i18n.locale as Language) || "en",
  );

  const setLocale = useCallback((lang: Language) => {
    i18n.locale = lang;
    setLocaleState(lang);
  }, []);

  const t = useCallback(
    (scope: string) => i18n.t(scope),
    [locale], // re-evaluates when locale changes
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
