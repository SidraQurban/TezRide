import React from "react";
import { View, Text, Image } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { FONTS } from "../constants/theme";

const Shops = ({ shop }) => {
  return (
    <View
      style={{
        marginHorizontal: responsiveWidth(4),
        marginTop: responsiveHeight(4),
        marginBottom: responsiveHeight(2),
        backgroundColor: "#fff",
        borderRadius: responsiveHeight(2),
        padding: responsiveWidth(3),
        elevation: 3,
      }}
    >
      {/* SHOP IMAGE */}
      <Image
        source={shop.image}
        style={{
          width: "100%",
          height: responsiveHeight(15),
          borderRadius: responsiveHeight(2),
        }}
        resizeMode="cover"
      />

      {/* INFO */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: responsiveHeight(1),
        }}
      >
        <Text style={{ fontFamily: FONTS.bold, fontSize: responsiveHeight(2) }}>
          {shop.name}
        </Text>
        <Text style={{ color: "#FFB800", fontSize: responsiveHeight(2) }}>
          ⭐ {shop.rating}
        </Text>
      </View>

      {/* PRODUCTS */}
      <Text
        style={{
          marginTop: responsiveHeight(1),
          color: "#666",
          fontSize: responsiveHeight(1.5),
        }}
      >
        Product Preview
      </Text>

      <View
        style={{
          flexDirection: "row",
          marginTop: responsiveHeight(1),
          justifyContent: "space-between",
        }}
      >
        {shop.products.map((product) => (
          <View key={product.id} style={{ alignItems: "center" }}>
            <View
              style={{
                width: responsiveWidth(14),
                height: responsiveWidth(14),
                backgroundColor: "#F3F3F3",
                borderRadius: responsiveWidth(3),
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text style={{ fontSize: responsiveHeight(2) }}>
                {product.emoji}
              </Text>
            </View>
            <Text style={{ fontSize: responsiveHeight(1.5), marginTop: 4 }}>
              {product.name}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

export default Shops;
