import { View, TouchableOpacity, Image } from "react-native";
import React from "react";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants";
import { Ionicons } from "@expo/vector-icons";

const BackBtn = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        height: responsiveHeight(5),
        marginBottom: responsiveHeight(1),
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
      }}
    >
      {/* Back Button (Left Corner) */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          position: "absolute",
          left: responsiveWidth(1.5),
          top: 0,
          bottom: 0,
          justifyContent: "center",
        }}
      >
        <Ionicons name="arrow-back-outline" size={25} color={COLORS.primary} />
      </TouchableOpacity>

      {/* Center Logo */}
      <Image
        source={require("../../assets/logo.png")}
        style={{
          width: responsiveWidth(40),
          height: responsiveHeight(20),
          resizeMode: "contain",
          right: responsiveWidth(1),
        }}
      />
    </View>
  );
};

export default BackBtn;
