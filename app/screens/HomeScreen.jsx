import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import DrawerHeader from "../components/DrawerHeader";
import Services from "../components/Services";
import SearchBar from "../components/SearchBar";

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* MAP SECTION */}
      <View style={{ height: responsiveHeight(50) }}>
        <WebView
          source={{
            html: `
              <iframe
                src="https://maps.google.com/maps?q=25.198152585089883,66.45617498089926&z=12&output=embed"
                width="100%"
                height="100%"
                style="border:0;"
              ></iframe>
            `,
          }}
          style={{ flex: 1 }}
        />

        {/* DRAWER OVER MAP */}
        <View
          style={{
            position: "absolute",
            top: responsiveHeight(2),
            left: responsiveWidth(4),
            right: responsiveWidth(4),
            zIndex: 10,
          }}
        >
          <DrawerHeader />
        </View>
      </View>

      {/* BOTTOM SECTION */}
      <View style={{ flex: 1 }}>
        {/* SEARCH BAR */}
        <View
          style={{
            marginTop: -28,
            marginBottom: 10,
            zIndex: 10,
          }}
        >
          <SearchBar />
        </View>

        {/* SERVICES */}
        <View
          style={{
            flex: 1,
            backgroundColor: COLORS.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: responsiveHeight(1),
          }}
        >
          <Services />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
