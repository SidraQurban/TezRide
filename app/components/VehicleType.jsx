import { View, Text, TextInput, TouchableOpacity } from "react-native";
import React, { useState } from "react";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import { vehicles } from "../data/data";
import { useTranslation } from "react-i18next";

const VehicleType = () => {
  const { t } = useTranslation();
  const [vehicle, setVehicle] = useState("Car");

  return (
    <View>
      {/* Vehicle Type Selection */}
      <Text
        style={{
          marginTop: responsiveHeight(1),
          fontSize: responsiveFontSize(1.8),
          fontFamily: FONTS.semiBold,
        }}
      >
        {t("need_driver_for")}
      </Text>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginTop: responsiveHeight(1),
        }}
      >
        {vehicles.map(({ label, icon }) => (
          <TouchableOpacity
            key={label}
            onPress={() => setVehicle(label)}
            style={{
              backgroundColor: vehicle === label ? COLORS.active : "#E5E5E5",
              paddingVertical: responsiveHeight(1.5),
              paddingHorizontal: responsiveWidth(5),
              borderRadius: responsiveWidth(10),
              marginRight: responsiveWidth(2),
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              minWidth: responsiveWidth(23),
              borderWidth: vehicle === label ? responsiveWidth(0.3) : 0,
              borderColor: COLORS.primary,
            }}
          >
            <Ionicons
              name={icon}
              size={responsiveFontSize(2.3)}
              color={COLORS.black}
              style={{
                marginRight: responsiveWidth(1),
                marginLeft: -responsiveWidth(1),
              }} // responsive margins
            />
            <Text
              style={{
                color: COLORS.black,
                fontSize: responsiveFontSize(1.6),
                fontFamily: FONTS.medium,
                lineHeight: responsiveHeight(2),
              }}
            >
              {t(label.toLowerCase())}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default VehicleType;
