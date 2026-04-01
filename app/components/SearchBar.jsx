import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const SearchBar = () => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate("Search")}
      style={{
        width: "90%",
        alignSelf: "center",
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.white,
        borderRadius: 25,
        paddingHorizontal: responsiveWidth(4),
        paddingVertical: responsiveHeight(1.5),
        borderColor: COLORS.primary,
        borderWidth: 1,
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginTop: 13,
        gap: 10,
      }}
    >
      {/* LEFT CAR ICON */}
      <Ionicons
        name="car-sport"
        size={responsiveFontSize(3.5)}
        color={COLORS.primary}
      />

      {/* TEXT */}
      <Text
        style={{
          fontSize: responsiveFontSize(1.8),
          fontFamily: FONTS.regular,
          color: "#999",
          textAlign: i18n.language === "ur" ? "right" : "left",
        }}
      >
        {t("search_placeholder")}
      </Text>
    </TouchableOpacity>
  );
};

export default SearchBar;
