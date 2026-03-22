import React, { useState } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import DrawerHeader from "../components/DrawerHeader";
import SearchBar from "../components/SearchBar";
import DriverCard from "../components/DriverCard";

const HomeScreen = () => {
  const [searchText, setSearchText] = useState("");

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1 }}>
        {/* MAP */}
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

        {/* DRAWER + SEARCH BAR */}
        <View
          style={{
            position: "absolute",
            top: responsiveHeight(2),
            left: responsiveWidth(4),
            right: responsiveWidth(4),
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <DrawerHeader />
          <SearchBar searchText={searchText} setSearchText={setSearchText} />
        </View>

        {/* DRIVER SLIDER */}
        <View style={{ position: "absolute", bottom: responsiveHeight(3) }}>
          <DriverCard />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
