import React from "react";
import { View, Image } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import DrawerHeader from "../components/DrawerHeader";
import { useTranslation } from "react-i18next";

const AppHeader = ({ isRtlIcon = false }) => {
  const { i18n } = useTranslation();

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
      <View
        style={{
          width: '100%',
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: responsiveWidth(4),
          height: "100%",
        }}
      >
        {/* Drawer Button */}
        <View style={{ justifyContent: "center" }}>
          <DrawerHeader />
        </View>

        {/* Logo */}
        <View style={{ position: "absolute", left: 0, right: 0, alignItems: "center", pointerEvents: "none" }}>
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
      </View>
    </View>
  );
};

export default AppHeader;