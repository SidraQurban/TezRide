import React from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import BackBtn from "../components/BackBtn";
import Categories from "../components/Categories";
import ShopCard from "../components/ShopCard";
import { shopsData } from "../data/data";

const ShopsScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* HEADER */}
      <View style={{ backgroundColor: COLORS.background, zIndex: 10 }}>
        <View style={{ left: responsiveWidth(4) }}>
          <BackBtn />
        </View>

        {/* SEARCH */}
        <View
          style={{
            marginHorizontal: responsiveWidth(4),
            marginTop: responsiveHeight(1),
            flexDirection: "row",
            alignItems: "center",
            borderWidth: 1.5,
            borderColor: COLORS.primary,
            borderRadius: responsiveHeight(3),
            paddingLeft: responsiveWidth(3),
            height: responsiveHeight(6),
            backgroundColor: "#fff",
          }}
        >
          <TouchableOpacity
            style={{ justifyContent: "center", alignItems: "center" }}
          >
            <Ionicons name="search" size={22} color={COLORS.primary} />
          </TouchableOpacity>
          <TextInput
            placeholder="Search items or stores"
            placeholderTextColor="#999"
            style={{
              flex: 1,
              marginLeft: responsiveWidth(4),
              fontFamily: FONTS.regular,
              fontSize: responsiveFontSize(1.8),
              includeFontPadding: false,
              textAlignVertical: "center",
              paddingVertical: 0,
            }}
          />
        </View>

        <View style={{ marginBottom: responsiveHeight(2) }}>
          <Categories />
        </View>
      </View>

      {/* SHOP LIST */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: responsiveHeight(5) }} // important for spacing at bottom
      >
        {/* <Text
          style={{
            marginTop: responsiveHeight(2),
            marginHorizontal: responsiveWidth(4),
            fontSize: responsiveFontSize(2),
            fontFamily: FONTS.bold,
          }}
        >
          Shop List
        </Text> */}

        {shopsData.map((shop) => (
          <ShopCard key={shop.id} shop={shop} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

export default ShopsScreen;
