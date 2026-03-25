import React from "react";
import { View, Text, ScrollView } from "react-native";
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

        {/* DRAWER HEADER - TOP */}
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

        {/* SEARCH BAR - BOTTOM OF MAP */}
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

      {/* QUICK ACCESS + SERVICES */}
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: COLORS.white,
          borderTopLeftRadius: responsiveHeight(2),
          borderTopRightRadius: responsiveHeight(2),
        }}
        contentContainerStyle={{ paddingBottom: responsiveHeight(5) }}
      >
        {/* Quick Access */}
        <View
          style={{
            paddingHorizontal: responsiveWidth(4),
            marginTop: responsiveHeight(2),
            marginBottom: responsiveHeight(2),
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              borderRadius: responsiveHeight(2),
              padding: responsiveHeight(1),
              width: "100%",
              maxWidth: responsiveWidth(50),
              shadowColor: "#000",
              shadowOpacity: 0.1,
              shadowRadius: 5,
              elevation: 3,
              flexDirection: "column", // column so address is below
              gap: 6,
            }}
          >
            {/* TOP ROW: HOME + BOOKMARK */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between", // pushes bookmark to right
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

              {/* Bookmark icon on the right */}
              <Ionicons
                name="bookmark-outline"
                size={responsiveFontSize(2)}
                color={COLORS.black}
              />
            </View>

            {/* ADDRESS BELOW */}
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
          </View>
        </View>

        {/* SERVICES */}
        <Services />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
