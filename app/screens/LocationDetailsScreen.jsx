import { View, Text, TouchableOpacity } from "react-native";
import React from "react";
import { useNavigation } from "@react-navigation/native";
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
import { SafeAreaView } from "react-native-safe-area-context";

const LocationDetailsScreen = () => {
  const navigation = useNavigation();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between",
          paddingBottom: responsiveHeight(2),
        }}
      >
        {/* TOP SECTION */}
        <View style={{ flex: 1 }}>
          {/* HEADER */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: responsiveWidth(4),
              marginTop: responsiveHeight(2), // ✅ safe spacing from top
              marginBottom: responsiveHeight(2),
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons
                name="arrow-back"
                size={responsiveFontSize(2.5)}
                color={COLORS.primary}
              />
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
          <View style={{ flex: 1 }}>
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
        </View>

        {/* BOTTOM BUTTON */}
        <View style={{ alignItems: "center" }}>
          <TouchableOpacity onPress={() => navigation.navigate("SelectRide")}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: responsiveWidth(85),
                height: responsiveHeight(7),
                borderRadius: responsiveWidth(10),
                justifyContent: "center",
                alignItems: "center",
                marginBottom: responsiveHeight(-1),
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
      </View>
    </SafeAreaView>
  );
};

export default LocationDetailsScreen;
