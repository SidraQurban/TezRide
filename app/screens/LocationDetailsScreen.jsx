import { View, Text, TouchableOpacity, Linking } from "react-native";
import React from "react";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import { WebView } from "react-native-webview";
import { LinearGradient } from "expo-linear-gradient";

const LocationDetailsScreen = () => {
  const navigation = useNavigation();

  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: responsiveHeight(2),
          paddingHorizontal: responsiveWidth(4),
          top: responsiveHeight(3),
          marginBottom: responsiveHeight(2),
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={25} color={COLORS.primary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: responsiveFontSize(2.2),
            fontFamily: FONTS.semiBold,
            marginLeft: responsiveWidth(4),
          }}
        >
          Location Details
        </Text>
      </View>

      {/* MAP */}
      <View style={{ flex: 1, marginTop: 20 }}>
        <WebView
          source={{
            html: `
             <iframe
                src="https://maps.google.com/maps?q=25.198152585089883,66.45617498089926&z=12&output=embed"
                width="100%"
                height="100%"
                style="border:0;"
              ></iframe>
            `,
          }}
          style={{ flex: 1 }}
        />
      </View>

      {/* GET DIRECTION BUTTON */}
      <TouchableOpacity
        style={{
          paddingVertical: responsiveHeight(4),
          alignItems: "center",
        }}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: responsiveWidth(85),
            height: responsiveWidth(16),
            borderRadius: responsiveWidth(10),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              color: "#fff",
              fontFamily: FONTS.semiBold,
            }}
          >
            Get Direction
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

export default LocationDetailsScreen;
