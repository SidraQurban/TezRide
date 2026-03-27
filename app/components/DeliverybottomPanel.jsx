import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { LinearGradient } from "expo-linear-gradient";
import { FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";

const DeliverybottomPanel = () => {
  const navigation = useNavigation();
  return (
    <View>
      {/* BOTTOM PANEL */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: "#fff",
          borderTopLeftRadius: responsiveWidth(6),
          borderTopRightRadius: responsiveWidth(6),
          padding: responsiveHeight(2.6),
          elevation: 20,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: responsiveFontSize(2),
            marginBottom: responsiveHeight(1.2),
            fontFamily: FONTS.semiBold,
          }}
        >
          Select parcel pickup location
        </Text>

        {/* Add location */}
        <TouchableOpacity>
          <Text
            style={{
              color: COLORS.primary,
              marginBottom: responsiveHeight(1.5),
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(1.7),
            }}
          >
            + Add Another Location
          </Text>
        </TouchableOpacity>

        {/* Current location card */}
        <View
          style={{
            borderWidth: 2,
            borderColor: COLORS.primary,
            borderRadius: responsiveHeight(2),
            padding: responsiveHeight(1.5),
            flexDirection: "row",
            alignItems: "center",
            marginBottom: responsiveHeight(1.7),
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginBottom: responsiveHeight(0.8),
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(1.7),
              }}
            >
              Current location
            </Text>

            <Text
              style={{
                color: "#777",
                fontSize: responsiveFontSize(1.6),
                fontFamily: FONTS.regular,
              }}
            >
              Near 3 Sector 24 Chowrangi industrial area, Karachi
            </Text>
          </View>

          <Ionicons name="locate" size={22} color={COLORS.primary} />
        </View>

        {/* Home */}
        <View
          style={{
            marginBottom: responsiveHeight(2.5),
            marginLeft: responsiveWidth(3.2),
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(1.7),
            }}
          >
            Home
          </Text>
          <Text
            style={{
              color: "#777",
              fontSize: responsiveFontSize(1.6),
              fontFamily: FONTS.regular,
            }}
          >
            Clifton, Karachi
          </Text>
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SearchingDirection")}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: "100%",
              height: responsiveHeight(7),
              borderRadius: responsiveWidth(10),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(2),
              }}
            >
              CONFIRM LOCATION
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeliverybottomPanel;
