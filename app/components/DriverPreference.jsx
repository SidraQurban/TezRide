import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants/theme";

const DriverPreference = ({ driverPreferences, gender, setGender }) => (
  <View>
    <Text
      style={{
        marginTop: responsiveHeight(3),
        fontSize: responsiveFontSize(1.8),
        fontFamily: FONTS.semiBold,
      }}
    >
      Driver Preference
    </Text>
    <View
      style={{
        flexDirection: "row",
        marginTop: responsiveHeight(1.5),
        marginBottom: responsiveHeight(2),
      }}
    >
      {driverPreferences.map((option, index) => (
        <TouchableOpacity
          key={option}
          onPress={() => setGender(option)}
          style={{
            backgroundColor: gender === option ? COLORS.active : "#E5E5E5",
            paddingVertical: responsiveHeight(1.2),
            paddingHorizontal: responsiveWidth(5),
            borderRadius: responsiveWidth(20),
            marginRight:
              index !== driverPreferences.length - 1 ? responsiveWidth(3) : 0,
            borderWidth: gender === option ? responsiveWidth(0.3) : 0,
            borderColor: COLORS.primary,
          }}
        >
          <Text
            style={{
              color: COLORS.black,
              fontSize: responsiveFontSize(1.6),
              fontFamily: FONTS.medium,
              lineHeight: responsiveHeight(2),
            }}
          >
            {option}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  </View>
);

export default DriverPreference;
