import "react-native-reanimated";
import "react-native-gesture-handler";
import React, { useEffect } from "react";
import AppNavigator from "./app/navigation/AppNavigator";
import {
  useFonts,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";
import {
  View,
  ActivityIndicator,
  Platform,
  StatusBar as RNStatusBar,
  I18nManager,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import "./app/locales/i18n";
import i18n from "./app/locales/i18n";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  useEffect(() => {
    const languageCode = i18n.language;
    if (languageCode === "ur" && !I18nManager.isRTL) {
      I18nManager.forceRTL(true);
    } else if (languageCode === "en" && I18nManager.isRTL) {
      I18nManager.forceRTL(false);
    }
  }, []);

  const backgroundColor = "#fff"; // change dynamically if needed

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor }}>
      {/* For Android, set backgroundColor of native status bar */}
      {Platform.OS === "android" && (
        <RNStatusBar
          backgroundColor={backgroundColor}
          barStyle={
            backgroundColor === "#000" ? "light-content" : "dark-content"
          }
        />
      )}

      {/* Expo StatusBar for iOS and dynamic handling */}
      <StatusBar
        style={backgroundColor === "#000" ? "light" : "dark"}
        backgroundColor={backgroundColor}
      />

      <AppNavigator />
    </GestureHandlerRootView>
  );
}
