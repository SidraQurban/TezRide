import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

import en from "./en.json";
import ur from "./ur.json";

// Detect device language
const locales = Localization.getLocales();
const deviceLanguage = locales[0]?.languageCode || "en";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v3",
  lng: deviceLanguage,
  fallbackLng: "en",
  resources: {
    en: { translation: en },
    ur: { translation: ur },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
