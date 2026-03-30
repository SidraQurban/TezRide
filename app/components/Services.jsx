import { View, Text, Image, TouchableOpacity, Modal } from "react-native";
import React, { useState } from "react";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, SIZES } from "../constants";
import { FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";

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
    screen: "Delivery",
  },
  {
    id: 3,
    title: "Hire Driver",
    image: require("../../assets/rentals.png"),
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
];

const Services = () => {
  const navigation = useNavigation();
  const [modalVisible, setModalVisible] = useState(false);

  const handlePress = (item) => {
    navigation.navigate(item.screen);
    // if (item.title === "Rentals") {
    //   setModalVisible(true);
    // } else {
    //   navigation.navigate(item.screen);
    // }
  };

  return (
    <View>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
          padding: SIZES.base * 2,
          marginTop: -20,
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
              {item.title}
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

      {/* Rental Modal */}
      {/* <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <RentalModal closeModal={() => setModalVisible(false)} />
      </Modal> */}
    </View>
  );
};

export default Services;
