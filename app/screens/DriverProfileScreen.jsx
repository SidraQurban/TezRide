import { View, Text } from "react-native";
import React from "react";
import BackBtn from "../components/BackBtn";
import { SafeAreaView } from "react-native-safe-area-context";
import { responsiveWidth } from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import DriverProfile from "../components/DriverProfile";

const DriverProfileScreen = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: responsiveWidth(4),
        backgroundColor: COLORS.background,
      }}
    >
      <View>
        <BackBtn />
        <DriverProfile />
      </View>
    </SafeAreaView>
  );
};

export default DriverProfileScreen;
