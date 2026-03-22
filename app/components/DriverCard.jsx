import React from "react";
import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveWidth,
  responsiveHeight,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { drivers } from "../data/data";
import { FONTS } from "../constants/theme";

const SingleDriverCard = ({ item }) => (
  <View
    style={{
      backgroundColor: "#fff",
      borderRadius: 18,
      flexDirection: "row",
      padding: responsiveWidth(3.5),
      alignItems: "center",
      elevation: 8,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      marginRight: responsiveWidth(3),
      width: responsiveWidth(85),
    }}
  >
    <Image
      source={{ uri: item.image }}
      style={{
        width: responsiveWidth(14),
        height: responsiveWidth(14),
        borderRadius: 12,
        marginRight: responsiveWidth(3),
      }}
    />

    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontSize: responsiveFontSize(2),
          fontFamily: FONTS.semiBold,
          color: "#000",
        }}
      >
        {item.name}
      </Text>

      <Text
        style={{
          fontSize: responsiveFontSize(1.6),
          color: "#777",
          marginTop: responsiveHeight(0.4),
          fontFamily: FONTS.regular,
        }}
      >
        ⭐ {item.rating} ({item.reviews})
      </Text>

      <Text
        style={{
          fontSize: responsiveFontSize(1.6),
          color: "#777",
          fontFamily: FONTS.regular,
        }}
      >
        {item.address}
      </Text>

      <Text
        style={{
          fontSize: responsiveFontSize(1.7),
          fontFamily: FONTS.medium,
          color: "#E53935",
          marginTop: responsiveHeight(0.4),
        }}
      >
        {item.plate}
      </Text>
    </View>

    <TouchableOpacity activeOpacity={0.7}>
      <Ionicons
        name="heart-outline"
        size={responsiveFontSize(2.6)}
        color="#999"
      />
    </TouchableOpacity>
  </View>
);

const DriverCard = () => (
  <FlatList
    data={drivers}
    horizontal
    showsHorizontalScrollIndicator={false}
    contentContainerStyle={{ paddingLeft: responsiveWidth(4) }}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <SingleDriverCard item={item} />}
  />
);

export default DriverCard;
