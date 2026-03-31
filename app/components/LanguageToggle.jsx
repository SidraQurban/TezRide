import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text, I18nManager, Alert } from "react-native";
import i18n from "../locales/i18n";
import { COLORS } from "../constants";

const LanguageToggle = () => {
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "ur" : "en";
    const isRtl = newLang === "ur";

    // Change language in i18n
    i18n.changeLanguage(newLang);

    // Handle RTL
    if (isRtl !== I18nManager.isRTL) {
      I18nManager.forceRTL(isRtl);
      Alert.alert(
        "Restart Required",
        "The app needs to reload for the language change to fully take effect.",
        [{ text: "OK" }],
      );
      // In Expo, a full reload may be needed
    }

    setCurrentLang(newLang);
  };

  return (
    <TouchableOpacity
      onPress={toggleLanguage}
      style={{
        // paddingVertical: 8,
        // paddingHorizontal: 16,
        backgroundColor: COLORS.primary,
        borderRadius: 8,
        alignSelf: "flex-start",
        margin: 10,
      }}
    >
      <Text
        style={{
          color: "#fff",
          fontWeight: "600",
          fontSize: 16,
        }}
      >
        {currentLang === "en" ? "اردو" : "English"}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageToggle;
