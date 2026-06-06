import { View, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation, DrawerActions } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { COLORS, SIZES } from "../constants";
import Svg, { Path } from "react-native-svg";

const DrawerHeader = () => {
  const navigation = useNavigation();
  const { i18n } = useTranslation();

  return (
    <View style={{ flexDirection: "row" }}>
      <TouchableOpacity
        onPress={() => {
          try {
            navigation.dispatch(DrawerActions.toggleDrawer());
          } catch (e) {
            // If toggleDrawer fails (e.g. not in a drawer), go back instead
            if (navigation.canGoBack()) {
               navigation.goBack();
            }
          }
        }}
        style={{ padding: SIZES.base * 1.2 }}
      >
        {/* Bars-Staggered SVG Icon */}
        <Svg
          width={24}
          height={24}
          viewBox="0 0 512 512"
          fill="none"
          style={{ transform: [{ scaleX: 1 }] }}
        >
          <Path
            d="M96 128h320M128 256h320M96 384h320"
            stroke={COLORS.primary}
            strokeWidth={47}
            strokeLinecap="round"
          />
        </Svg>
      </TouchableOpacity>
    </View>
  );
};

export default DrawerHeader;
