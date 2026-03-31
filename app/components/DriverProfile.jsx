import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { Ionicons, FontAwesome } from "@expo/vector-icons";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";

const DriverProfile = () => {
  return (
    <View>
      {/* PROFILE */}
      <View style={{ alignItems: "center", marginTop: responsiveHeight(1) }}>
        <Image
          source={{ uri: "https://randomuser.me/api/portraits/men/46.jpg" }}
          style={{
            width: responsiveWidth(28),
            height: responsiveWidth(28),
            borderRadius: responsiveWidth(14),
          }}
        />

        <Text
          style={{
            marginTop: responsiveHeight(1.5),
            fontSize: responsiveFontSize(2.3),
            fontFamily: FONTS.semiBold,
          }}
        >
          Usman Tariq
        </Text>

        {/* PHONE */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 4,
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.medium,
              fontSize: responsiveFontSize(1.6),
            }}
          >
            +92-3022-983-871
          </Text>

          <TouchableOpacity>
            <Ionicons
              name="copy"
              size={16}
              color={COLORS.primary}
              style={{ marginLeft: 6 }}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* STATS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-around",
          marginTop: responsiveHeight(4),
        }}
      >
        {[
          { icon: "star", value: "4.9", label: "Ratings" },
          { icon: "car", value: "279", label: "Trips" },
          { icon: "time", value: "5", label: "Years" },
        ].map((item, index) => (
          <View key={index} style={{ alignItems: "center" }}>
            <View
              style={{
                width: 55,
                height: 55,
                borderRadius: 30,
                backgroundColor: COLORS.secondary,
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 8,
              }}
            >
              <Ionicons name={item.icon} size={25} color={COLORS.black} />
            </View>

            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(1.8),
              }}
            >
              {item.value}
            </Text>

            <Text
              style={{
                fontFamily: FONTS.regular,
                fontSize: responsiveFontSize(1.3),
                color: "#777",
              }}
            >
              {item.label}
            </Text>
          </View>
        ))}
      </View>

      {/* DETAILS */}
      <View style={{ marginTop: responsiveHeight(4) }}>
        {/* Row */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: responsiveHeight(1.5),
          }}
        >
          <Text style={{ color: "#777", fontFamily: FONTS.regular }}>
            Member Since
          </Text>
          <Text style={{ fontFamily: FONTS.medium }}>July 19, 2027</Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: responsiveHeight(1.5),
          }}
        >
          <Text style={{ color: "#777", fontFamily: FONTS.regular }}>
            Car Model
          </Text>
          <Text style={{ fontFamily: FONTS.medium }}>
            Mercedes-Benz E-class
          </Text>
        </View>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ color: "#777", fontFamily: FONTS.regular }}>
            Plate Number
          </Text>
          <Text style={{ fontFamily: FONTS.medium }}>HSW 4736 XK</Text>
        </View>
      </View>

      {/* BOTTOM BUTTONS */}
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          flexDirection: "row",
          justifyContent: "center",
          marginTop: responsiveHeight(60),
        }}
      >
        <View style={{ flexDirection: "row", gap: 20 }}>
          <TouchableOpacity
            style={{
              width: 65,
              height: 65,
              borderRadius: 35,
              backgroundColor: COLORS.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="chatbubble" size={26} color={COLORS.black} />
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              width: 65,
              height: 65,
              borderRadius: 35,
              backgroundColor: COLORS.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FontAwesome name="phone" size={24} color={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default DriverProfile;
