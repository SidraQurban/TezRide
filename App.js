import "react-native-reanimated";
import React from "react";
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
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { GestureHandlerRootView } from "react-native-gesture-handler";

export default function App() {
  const [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

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
