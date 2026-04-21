import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants/theme";
import { LinearGradient } from "expo-linear-gradient";

const CartStrip = () => {
  return (
    <View style={styles.container}>
      <TouchableOpacity activeOpacity={0.8}>
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.cartButton}
        >
          <View style={styles.left}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>3</Text>
            </View>
            <Text style={styles.cartText}>View Cart</Text>
          </View>
          <Text style={styles.priceText}>Rs. 780.00</Text>
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: responsiveHeight(2),
    left: responsiveWidth(4),
    right: responsiveWidth(4),
  },
  cartButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: responsiveHeight(1.5),
    paddingHorizontal: responsiveWidth(6),
    borderRadius: responsiveWidth(10),
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
  },
  badge: {
    backgroundColor: "white",
    width: 22,
    height: 22,
    borderRadius: 11,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  badgeText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.4),
  },
  cartText: {
    color: "white",
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.9),
  },
  priceText: {
    color: "white",
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.9),
  },
});

export default CartStrip;

