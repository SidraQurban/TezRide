import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import BackBtn from "../components/BackBtn";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import { categoriesData } from "../data/data";

const Categories = () => {
  const [selectedCategory, setSelectedCategory] = useState("Food");

  return (
    <View style={{ marginTop: responsiveHeight(2) }}>
      {/* CATEGORIES */}
      {/* <Text
        style={{
          marginTop: responsiveHeight(2),
          marginHorizontal: responsiveWidth(4),
          fontSize: responsiveFontSize(1.9),
          fontFamily: FONTS.semiBold,
        }}
      >
        Categories
      </Text> */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingRight: responsiveWidth(4), // ✅ end spacing fix
        }}
        style={{ marginTop: responsiveHeight(1) }}
      >
        {categoriesData.map((item, index) => {
          const isSelected = selectedCategory === item;

          return (
            <TouchableOpacity
              key={index}
              onPress={() => setSelectedCategory(item)}
              style={{
                marginLeft: responsiveWidth(4),
                paddingHorizontal: responsiveWidth(4),
                paddingVertical: responsiveHeight(0.8),
                borderRadius: responsiveHeight(3),
                backgroundColor: isSelected ? "#FF6B00" : "#EDEDED",
              }}
            >
              <Text
                style={{
                  color: isSelected ? "#fff" : "#333",
                }}
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

export default Categories;
