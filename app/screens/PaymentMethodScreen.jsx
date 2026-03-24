import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { FONTS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";
import PaymentOption from "../components/PaymentOption";

const PaymentMethodScreen = () => {
  const navigation = useNavigation();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(2),
          marginBottom: responsiveHeight(2),
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={25} color={COLORS.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: responsiveFontSize(2.2),
            fontFamily: FONTS.semiBold,
            marginLeft: responsiveWidth(4),
          }}
        >
          Payment Methods
        </Text>
      </View>
      {/* Instruction */}
      <Text
        style={{
          fontFamily: FONTS.regular,
          fontSize: responsiveFontSize(1.8),
          marginHorizontal: responsiveWidth(4),
        }}
      >
        Select the payment method you want to use
      </Text>
      <PaymentOption />
    </SafeAreaView>
  );
};

export default PaymentMethodScreen;
