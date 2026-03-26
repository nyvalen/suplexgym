import type { I18nConfig } from "next-i18next/proxy"

const i18nConfig: I18nConfig = {
  supportedLngs: ["en", "de"],
  fallbackLng: "en",
  defaultNS: "common",
  ns: ["common", "home"],
  // Recommended: works on all platforms including Vercel/serverless
  resourceLoader: (language, namespace) =>
    import(`/public/locales/${language}/${namespace}.json`),
}

export default i18nConfig
