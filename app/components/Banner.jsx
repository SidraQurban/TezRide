import React from "react";
import { View, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, SIZES } from "../constants";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const Banner = () => {
  return (
    <LinearGradient
      colors={[COLORS.primary, COLORS.secondary]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        flexDirection: "row",
        alignItems: "center",
        padding: responsiveHeight(1.2),
        borderRadius: responsiveHeight(1.5),
        marginBottom: responsiveHeight(0.5),
      }}
    >
      <Ionicons name="pricetag" size={20} color={COLORS.secondary} />
      <Text
        style={{
          color: COLORS.white,
          marginLeft: responsiveWidth(2),
          fontSize: responsiveFontSize(1.5),
          flex: 1,
          lineHeight: responsiveFontSize(2),
        }}
      >
        Get a 30% DISCOUNT on Your Next Car Ride. Book Now!
      </Text>
    </LinearGradient>
  );
};

export default Banner;
