import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { useTranslation } from "react-i18next";

const SearchInput = ({
  pickup,
  setPickup,
  destination,
  setDestination,
  onSwapLocations,
}) => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        paddingVertical: 10,
        paddingHorizontal: 12,
        elevation: 3,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 6,
        shadowOffset: { width: 0, height: 2 },
        borderWidth: 1,
        borderColor: COLORS.primary,
        marginTop: responsiveHeight(1),
      }}
    >
      {/* Left Inputs */}
      <View style={{ flex: 1 }}>
        {/* Pickup */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="location" size={18} color={COLORS.primary} />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text
              style={{ fontSize: 12, color: "#888", fontFamily: FONTS.regular }}
            >
              {t("from_location")}
            </Text>

            <TextInput
              placeholder={t("enter_pickup")}
              placeholderTextColor="#999"
              value={pickup}
              onChangeText={setPickup}
              returnKeyType="search"
              onSubmitEditing={() => setPickup(pickup.trim())}
              style={{
                fontSize: responsiveFontSize(1.8),
                fontFamily: FONTS.medium,
                paddingVertical: 2,
                color: COLORS.black,
              }}
            />
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: "#eee",
            marginVertical: 8,
            marginLeft: 26,
          }}
        />

        {/* Destination */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="location" size={18} color="#999" />
          <View style={{ marginLeft: 8, flex: 1 }}>
            <Text
              style={{ fontSize: 12, color: "#888", fontFamily: FONTS.regular }}
            >
              {t("to_location")}
            </Text>

            <TextInput
              placeholder={t("enter_destination")}
              placeholderTextColor="#999"
              value={destination}
              onChangeText={setDestination}
              returnKeyType="search"
              onSubmitEditing={() => setDestination(destination.trim())}
              style={{
                fontSize: responsiveFontSize(1.8),
                fontFamily: FONTS.medium,
                paddingVertical: 2,
                color: COLORS.black,
              }}
            />
          </View>
        </View>
      </View>

      {/* Swap Button */}
      <TouchableOpacity
        onPress={onSwapLocations}
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "#F3F3F3",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 10,
        }}
      >
        <MaterialIcons name="swap-vert" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
