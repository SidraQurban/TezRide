import { View, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { COLORS, SIZES } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { responsiveHeight } from "react-native-responsive-dimensions";
import Svg, { Path } from "react-native-svg";

const DrawerHeader = () => {
  const navigation = useNavigation();
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ur";

  return (
    <View
      style={{
        flexDirection: "row",
      }}
    >
      {/* Drawer Menu Button */}
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={{
          // backgroundColor: COLORS.active,
          padding: SIZES.base * 1.2,
          // borderRadius: responsiveHeight(3),
        }}
      >
        {/* Bars-Staggered SVG Icon */}
        <Svg width={24} height={24} viewBox="0 0 512 512" fill="none" style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}>
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
