import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import React, { useState } from "react";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, SIZES } from "../constants";
import { FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { useRide } from "../context/RideContext";

const servicesData = [
  {
    id: 1,
    title: "Ride",
    image: require("../../assets/ride.png"),
    bgColor: "#FFE5E5",
    screen: "Search",
  },
  {
    id: 2,
    title: "Delivery",
    image: require("../../assets/delivery.png"),
    bgColor: "#FDE8D7",
    screen: "Cargo",
  },
  {
    id: 3,
    title: "Rent Driver",
    image: require("../../assets/drivers.png"),
    bgColor: "#DFF3E3",
    screen: "HireDriver",
  },
  {
    id: 4,
    title: "Shop",
    image: require("../../assets/shop.png"),
    bgColor: "#E6E6FA",
    screen: "Shops",
  },
  // {
  //   id: 5,
  //   title: "Cargo",
  //   image: require("../../assets/cargo.png"),
  //   bgColor: "#FFF4E1",
  //   screen: "Cargo",
  // },
  // {
  //   id: 6,
  //   title: "Grocery",
  //   image: require("../../assets/grocery.png"),
  //   bgColor: "#E0F7FA",
  //   screen: "Grocery",
  // },
];

const Services = () => {
  const navigation = useNavigation();
  const { activeRide } = useRide();
  const { t } = useTranslation();

  const handlePress = (item) => {
    // If it's a normal ride service and we already have an active ride, redirect to it
    if (item.title === "Ride" && activeRide?.rideId) {
      navigation.navigate("SearchingDirection", {
        rideId: activeRide.rideId,
        recoveredStatus: activeRide.status,
        pickup: activeRide.pickup,
        destination: activeRide.destination,
        driverInfo: activeRide.assignedDriver,
        price: activeRide.price,
        vehicleType: activeRide.vehicleType,
        serviceType: activeRide.serviceType || "ride"
      });
      return;
    }
    
    navigation.navigate(item.screen);
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          padding: SIZES.base * 2,
          marginTop: -15,
        }}
      >
        {servicesData.map((item) => (
          <TouchableOpacity
            key={item.id}
            onPress={() => handlePress(item)}
            style={{
              width: responsiveWidth(44), // 2 items per row
              height: 120,
              backgroundColor: item.bgColor,
              borderRadius: 16,
              padding: 12,
              marginBottom: 12,
              justifyContent: "space-between",
            }}
          >
            {/* Title */}
            <Text
              style={{
                fontSize: 16,
                color: "#333",
                fontFamily: FONTS.semiBold,
              }}
            >
              {t(item.title.toLowerCase().replace(" ", "_"))}
            </Text>

            {/* Image */}
            <Image
              source={item.image}
              style={{
                width: "100%",
                height: responsiveHeight(8),
                resizeMode: "contain",
              }}
            />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default Services;
