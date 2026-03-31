import React from "react";
import { View, ScrollView, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import AppHeader from "../components/AppHeader";
import Services from "../components/Services";
import SearchBar from "../components/SearchBar";
import LocationModal from "../components/LocationModal";

const HomeScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Fixed Header */}
      <AppHeader />

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: responsiveHeight(5), // optional bottom padding
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Image */}
        <View
          style={{
            height: responsiveHeight(25),
            backgroundColor: COLORS.backgroundimg,
          }}
        >
          <Image
            source={require("../../assets/banner1.png")}
            style={{
              width: responsiveWidth(95),
              height: responsiveHeight(25),
              resizeMode: "contain",
              alignSelf: "center",
            }}
          />
        </View>

        {/* Search Bar */}
        <View>
          <SearchBar />
        </View>

        {/* Services */}
        <View style={{ marginTop: responsiveHeight(2) }}>
          <Services />
        </View>

        {/* Location Modal */}
        <LocationModal />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
