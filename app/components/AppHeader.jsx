import React from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import DrawerHeader from "../components/DrawerHeader";
import { Image } from "react-native";

const AppHeader = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View
        style={{
          height: responsiveHeight(5),
          backgroundColor: COLORS.white,
          justifyContent: "center",
          alignItems: "center",
          position: "relative",
        }}
      >
        {/* Drawer Button (Left Corner) */}
        <View
          style={{
            position: "absolute",
            left: responsiveWidth(4),
            top: 0,
            bottom: 0,
            justifyContent: "center",
          }}
        >
          <DrawerHeader />
        </View>

        {/* Center Logo */}
        <Image
          source={require("../../assets/logo.png")}
          style={{
            width: responsiveWidth(40),
            height: responsiveHeight(20),
            resizeMode: "contain",
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default AppHeader;
