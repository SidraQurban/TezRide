import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import DrawerHeader from "../components/DrawerHeader";
import Services from "../components/Services";
import SearchBar from "../components/SearchBar";
import { Ionicons } from "@expo/vector-icons";
import { FONTS } from "../constants/theme";
import LocationModal from "../components/LocationModal";

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* MAP SECTION */}
      <View style={{ height: responsiveHeight(45) }}>
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

        {/* DRAWER HEADER */}
        <View
          style={{
            position: "absolute",
            top: responsiveHeight(2),
            left: responsiveWidth(4),
            right: responsiveWidth(4),
            zIndex: 10,
          }}
        >
          <DrawerHeader />
        </View>

        {/* SEARCH BAR */}
        <View
          style={{
            position: "absolute",
            bottom: responsiveHeight(2),
            left: responsiveWidth(4),
            right: responsiveWidth(4),
            zIndex: 10,
          }}
        >
          <SearchBar />
        </View>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          borderTopLeftRadius: responsiveHeight(2),
          borderTopRightRadius: responsiveHeight(2),
        }}
        contentContainerStyle={{ paddingBottom: responsiveHeight(5) }}
      >
        {/* QUICK ACCESS */}
        <View
          style={{
            paddingHorizontal: responsiveWidth(4),
            marginTop: responsiveHeight(2),
            marginBottom: responsiveHeight(2),
          }}
        >
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.white,
              borderRadius: responsiveHeight(2),
              padding: responsiveHeight(1),
              width: "100%",
              maxWidth: responsiveWidth(50),
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              shadowOffset: { width: 0, height: 3 },
              elevation: 3,
              flexDirection: "column",
              gap: 6,
            }}
          >
            {/* TOP ROW */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
              >
                <Ionicons
                  name="home"
                  size={responsiveFontSize(2)}
                  color={COLORS.black}
                />
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    fontSize: responsiveFontSize(1.5),
                  }}
                >
                  HOME
                </Text>
              </View>

              <Ionicons
                name="bookmark-outline"
                size={responsiveFontSize(2)}
                color={COLORS.black}
              />
            </View>

            {/* ADDRESS */}
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(1.4),
                color: "#777",
              }}
            >
              University Rd
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(1.3),
                color: "#777",
                fontFamily: FONTS.regular,
              }}
            >
              Karachi
            </Text>
          </TouchableOpacity>
        </View>

        {/* SERVICES */}
        <Services />
      </ScrollView>

      {/* LOCATION MODAL */}
      <LocationModal />
    </SafeAreaView>
  );
};

export default HomeScreen;
