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

const SearchBar = () => {
  const navigation = useNavigation();

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
          marginLeft: 10,
          fontSize: responsiveFontSize(1.8),
          fontFamily: FONTS.regular,
          color: "#999",
        }}
      >
        Where would you go?
      </Text>
    </TouchableOpacity>
  );
};

export default SearchBar;
