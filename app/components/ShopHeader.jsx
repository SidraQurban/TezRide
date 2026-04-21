import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants/theme";
import BackBtn from "./BackBtn";

const ShopHeader = ({ shop }) => {
  return (
    <View style={styles.container}>
      {/* SHOP BANNER IMAGE */}
      <View style={styles.bannerContainer}>
        <Image source={shop.image} style={styles.bannerImage} />
      </View>

      {/* SHOP SPECIFIC INFO BAR */}
      <View style={styles.shopInfoBar}>
        <View style={styles.infoRow}>
          <Text style={styles.shopName}>{shop.name}</Text>
          <View style={styles.ratingBox}>
            <Ionicons name="star" size={14} color={COLORS.secondary} />
            <Text style={styles.ratingText}>{shop.rating}</Text>
          </View>
        </View>
        <Text style={styles.subText}>
          Bakery & Cafe • 15-25 min •
          <Text style={styles.statusText}> Open</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
  },
  bannerContainer: {
    width: "100%",
    height: responsiveHeight(18),
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  shopInfoBar: {
    marginHorizontal: responsiveWidth(4),
    marginTop: -responsiveHeight(4), // Overlap effect
    padding: responsiveWidth(4),
    backgroundColor: "white",
    borderRadius: 15,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  shopName: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.2),
    color: COLORS.black,
  },
  ratingBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF9E6",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  ratingText: {
    marginLeft: 4,
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.5),
    color: COLORS.secondary,
  },
  subText: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    color: "gray",
  },
  statusText: {
    color: "green",
    fontFamily: FONTS.bold,
  },
});

export default ShopHeader;
