import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import RideOptions from "../components/RideOptions";

const SelectRideScreen = () => {
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
          <Ionicons name="arrow-back" size={25} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: responsiveFontSize(2.2),
            fontFamily: FONTS.semiBold,
            marginLeft: responsiveWidth(4),
          }}
        >
          Select Ride
        </Text>
      </View>
      {/* CAR LIST */}
      <RideOptions />
      {/* Promo */}
    </SafeAreaView>
  );
};

export default SelectRideScreen;
