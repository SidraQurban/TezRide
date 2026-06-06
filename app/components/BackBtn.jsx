import { View, TouchableOpacity, Image } from "react-native";
import React from "react";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { COLORS } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";

const BackBtn = () => {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const isRTL = false; // Layout is always LTR

  return (
    <View
      style={{
        height: responsiveHeight(6.5),
        backgroundColor: COLORS.white,
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Back Button */}
      <TouchableOpacity
        onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else {
            navigation.navigate("MainDrawer");
          }
        }}
        style={{
          position: "absolute",
          left: responsiveWidth(4),
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Ionicons name="arrow-back-outline" size={25} color={COLORS.primary} />
      </TouchableOpacity>

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

export default BackBtn;
