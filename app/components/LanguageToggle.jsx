import React, { useState, useEffect } from "react";
import { TouchableOpacity, Text } from "react-native";
import i18n from "../locales/i18n";
import { COLORS } from "../constants";

const LanguageToggle = () => {
  const [currentLang, setCurrentLang] = useState(i18n.language);

  useEffect(() => {
    setCurrentLang(i18n.language);
  }, [i18n.language]);

  const toggleLanguage = () => {
    const newLang = currentLang === "en" ? "ur" : "en";
    i18n.changeLanguage(newLang);
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
