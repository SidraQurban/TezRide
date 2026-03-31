import React, { useState, useEffect } from "react";
import {
  TouchableOpacity,
  Text,
  I18nManager,
  Alert,
  StyleSheet,
} from "react-native";
import i18n from "../locales/i18n";

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
    <TouchableOpacity style={styles.button} onPress={toggleLanguage}>
      <Text style={styles.text}>
        {currentLang === "en" ? "اردو" : "English"}
      </Text>
    </TouchableOpacity>
  );
};

export default LanguageToggle;

const styles = StyleSheet.create({
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    alignSelf: "flex-start", // adjust as needed
    margin: 10,
  },
  text: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
