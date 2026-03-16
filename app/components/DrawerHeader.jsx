import { View, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { responsiveHeight } from "react-native-responsive-dimensions";
import Svg, { Path } from "react-native-svg";

const DrawerHeader = () => {
  const navigation = useNavigation();

  return (
    <View
      style={{
        flexDirection: "row",
        paddingHorizontal: SIZES.base * 2,
        marginTop: responsiveHeight(2),
      }}
    >
      {/* Drawer Menu Button */}
      <TouchableOpacity
        onPress={() => navigation.toggleDrawer()}
        style={{
          backgroundColor: COLORS.background,
          padding: SIZES.base * 1.2,
          borderRadius: responsiveHeight(3),
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {/* Bars-Staggered SVG Icon */}
        <Svg width={24} height={24} viewBox="0 0 512 512" fill="none">
          <Path
            d="M96 128h320M128 256h320M96 384h320"
            stroke={COLORS.primary}
            strokeWidth={47} // thickness of bars
            strokeLinecap="round" // rounded ends
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

export default DrawerHeader;
