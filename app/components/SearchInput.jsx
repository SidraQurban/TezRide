import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useTranslation } from "react-i18next";

const SearchInput = ({
  pickup,
  setPickup,
  destination,
  setDestination,
  onSwapLocations,
  onFocusPickup,
  onFocusDestination,
  pickupRef,
  destinationRef,
}) => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language?.startsWith("ur");

  return (
    <View
      style={{
        flexDirection: isUrdu ? "row-reverse" : "row",
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
      {/*  Inputs Section - Occupies the rest of the space, pushes to the Right in RTL */}
      <View style={{ flex: 1 }}>
        {/* Pickup */}
        <View style={{ flexDirection: isUrdu ? "row-reverse" : "row", alignItems: "center" }}>
          {/* Icon - Appears on the FAR RIGHT in Urdu RTL */}
          <Ionicons name="location" size={18} color={COLORS.primary} />

          {/* Text Section - Appears to the LEFT of the icon in Urdu RTL */}
          <View
            style={{
              flex: 1,
              marginHorizontal: 12,
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#888",
                fontFamily: FONTS.regular,
                textAlign: "left",
                writingDirection: "ltr",
              }}
            >
              {t("from_location")}
            </Text>

            <View style={{ flexDirection: isUrdu ? "row-reverse" : "row", alignItems: "center" }}>
              <TextInput
                ref={pickupRef}
                placeholder={t("enter_pickup")}
                placeholderTextColor="#999"
                value={pickup}
                onChangeText={setPickup}
                onFocus={onFocusPickup}
                returnKeyType="search"
                onSubmitEditing={() => setPickup(pickup.trim())}
                style={{
                  fontSize: responsiveFontSize(1.8),
                  fontFamily: FONTS.medium,
                  paddingVertical: 2,
                  color: COLORS.black,
                  textAlign: "left",
                  writingDirection: "ltr",
                  flex: 1,
                }}
              />
              {pickup?.length > 0 && (
                <TouchableOpacity
                  onPress={() => setPickup("")}
                  style={{
                    padding: 6,
                    justifyContent: "center",
                    // marginLeft: responsiveWidth(10),
                  }}
                >
                  <Ionicons name="close-circle" size={18} color="#CCC" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>

        {/* Divider */}
        <View
          style={{
            height: 1,
            backgroundColor: "#eee",
            marginVertical: 8,
            marginLeft: isUrdu ? 0 : 26,
            marginRight: isUrdu ? 26 : 0,
          }}
        />

        {/* Destination */}
        <View style={{ flexDirection: isUrdu ? "row-reverse" : "row", alignItems: "center" }}>
          {/* Icon - Appears on the FAR RIGHT in Urdu RTL */}
          <Ionicons name="location" size={18} color="#999" />

          {/* Text Section - Appears to the LEFT of the icon in Urdu RTL */}
          <View
            style={{
              flex: 1,
              marginHorizontal: 12,
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: 12,
                color: "#888",
                fontFamily: FONTS.regular,
                textAlign: "left",
                writingDirection: "ltr",
              }}
            >
              {t("to_location")}
            </Text>

            <View style={{ flexDirection: isUrdu ? "row-reverse" : "row", alignItems: "center" }}>
              <TextInput
                ref={destinationRef}
                placeholder={t("enter_destination")}
                placeholderTextColor="#999"
                value={destination}
                onChangeText={setDestination}
                onFocus={onFocusDestination}
                returnKeyType="search"
                onSubmitEditing={() => setDestination(destination.trim())}
                style={{
                  fontSize: responsiveFontSize(1.8),
                  fontFamily: FONTS.medium,
                  paddingVertical: 2,
                  color: COLORS.black,
                  textAlign: "left",
                  writingDirection: "ltr",
                  flex: 1,
                }}
              />
              {destination?.length > 0 && (
                <TouchableOpacity
                  onPress={() => setDestination("")}
                  style={{ padding: 6, justifyContent: "center" }}
                >
                  <Ionicons name="close-circle" size={18} color="#CCC" />
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </View>

      {/* 2. Swap Button - Appears on the FAR LEFT in Urdu RTL */}
      <TouchableOpacity
        onPress={onSwapLocations}
        style={{
          width: 34,
          height: 34,
          borderRadius: 17,
          backgroundColor: "#F3F3F3",
          alignItems: "center",
          justifyContent: "center",
          marginLeft: 15,
          marginRight: 0,
          zIndex: 30,
        }}
      >
        <MaterialIcons name="swap-vert" size={20} color={COLORS.primary} />
      </TouchableOpacity>
    </View>
  );
};

export default SearchInput;
