import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { FONTS } from "../constants/theme";

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* MAP */}
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

      {/* SEARCH BAR */}
      <View
        style={{
          position: "absolute",
          top: responsiveHeight(2.5),
          left: responsiveWidth(4),
          right: responsiveWidth(4),
          flexDirection: "row",
          alignItems: "center",
          shadowColor: "#000",
          shadowOpacity: 0.1,
          shadowRadius: 6,
          elevation: 5,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingVertical: responsiveHeight(1.8),
            paddingHorizontal: responsiveWidth(4),
            borderTopLeftRadius: 14,
            borderBottomLeftRadius: 14,
            justifyContent: "center",
          }}
        >
          <Text
            style={{
              color: "#999",
              fontSize: responsiveFontSize(1.8),
              // fontFamily: FONTS.regular,
              fontFamily: FONTS.regular,
            }}
          >
            Where would you go?
          </Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.8}
          style={{
            backgroundColor: "#FFC107",
            paddingVertical: responsiveHeight(1.8),
            paddingHorizontal: responsiveWidth(4),
            borderTopRightRadius: 14,
            borderBottomRightRadius: 14,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="search" size={responsiveFontSize(2.3)} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* DRIVER CARD */}
      <View
        style={{
          position: "absolute",
          bottom: responsiveHeight(3),
          left: responsiveWidth(4),
          right: responsiveWidth(4),
          backgroundColor: "#fff",
          borderRadius: 18,
          flexDirection: "row",
          padding: responsiveWidth(3.5),
          alignItems: "center",
          elevation: 8,
          shadowColor: "#000",
          shadowOpacity: 0.15,
          shadowRadius: 8,
        }}
      >
        {/* IMAGE */}
        <Image
          source={{
            uri: "https://randomuser.me/api/portraits/women/44.jpg",
          }}
          style={{
            width: responsiveWidth(14),
            height: responsiveWidth(14),
            borderRadius: 12,
            marginRight: responsiveWidth(3),
          }}
        />

        {/* DRIVER INFO */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              fontFamily: FONTS.semiBold,
              color: "#000",
            }}
          >
            Sophia Rodriguez
          </Text>

          <Text
            style={{
              fontSize: responsiveFontSize(1.6),
              color: "#777",
              marginTop: responsiveHeight(0.4),
              fontFamily: FONTS.regular,
            }}
          >
            ⭐ 4.5 (120)
          </Text>

          <Text
            style={{
              fontSize: responsiveFontSize(1.6),
              color: "#777",
              fontFamily: FONTS.regular,
            }}
          >
            101 Oak Street
          </Text>

          <Text
            style={{
              fontSize: responsiveFontSize(1.7),
              fontFamily: FONTS.medium,
              color: "#E53935",
              marginTop: responsiveHeight(0.4),
            }}
          >
            JKL 456
          </Text>
        </View>

        {/* HEART ICON */}
        <TouchableOpacity activeOpacity={0.7}>
          <Ionicons
            name="heart-outline"
            size={responsiveFontSize(2.6)}
            color="#999"
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default HomeScreen;
