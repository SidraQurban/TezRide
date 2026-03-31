import React from "react";
import { View, Text } from "react-native";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const RateInfo = ({ driverRate, duration, totalPrice }) => (
  <View
    style={{
      backgroundColor: COLORS.white,
      borderRadius: responsiveWidth(3),
      paddingVertical: responsiveHeight(2),
      paddingHorizontal: responsiveWidth(4),
      elevation: 3,
      flexDirection: "row",
      justifyContent: "space-between",
    }}
  >
    <View>
      <Text
        style={{ fontFamily: FONTS.regular, fontSize: responsiveFontSize(1.5) }}
      >
        Driver rate
      </Text>
      <Text
        style={{
          marginTop: 2,
          fontFamily: FONTS.semiBold,
          fontSize: responsiveFontSize(1.7),
        }}
      >
        Rs.{driverRate} / hour
      </Text>
    </View>

    <View>
      <Text
        style={{ fontFamily: FONTS.regular, fontSize: responsiveFontSize(1.5) }}
      >
        Duration
      </Text>
      <Text
        style={{
          marginTop: 2,
          fontFamily: FONTS.semiBold,
          fontSize: responsiveFontSize(1.7),
        }}
      >
        {duration.toFixed(1)} Hours
      </Text>
    </View>

    <View>
      <Text
        style={{ fontFamily: FONTS.regular, fontSize: responsiveFontSize(1.5) }}
      >
        Total price
      </Text>
      <Text
        style={{
          fontSize: responsiveFontSize(2),
          marginTop: 2,
          fontFamily: FONTS.semiBold,
        }}
      >
        Rs.{totalPrice.toFixed(0)}
      </Text>
    </View>
  </View>
);

export default RateInfo;
