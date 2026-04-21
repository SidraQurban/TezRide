import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants/theme";

const ProductItem = ({ product }) => {
  return (
    <View style={styles.container}>
      <View style={styles.imageBox}>
        <Image source={product.image} style={styles.image} />
      </View>
      <View style={styles.info}>
        <Text style={styles.name}>{product.name}</Text>
        <Text style={styles.desc}>Artisanal, 500g</Text>
        <Text style={styles.price}>Rs. 150.00</Text>
      </View>
      <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
        <Text style={styles.addText}>Add</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "white",
    marginHorizontal: responsiveWidth(4),
    marginBottom: responsiveHeight(1.5),
    padding: responsiveWidth(3),
    borderRadius: 15,
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  imageBox: {
    width: responsiveWidth(18),
    height: responsiveWidth(18),
    borderRadius: 12,
    backgroundColor: "#F8F8F8",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  image: {
    width: "80%",
    height: "80%",
    resizeMode: "contain",
  },
  info: {
    flex: 1,
    marginLeft: responsiveWidth(4),
  },
  name: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.9),
    color: COLORS.black,
  },
  desc: {
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.4),
    color: "gray",
    marginTop: 1,
  },
  price: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.8),
    color: COLORS.primary,
    marginTop: 4,
  },
  addButton: {
    backgroundColor: COLORS.active,
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  addText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.6),
  },
});

export default ProductItem;

