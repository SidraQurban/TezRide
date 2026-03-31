import React from "react";
import { View, Image } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import DrawerHeader from "../components/DrawerHeader";

const AppHeader = () => {
  return (
    <View
      style={{
        height: responsiveHeight(6.5), // ✅ balanced height
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Drawer Button */}
      <View
        style={{
          position: "absolute",
          left: responsiveWidth(4),
          justifyContent: "center",
          height: "100%",
        }}
      >
        <DrawerHeader />
      </View>

      {/* Logo */}
      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: responsiveWidth(60),
          height: undefined,
          aspectRatio: 3,
          resizeMode: "contain",
        }}
      />
    </View>
  );
};

export default AppHeader;
