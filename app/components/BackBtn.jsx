import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { responsiveHeight } from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { COLORS, SIZES } from "../constants";
import { Ionicons } from "@expo/vector-icons";

const BackBtn = () => {
  const navigation = useNavigation();
  return (
    <View
      style={{
        flexDirection: "row",
        marginTop: responsiveHeight(2),
        marginBottom: responsiveHeight(1),
      }}
    >
      {/* back Button */}
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={{
          backgroundColor: COLORS.active,
          padding: SIZES.base * 1.2,
          borderRadius: responsiveHeight(3),
        }}
      >
        <Ionicons name="chevron-back-sharp" size={25} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default BackBtn;
