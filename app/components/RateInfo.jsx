import React from "react";
import { View, Text, TextInput } from "react-native";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { useTranslation } from "react-i18next";

const RateInfo = ({ driverRate, setDriverRate, duration, totalPrice, onFocus }) => {
  const { t } = useTranslation();
  return (
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
        {t("driver_rate_label")}
      </Text>
      <View style={{ flexDirection: "row", alignItems: "center", marginTop: 2 }}>
        <Text style={{ fontFamily: FONTS.semiBold, fontSize: responsiveFontSize(1.7) }}>
          Rs.
        </Text>
        <TextInput
          value={String(driverRate)}
          onChangeText={(val) => setDriverRate(val ? Number(val.replace(/[^0-9]/g, '')) : 0)}
          onFocus={onFocus}
          keyboardType="numeric"
          style={{
            fontFamily: FONTS.semiBold,
            fontSize: responsiveFontSize(1.7),
            borderBottomWidth: 1,
            borderBottomColor: COLORS.primary,
            minWidth: 35,
            paddingVertical: 0,
            textAlign: "center",
            color: COLORS.black,
          }}
        />
        <Text style={{ fontFamily: FONTS.semiBold, fontSize: responsiveFontSize(1.7) }}>
          {" "}/ {t("hour")}
        </Text>
      </View>
    </View>

    <View>
      <Text
        style={{ fontFamily: FONTS.regular, fontSize: responsiveFontSize(1.5) }}
      >
        {t("duration")}
      </Text>
      <Text
        style={{
          marginTop: 2,
          fontFamily: FONTS.semiBold,
          fontSize: responsiveFontSize(1.7),
        }}
      >
        {duration.toFixed(1)} {t("hours")}
      </Text>
    </View>

    <View>
      <Text
        style={{ fontFamily: FONTS.regular, fontSize: responsiveFontSize(1.5) }}
      >
        {t("total_price")}
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
)};

export default RateInfo;
