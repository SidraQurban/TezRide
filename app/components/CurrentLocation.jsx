import React from "react";
import { TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CurrentLocation = () => (
  <TouchableOpacity
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginTop: responsiveHeight(1),
    }}
  >
    <Ionicons name="locate" size={20} color={COLORS.primary} />
    <Text
      style={{
        marginLeft: responsiveWidth(2),
        fontSize: responsiveFontSize(1.6),
        color: COLORS.primary,
        marginTop: responsiveHeight(0.3),
        fontFamily: FONTS.semiBold,
      }}
    >
      Use current location
    </Text>
  </TouchableOpacity>
);

export default CurrentLocation;
