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
import { Image } from "react-native";
import AppHeader from "../components/AppHeader";

const HomeScreen = () => {
  return (
    <View>
      {/* Drawer + logo */}
      <AppHeader />
      {/* Image section */}
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
      {/* Searchbar */}
      <SearchBar />
      {/* Services */}
      <View
        style={{
          marginTop: responsiveHeight(2),
        }}
      >
        <Services />
      </View>
      <LocationModal />
    </View>
  );
};

export default HomeScreen;
