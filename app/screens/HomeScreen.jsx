import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS, SIZES } from "../constants";
import DrawerHeader from "../components/DrawerHeader";
import { SafeAreaView } from "react-native-safe-area-context";
import Banner from "../components/Banner";
import ServicesSlider from "../components/ServicesSlider";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import PickupDropoff from "../components/PickupDropoff";
import RecentLocations from "../components/RecentLocations";

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
        <View
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            height: responsiveHeight(55),
            paddingHorizontal: responsiveWidth(2),
            paddingBottom: responsiveHeight(4),
          }}
        >
          <Banner />
          <PickupDropoff />
          <ServicesSlider />
          <RecentLocations />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
