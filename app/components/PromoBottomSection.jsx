import { View, Text, TouchableOpacity, TextInput } from "react-native";
import React, { useState } from "react";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { FONTS } from "../constants/theme";

const PromoBottomSection = () => {
  const [promoCode, setPromoCode] = useState("");
  const [selectedCar, setSelectedCar] = useState(null);

  const selectedPrice = selectedCar
    ? carOptions.find((c) => c.id === selectedCar).price
    : 0;
  return (
    <View>
      {/* PROMO CODE */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(1),
        }}
      >
        <TextInput
          placeholder="Enter your promo code"
          value={promoCode}
          onChangeText={setPromoCode}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingHorizontal: responsiveWidth(4),
            paddingVertical: responsiveHeight(1.5),
            borderRadius: responsiveWidth(3),
          }}
        />
        <TouchableOpacity
          style={{
            marginLeft: responsiveWidth(2),
            width: responsiveWidth(12),
            height: responsiveWidth(12),
            borderRadius: responsiveWidth(6),
            backgroundColor: COLORS.secondary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* BOTTOM SECTION */}
      <SafeAreaView
        // edges={["bottom"]}
        style={{
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(3),
          paddingBottom: responsiveHeight(2),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: responsiveHeight(2),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>4.5 Km</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>4 mins</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="card-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>
              Rs. {selectedPrice}.00
            </Text>
          </View>
        </View>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity activeOpacity={0.8}>
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
                color: "#fff",
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(2),
              }}
            >
              Continue
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </SafeAreaView>
    </View>
  );
};

export default PromoBottomSection;
