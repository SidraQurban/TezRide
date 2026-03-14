import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS, SIZES } from "../constants";
import DrawerHeader from "../components/DrawerHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import RideOptionsPanel from "../components/RideOptionsPanel";

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1 }}>
        {/* MAP */}
        <WebView
          source={{
            html: `
              <iframe
                src="https://maps.google.com/maps?q=25.198152585089883,66.45617498089926&z=10&output=embed"
                width="100%"
                height="50%"
                style="border:0;"
              ></iframe>
            `,
          }}
          style={{ flex: 1 }}
        />

        {/* Drawer Header */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
          }}
        >
          <DrawerHeader />
        </View>

        {/* Floating Ride Panel */}
        <View
          style={{
            position: "absolute",
            bottom: 20,
            left: 0,
            right: 0,
            height: "46%",
          }}
        >
          <RideOptionsPanel />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
