import React from "react";
import { View, TextInput, Text } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

import { useTranslation } from "react-i18next";

const PickupDropoff = ({ pickup, setPickup, dropoff, setDropoff }) => {
  const { i18n } = useTranslation();
  const isUrdu = i18n.language?.startsWith("ur");

  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        borderRadius: responsiveHeight(2),
        padding: responsiveHeight(0.8),
        marginBottom: SIZES.base,
        borderWidth: 1,
        borderColor: COLORS.primary,
      }}
    >
      {/* Pickup */}
      <View style={{ flexDirection: isUrdu ? "row-reverse" : "row", alignItems: "center" }}>
        <View
          style={{
            width: responsiveHeight(1.2),
            height: responsiveHeight(1.2),
            borderRadius: responsiveHeight(0.7),
            backgroundColor: COLORS.secondary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: responsiveHeight(0.6),
              height: responsiveHeight(0.6),
              borderRadius: responsiveHeight(0.3),
              backgroundColor: COLORS.white,
            }}
          />
        </View>
        <TextInput
          placeholder="Enter Pickup"
          value={pickup}
          onChangeText={setPickup}
          style={{
            flex: 1,
            marginLeft: isUrdu ? 0 : responsiveWidth(2.3),
            marginRight: isUrdu ? responsiveWidth(2.3) : 0,
            fontSize: responsiveFontSize(1.8),
            textAlign: "left",
            writingDirection: "ltr",
          }}
        />
      </View>

      {/* Separator */}
      <View
        style={{
          flexDirection: isUrdu ? "row-reverse" : "row",
          alignItems: "center",
          marginVertical: responsiveHeight(1),
        }}
      >
        <Entypo name="dots-three-vertical" size={16} color={COLORS.icon} />
        <View
          style={{
            height: 1,
            width: responsiveWidth(78),
            backgroundColor: COLORS.num,
            marginHorizontal: 8,
          }}
        />
        <Ionicons name="swap-vertical" size={18} color={COLORS.icon} />
      </View>

      {/* Dropoff */}
      <View style={{ flexDirection: isUrdu ? "row-reverse" : "row", alignItems: "center" }}>
        <View
          style={{
            width: responsiveHeight(1.2),
            height: responsiveHeight(1.2),
            borderRadius: responsiveHeight(0.7),
            backgroundColor: COLORS.secondary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: responsiveHeight(0.6),
              height: responsiveHeight(0.6),
              borderRadius: responsiveHeight(0.3),
              backgroundColor: COLORS.white,
            }}
          />
        </View>
        <TextInput
          placeholder="Enter Dropoff"
          value={dropoff}
          onChangeText={setDropoff}
          style={{
            flex: 1,
            marginLeft: isUrdu ? 0 : responsiveWidth(2.3),
            marginRight: isUrdu ? responsiveWidth(2.3) : 0,
            fontSize: responsiveFontSize(1.8),
            textAlign: "left",
            writingDirection: "ltr",
          }}
        />
        <View
          style={{ alignItems: "center", marginLeft: responsiveWidth(1.7) }}
        >
          <Text
            style={{ color: COLORS.icon, fontSize: responsiveFontSize(1.4) }}
          >
            Skip to Rent
          </Text>
        </View>
      </View>
    </View>
  );
};

export default PickupDropoff;
