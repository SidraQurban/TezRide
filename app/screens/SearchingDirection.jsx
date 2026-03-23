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
import ArrivingCard from "../components/ArrivingCard";

const SearchingDirection = () => {
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
              marginTop: responsiveHeight(2),
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
              Searching Direction
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
        <ArrivingCard />
      </View>
    </SafeAreaView>
  );
};

export default SearchingDirection;
