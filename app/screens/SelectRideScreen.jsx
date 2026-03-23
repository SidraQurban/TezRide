import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  FlatList,
} from "react-native";
import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";

import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";

// Updated car options with iconLib for Rickshaw
const carOptions = [
  {
    id: "1",
    type: "Bike",
    price: 150,
    nearby: 7,
    icon: "bicycle",
    iconLib: "Ionicons",
  },
  {
    id: "2",
    type: "Rickshaw",
    price: 200,
    nearby: 19,
    icon: "rickshaw",
    iconLib: "MaterialCommunityIcons",
  },
  {
    id: "3",
    type: "Standard",
    price: 280,
    nearby: 12,
    icon: "car",
    iconLib: "Ionicons",
  },
  {
    id: "4",
    type: "Premium",
    price: 330,
    nearby: 4,
    icon: "car-sport",
    iconLib: "Ionicons",
  },
];

const SelectRideScreen = () => {
  const navigation = useNavigation();
  const [selectedCar, setSelectedCar] = useState(null);
  const [promoCode, setPromoCode] = useState("");

  const selectedPrice = selectedCar
    ? carOptions.find((c) => c.id === selectedCar).price
    : 0;

  const renderCarOption = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedCar(item.id)}
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
      {/* LEFT */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: responsiveWidth(12),
            height: responsiveWidth(12),
            borderRadius: responsiveWidth(6),
            backgroundColor: COLORS.secondary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {item.iconLib === "MaterialCommunityIcons" ? (
            <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
          ) : (
            <Ionicons name={item.icon} size={24} color="#fff" />
          )}
        </View>

        <View style={{ marginLeft: responsiveWidth(4) }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(2),
            }}
          >
            {item.type}
          </Text>
          <Text style={{ color: "gray", fontSize: responsiveFontSize(1.5) }}>
            {item.nearby} nearby
          </Text>
        </View>
      </View>

      {/* RIGHT */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            fontFamily: FONTS.semiBold,
            fontSize: responsiveFontSize(2),
          }}
        >
          Rs.{item.price}
        </Text>

        <View
          style={{
            width: responsiveWidth(5),
            height: responsiveWidth(5),
            borderRadius: responsiveWidth(2.5),
            borderWidth: 2,
            borderColor: selectedCar === item.id ? COLORS.secondary : "#ccc",
            marginLeft: responsiveWidth(2),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedCar === item.id && (
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
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#f5f5f5" }}>
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(5),
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
          Select Car
        </Text>
      </View>

      {/* CAR LIST */}
      <FlatList
        data={carOptions}
        renderItem={renderCarOption}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: responsiveHeight(2) }}
      />

      {/* PROMO CODE */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(1),
        }}
      >
        <TextInput
          placeholder="Enter your promo code"
          value={promoCode}
          onChangeText={setPromoCode}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingHorizontal: responsiveWidth(4),
            paddingVertical: responsiveHeight(1.5),
            borderRadius: responsiveWidth(3),
          }}
        />

        <TouchableOpacity
          style={{
            marginLeft: responsiveWidth(2),
            width: responsiveWidth(12),
            height: responsiveWidth(12),
            borderRadius: responsiveWidth(6),
            backgroundColor: COLORS.secondary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* BOTTOM SECTION */}
      <SafeAreaView
        edges={["bottom"]}
        style={{
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(3),
          paddingBottom: responsiveHeight(2),
        }}
      >
        {/* ROW */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: responsiveHeight(2),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>4.5 Km</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>4 mins</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="card-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>
              Rs. {selectedPrice}.00
            </Text>
          </View>
        </View>

        {/* CONTINUE BUTTON */}
        <TouchableOpacity activeOpacity={0.8}>
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
      </SafeAreaView>
    </View>
  );
};

export default SelectRideScreen;
