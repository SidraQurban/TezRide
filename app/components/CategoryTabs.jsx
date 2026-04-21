import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants/theme";

const CategoryTabs = ({ categories = ["All", "Bread", "Cakes", "Drinks", "Snacks"] }) => {
  const [selected, setSelected] = useState(categories[0]);

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {categories.map((item, index) => {
          const isSelected = selected === item;
          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelected(item)}
              activeOpacity={0.8}
              style={[
                styles.tab,
                isSelected && styles.selectedTab
              ]}
            >
              <Text
                style={[
                  styles.tabText,
                  isSelected && styles.selectedTabText
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: responsiveHeight(1),
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(4),
  },
  tab: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    backgroundColor: "#F0F0F0",
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  selectedTab: {
    backgroundColor: COLORS.active,
    borderColor: COLORS.primary,
  },
  tabText: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.7),
    color: "#777",
  },
  selectedTabText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
});

export default CategoryTabs;

