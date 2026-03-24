import { View, Text, TouchableOpacity, Image } from "react-native";
import React from "react";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";

const ArrivingCard = ({ onClose }) => {
  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingTop: responsiveHeight(1.5),
        paddingBottom: responsiveHeight(2.5),
        paddingHorizontal: responsiveWidth(5),
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: responsiveHeight(2),
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(2),
            fontFamily: FONTS.semiBold,
          }}
        >
          Driver is Arriving...
        </Text>

        <Text
          style={{
            fontSize: responsiveFontSize(1.7),
            color: "#8A8A8A",
          }}
        >
          2 mins
        </Text>
      </View>

      {/* Driver Row */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginBottom: responsiveHeight(2),
        }}
      >
        <Image
          source={{
            uri: "https://randomuser.me/api/portraits/men/46.jpg",
          }}
          style={{
            width: 52,
            height: 52,
            borderRadius: 26,
          }}
        />

        <View style={{ marginLeft: 12, flex: 1 }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(1.9),
            }}
          >
            Usman Tariq
          </Text>

          <Text
            style={{
              color: "#8A8A8A",
              fontSize: responsiveFontSize(1.5),
            }}
          >
            Mercedes-Benz E-Class
          </Text>
        </View>

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="star" size={16} color="#FFC107" />
          <Text style={{ marginLeft: 4, fontSize: 13 }}>4.6</Text>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "#F0F0F0",
          marginBottom: responsiveHeight(2),
        }}
      />

      {/* Locations */}
      <View style={{ marginBottom: responsiveHeight(2) }}>
        <View style={{ flexDirection: "row", marginBottom: 14 }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="my-location" size={18} color={COLORS.white} />
          </View>

          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontFamily: FONTS.medium, fontSize: 14 }}>
              My Current Location
            </Text>
            <Text style={{ color: "#8A8A8A", fontSize: 12 }}>0 Km</Text>
          </View>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: COLORS.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="location" size={18} color={COLORS.white} />
          </View>

          <View style={{ marginLeft: 12 }}>
            <Text style={{ fontFamily: FONTS.medium, fontSize: 14 }}>
              Soft Bank Buildings
            </Text>
            <Text style={{ color: "#8A8A8A", fontSize: 12 }}>4 Km</Text>
          </View>
        </View>
      </View>

      {/* Bottom Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          marginTop: responsiveHeight(1),
        }}
      >
        {/* ❌ CLOSE */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: "#F2F2F2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>

        {/* CHAT */}
        <TouchableOpacity
          style={{
            width: 65,
            height: 65,
            borderRadius: 32.5,
            backgroundColor: COLORS.secondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chatbubble" size={24} color={COLORS.black} />
        </TouchableOpacity>

        {/* CALL */}
        <TouchableOpacity
          style={{
            width: 58,
            height: 58,
            borderRadius: 29,
            backgroundColor: COLORS.secondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="phone" size={22} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ArrivingCard;
