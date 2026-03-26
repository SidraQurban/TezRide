import { View, Text, TouchableOpacity, FlatList } from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { promoData } from "../data/data";

const PromoScreen = () => {
  const navigation = useNavigation();
  const [selectedPromo, setSelectedPromo] = useState(null);

  const renderPromo = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedPromo(item.id)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        marginHorizontal: responsiveWidth(4),
        marginVertical: responsiveHeight(1),
        padding: responsiveWidth(4),
        borderRadius: responsiveWidth(3),
        elevation: 2,
      }}
    >
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: responsiveWidth(12),
            height: responsiveWidth(12),
            borderRadius: responsiveWidth(6),
            backgroundColor: item.color,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="pricetag-outline" size={24} color="#fff" />
        </View>
        <View style={{ marginLeft: responsiveWidth(4) }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(2),
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              fontFamily: FONTS.regular,
              fontSize: responsiveFontSize(1.5),
              color: "gray",
            }}
          >
            {item.desc}
          </Text>
        </View>
      </View>
      <View
        style={{
          width: responsiveWidth(5),
          height: responsiveWidth(5),
          borderRadius: responsiveWidth(2.5),
          borderWidth: 2,
          borderColor: selectedPromo === item.id ? COLORS.secondary : "#ccc",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selectedPromo === item.id && (
          <View
            style={{
              width: responsiveWidth(2.5),
              height: responsiveWidth(2.5),
              borderRadius: responsiveWidth(1.25),
              backgroundColor: COLORS.secondary,
            }}
          />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(2),
          marginBottom: responsiveHeight(2),
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={25} color={COLORS.secondary} />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: responsiveFontSize(2.2),
            fontFamily: FONTS.semiBold,
            marginLeft: responsiveWidth(4),
          }}
        >
          Add Promo
        </Text>
      </View>

      {/* Promo List */}
      <FlatList
        data={promoData}
        renderItem={renderPromo}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: responsiveHeight(2) }}
      />

      {/* Apply Promo Button */}
      <View
        style={{
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(2),
          paddingBottom: responsiveHeight(2),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("PaymentMethod")}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: "100%",
              height: responsiveHeight(7),
              borderRadius: responsiveWidth(10),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(2),
              }}
            >
              Apply Promo
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default PromoScreen;
