import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, SIZES } from "../constants";
import { FONTS } from "../constants/theme";

const RentalModal = ({ closeModal }) => {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "flex-end",
        backgroundColor: "rgba(0,0,0,0.5)",
      }}
    >
      <View
        style={{
          backgroundColor: COLORS.white,
          padding: 40,
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
        }}
      >
        <Text
          style={{
            fontSize: 18,
            fontFamily: FONTS.semiBold,
            color: "#333",
            marginBottom: 20,
            textAlign: "center",
          }}
        >
          When do you want to rent?
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <TouchableOpacity
            onPress={() => {
              console.log("Rent Now pressed");
              closeModal();
            }}
            style={{
              width: "48%",
              paddingVertical: 14,
              borderRadius: 30,
              backgroundColor: COLORS.secondary,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(1.7),
              }}
            >
              Now
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => {
              console.log("Rent Later pressed");
              closeModal();
            }}
            style={{
              width: "48%",
              paddingVertical: 14,
              borderRadius: 30,
              backgroundColor: "#EAE6DC",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(1.7),
              }}
            >
              Later
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RentalModal;
