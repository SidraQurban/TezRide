import React from "react";
import { View, Text, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, SIZES } from "../constants";

const LoginScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          flex: 1,
          alignItems: "center",
          paddingHorizontal: SIZES.base,
        }}
      >
        {/* Logo */}
        <Image
          source={require("../../assets/logo.png")}
          resizeMode="contain"
          style={{
            height: responsiveHeight(20),
            width: responsiveWidth(80),
          }}
        />

        {/* Text Section */}
        <View
          style={{
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(2.3),
              fontWeight: "500",
              color: COLORS.black,
              textAlign: "center",
            }}
          >
            Enter your number to
          </Text>

          <Text
            style={{
              fontSize: responsiveFontSize(2.3),
              fontWeight: "500",
              color: COLORS.black,
              textAlign: "center",
            }}
          >
            continue
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
