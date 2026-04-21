import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants/theme";
import { Ionicons } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const ShopCard = ({ shop }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language?.startsWith("ur");

  return (
    <TouchableOpacity
      // onPress={() => navigation.navigate("ShopDetail", { shop })}
      activeOpacity={0.95}
      style={{
        marginHorizontal: responsiveWidth(4),
        marginTop: responsiveHeight(0.5),
        marginBottom: responsiveHeight(2),
        backgroundColor: COLORS.white,
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

      {/* SHOP INFO */}
      <View
        style={{
          flexDirection: isUrdu ? "row-reverse" : "row",
          justifyContent: "space-between",
          marginTop: responsiveHeight(1),
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: responsiveHeight(1.9),
            textAlign: isUrdu ? "right" : "left",
          }}
        >
          {t(shop.name)}
        </Text>
        {/* RATING + icon */}
        <View style={{ flexDirection: isUrdu ? "row-reverse" : "row", alignItems: "center" }}>
          <Ionicons
            name="star"
            size={responsiveHeight(2)}
            color={COLORS.secondary}
          />
          <Text
            style={{
              color: COLORS.secondary,
              fontSize: responsiveHeight(1.9),
              marginHorizontal: 4,
              fontFamily: FONTS.medium,
              includeFontPadding: false,
            }}
          >
            {shop.rating}
          </Text>
        </View>
      </View>

      {/* PRODUCTS */}
      <Text
        style={{
          marginTop: responsiveHeight(1),
          color: "#666",
          fontSize: responsiveHeight(1.5),
          fontFamily: FONTS.medium,
          includeFontPadding: false,
          textAlign: isUrdu ? "right" : "left",
        }}
      >
        {t("product_preview")}
      </Text>

      <View
        style={{
          flexDirection: isUrdu ? "row-reverse" : "row",
          marginTop: responsiveHeight(1),
          justifyContent: "space-between",
        }}
      >
        {shop.products.map((product) => (
          <View key={product.id} style={{ alignItems: "center" }}>
            {/* PRODUCT IMAGE BOX */}
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
              <Image
                source={product.image}
                style={{
                  width: responsiveWidth(15),
                  height: responsiveWidth(15),
                }}
                resizeMode="contain"
              />
            </View>

            {/* PRODUCT NAME */}
            <Text
              style={{
                fontSize: responsiveHeight(1.4),
                marginTop: 4,
                fontFamily: FONTS.regular,
                includeFontPadding: false,
                textAlign: "center",
              }}
            >
              {t(product.name)}
            </Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );
};

export default ShopCard;
