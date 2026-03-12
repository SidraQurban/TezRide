import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS, SIZES } from "../constants";
import DrawerHeader from "../components/DrawerHeader";
import { SafeAreaView } from "react-native-safe-area-context";

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Main container */}
      <View style={{ flex: 1, paddingHorizontal: SIZES.base * 0.5 }}>
        {/* WebView showing dummy map */}
        <WebView
          source={{
            html: `
              <iframe
                src="https://maps.google.com/maps?q=25.198152585089883,66.45617498089926&z=10&output=embed"
                width="100%"
                height="50%"
                style="border:0;"
                allowfullscreen=""
              ></iframe>
            `,
          }}
          style={{ flex: 1 }}
        />

        {/* DrawerHeader on top */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
          <DrawerHeader />
        </View>
        {/*  */}
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
