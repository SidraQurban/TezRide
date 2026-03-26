import React, { useState } from "react";
import { View, Text, TouchableOpacity, FlatList, Image } from "react-native";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const paymentMethods = [
  {
    id: "easypaisa",
    name: "Easy Paisa",
    icon: require("../../assets/easypaisa.png"),
  },
  {
    id: "jazzcash",
    name: "Jazz Cash",
    icon: require("../../assets/jazzcash.png"),
  },
  {
    id: "card",
    name: "**** **** **** 4679",
    icon: require("../../assets/card.png"),
  },
  {
    id: "cash",
    name: "Cash (On Arrival)",
    icon: require("../../assets/pkr.png"),
  },
];

const PaymentOption = () => {
  const [selectedPayment, setSelectedPayment] = useState(null);
  const navigation = useNavigation();

  const renderPaymentOption = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedPayment(item.id)}
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
            backgroundColor:
              selectedPayment === item.id ? COLORS.secondary : COLORS.active,

            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={item.icon}
            style={{
              width: responsiveWidth(9),
              height: responsiveWidth(9),
              borderRadius:
                item.id === "card" || item.id === "cash"
                  ? 0
                  : responsiveWidth(4),
              resizeMode: "contain",
            }}
          />
        </View>
        <Text
          style={{
            marginLeft: responsiveWidth(4),
            fontFamily: FONTS.semiBold,
            fontSize: responsiveFontSize(2),
          }}
        >
          {item.name}
        </Text>
      </View>

      <View
        style={{
          width: responsiveWidth(5),
          height: responsiveWidth(5),
          borderRadius: responsiveWidth(2.5),
          borderWidth: 2,
          borderColor: selectedPayment === item.id ? COLORS.secondary : "#ccc",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {selectedPayment === item.id && (
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
    <View>
      <FlatList
        data={paymentMethods}
        renderItem={renderPaymentOption}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingVertical: responsiveHeight(2) }}
      />

      <TouchableOpacity
        style={{
          backgroundColor: "#fff3e0",
          marginHorizontal: responsiveWidth(4),
          paddingVertical: responsiveHeight(2),
          borderRadius: responsiveWidth(3),
          justifyContent: "center",
          alignItems: "center",
          marginBottom: responsiveHeight(2),
        }}
      >
        <Text
          style={{
            color: COLORS.secondary,
            fontFamily: FONTS.semiBold,
            fontSize: responsiveFontSize(2),
          }}
        >
          Add New Card
        </Text>
      </TouchableOpacity>

      <View
        style={{
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(13),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("ConfirmRide")}
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
              Continue
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default PaymentOption;
