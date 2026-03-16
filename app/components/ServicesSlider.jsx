import React, { useState } from "react";
import {
  ScrollView,
  TouchableOpacity,
  Image,
  Text,
  Modal,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../constants";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";

const ServicesSlider = () => {
  const navigation = useNavigation();
  const [selectedService, setSelectedService] = useState("ride");
  const [showRentalModal, setShowRentalModal] = useState(false);

  // **Service data fully inside component**
  const services = [
    {
      id: "bike",
      label: "BIKE",
      image: require("../../assets/rentals.png"),
      screen: "Ride",
    },
    {
      id: "car",
      label: "CAR",
      image: require("../../assets/rentals.png"),
      screen: "Ride",
    },
    {
      id: "rickshaw",
      label: "RICKSHAW",
      image: require("../../assets/rentals.png"),
      screen: "Ride",
    },

    {
      id: "delivery",
      label: "DELIVERY",
      image: require("../../assets/delivery.png"),
      screen: "Delivery",
    },
    {
      id: "shops",
      label: "SHOPS",
      image: require("../../assets/rentals.png"),
      screen: "Shop",
    },
    {
      id: "rentals",
      label: "RENTALS",
      image: require("../../assets/rentals.png"),
      screen: "Rentals",
    },
  ];

  const handleServicePress = (service) => {
    setSelectedService(service.id);
    if (service.id === "rentals") {
      setShowRentalModal(true);
    } else {
      navigation.navigate(service.screen);
    }
  };

  return (
    <>
      {/* Services Horizontal Slider */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: responsiveHeight(1) }}
      >
        {services.map((service) => {
          const active = selectedService === service.id;
          return (
            <TouchableOpacity
              key={service.id}
              style={[
                {
                  height: responsiveHeight(10),
                  width: responsiveWidth(28),
                  backgroundColor: COLORS.serviceBg,
                  borderRadius: 18,
                  paddingVertical: responsiveHeight(1),
                  alignItems: "center",
                  marginRight: responsiveWidth(3),
                },
                active && {
                  backgroundColor: COLORS.active,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                },
              ]}
              onPress={() => handleServicePress(service)}
            >
              <Image
                source={service.image}
                style={{ width: 50, height: 45 }}
                resizeMode="contain"
              />
              <Text
                style={{
                  marginTop: 6,
                  fontSize: responsiveFontSize(1.5),
                  color: "#777",
                  fontWeight: "600",
                }}
              >
                {service.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Rental Modal */}
      <Modal visible={showRentalModal} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            justifyContent: "flex-end",
            backgroundColor: "rgba(0,0,0,0.4)",
          }}
        >
          <View
            style={{
              backgroundColor: COLORS.white,
              padding: responsiveHeight(3),
              borderTopLeftRadius: 25,
              borderTopRightRadius: 25,
            }}
          >
            <View
              style={{
                alignSelf: "center",
                width: 40,
                height: 4,
                backgroundColor: "#ccc",
                borderRadius: 2,
                marginBottom: 20,
              }}
            />

            <Text
              style={{
                fontSize: responsiveFontSize(2.2),
                fontWeight: "600",
                textAlign: "center",
                marginBottom: responsiveHeight(3),
              }}
            >
              When do you want your rental booking?
            </Text>

            <TouchableOpacity
              style={{
                backgroundColor: "#FFF4EB",
                paddingVertical: responsiveHeight(1.8),
                borderRadius: 30,
                alignItems: "center",
                marginBottom: responsiveHeight(2),
              }}
            >
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: responsiveFontSize(1.9),
                  fontWeight: "600",
                }}
              >
                Schedule for later
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                backgroundColor: COLORS.active,
                paddingVertical: responsiveHeight(1.8),
                borderRadius: 30,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: responsiveFontSize(2),
                  fontWeight: "600",
                }}
              >
                Book now
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowRentalModal(false)}
              style={{
                position: "absolute",
                top: 10,
                right: 15,
              }}
            >
              <Ionicons name="close" size={22} />
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default ServicesSlider;
