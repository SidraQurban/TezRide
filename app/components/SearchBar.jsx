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
    <View
      style={{
        flex: 1,
        flexDirection: "row",
        marginLeft: 0,
        backgroundColor: "#fff",
        borderRadius: 25,
        overflow: "hidden",
        elevation: 5,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        marginTop: 13,
      }}
    >
      {/* Pressable fake input */}
      <TouchableOpacity
        style={{
          flex: 1,
          paddingHorizontal: responsiveWidth(3),
          paddingVertical: responsiveHeight(1.5),
          justifyContent: "center",
        }}
        activeOpacity={0.7}
        onPress={() => navigation.navigate("Search")}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(1.8),
            fontFamily: FONTS.regular,
            color: "#999",
          }}
        >
          Where would you go?
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => navigation.navigate("Search")}
        activeOpacity={0.8}
        style={{
          backgroundColor: COLORS.primary,
          paddingHorizontal: responsiveWidth(4),
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons name="search" size={responsiveFontSize(2.3)} color="#fff" />
      </TouchableOpacity>
    </View>
  );
};

export default SearchBar;
