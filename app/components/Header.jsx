import { View, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import { responsiveHeight } from "react-native-responsive-dimensions";

const Header = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        position: "absolute",
        top: responsiveHeight(2),
        left: SIZES.base * 2,
      }}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          backgroundColor: COLORS.background,
          padding: SIZES.base * 1.2,
          borderRadius: responsiveHeight(3),
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Ionicons
          name="chevron-back-outline"
          size={24}
          color={COLORS.primary}
        />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
