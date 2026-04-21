import React, { useState } from "react";
import { View, ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import ShopHeader from "../components/ShopHeader";
import ProductItem from "../components/ProductItem";
import CartStrip from "../components/CartStrip";
import CategoryTabs from "../components/CategoryTabs";
import BackBtn from "../components/BackBtn";

const ShopDetailScreen = ({ route }) => {
  const { shop } = route.params || {
    shop: {
      name: "Golden Grain Bakery",
      rating: 4.8,
      image: require("../../assets/bakery2.webp"),
      products: [
        {
          id: 1,
          name: "Sourdough Loaf",
          image: require("../../assets/bread.png"),
        },
        { id: 2, name: "Baguette", image: require("../../assets/bread.png") },
        {
          id: 3,
          name: "Olive Ciabatta",
          image: require("../../assets/bread.png"),
        },
        { id: 4, name: "Croissant", image: require("../../assets/bread.png") },
      ],
    },
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* SHOP HEADER */}
        <View style={{ left: responsiveWidth(4) }}>
          <BackBtn />
        </View>
        <ShopHeader shop={shop} />

        {/* CATEGORIES TABS */}
        <View style={styles.categoriesContainer}>
          <CategoryTabs />
        </View>

        {/* PRODUCT LIST */}
        <View style={styles.productList}>
          {shop.products.map((product) => (
            <ProductItem key={product.id} product={product} />
          ))}
          {/* Add more duplicate products for scrolling demo if needed */}
          {shop.products.map((product) => (
            <ProductItem key={product.id + "_copy"} product={product} />
          ))}
        </View>
      </ScrollView>

      {/* BOTTOM CART STRIP */}
      <CartStrip />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: responsiveHeight(12), // Space for cart strip
  },
  categoriesContainer: {
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(1),
  },
  productList: {
    marginTop: responsiveHeight(1),
  },
});

export default ShopDetailScreen;
