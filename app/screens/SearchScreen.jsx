import { View, Text } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, SIZES } from "../constants/theme";
import { responsiveHeight } from "react-native-responsive-dimensions";

const SearchScreen = () => {
  return (
    <SafeAreaView>
      <View
        style={{
          backgroundColor: COLORS.background,
          paddingHorizontal: SIZES.base * 2,
        }}
      ></View>
    </SafeAreaView>
  );
};

export default SearchScreen;
