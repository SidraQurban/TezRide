import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, Image } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import { LinearGradient } from "expo-linear-gradient";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";

const RideOptionsPanel = () => {
  const navigation = useNavigation();

  const [selectedService, setSelectedService] = useState("ride");
  const [pickup, setPickup] = useState("");
  const [dropoff, setDropoff] = useState("");

  const services = [
    {
      id: "delivery",
      label: "DELIVERY",
      image: require("../../assets/delivery.png"),
      screen: "Delivery",
    },
    {
      id: "ride",
      label: "RIDE",
      image: require("../../assets/rentals.png"),
      screen: "Ride",
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
    navigation.navigate(service.screen);
  };

  return (
    <View
      style={{
        bottom: 0,
        width: "100%",
        paddingHorizontal: responsiveWidth(2),
        position: "absolute",
      }}
    >
      {/* Discount Banner */}
      <LinearGradient
        colors={[COLORS.primary, COLORS.secondary]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={{
          flexDirection: "row",
          alignItems: "center",
          padding: responsiveHeight(1.2),
          borderRadius: responsiveHeight(1.5),
          marginBottom: responsiveHeight(0.5),
        }}
      >
        <Ionicons name="pricetag" size={20} color={COLORS.secondary} />

        <Text
          style={{
            color: COLORS.white,
            marginLeft: responsiveWidth(2),
            fontSize: responsiveFontSize(1.5),
            flex: 1,
          }}
        >
          Get a 30% DISCOUNT on Your Next Car Ride. Book Now!
        </Text>
      </LinearGradient>

      {/* Pickup / Dropoff */}
      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: responsiveHeight(2),
          padding: responsiveHeight(0.8),
          marginBottom: SIZES.base,
          borderWidth: 1,
          borderColor: COLORS.primary,
        }}
      >
        {/* Pickup */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: responsiveHeight(1.2),
              height: responsiveHeight(1.2),
              borderRadius: responsiveHeight(0.7),
              backgroundColor: COLORS.secondary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: responsiveHeight(0.6),
                height: responsiveHeight(0.6),
                borderRadius: responsiveHeight(0.3),
                backgroundColor: COLORS.white,
              }}
            />
          </View>

          <TextInput
            placeholder="Enter Pickup"
            value={pickup}
            onChangeText={setPickup}
            style={{
              flex: 1,
              marginLeft: responsiveWidth(2.3),
              fontSize: responsiveFontSize(1.8),
            }}
          />
        </View>

        {/* separator */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Entypo name="dots-three-vertical" size={16} color={COLORS.icon} />

          <View
            style={{
              height: 1,
              width: responsiveWidth(73),
              backgroundColor: COLORS.num,
              marginHorizontal: 8,
            }}
          />

          <Ionicons name="swap-vertical" size={18} color={COLORS.icon} />
        </View>

        {/* Dropoff */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              width: responsiveHeight(1.2),
              height: responsiveHeight(1.2),
              borderRadius: responsiveHeight(0.7),
              backgroundColor: COLORS.secondary,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                width: responsiveHeight(0.6),
                height: responsiveHeight(0.6),
                borderRadius: responsiveHeight(0.3),
                backgroundColor: COLORS.white,
              }}
            />
          </View>

          <TextInput
            placeholder="Enter Dropoff"
            value={dropoff}
            onChangeText={setDropoff}
            style={{
              flex: 1,
              marginLeft: responsiveWidth(2.3),
              fontSize: responsiveFontSize(1.8),
            }}
          />

          <View
            style={{
              alignItems: "center",
              marginLeft: responsiveWidth(1.7),
            }}
          >
            <Text
              style={{
                color: COLORS.icon,
                fontSize: responsiveFontSize(1.4),
              }}
            >
              Skip to Rent
            </Text>
          </View>
        </View>
      </View>

      {/* Saved Location */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: COLORS.white,
          paddingVertical: responsiveHeight(1.5),
          paddingHorizontal: responsiveWidth(4),
          borderRadius: responsiveHeight(1.5),
          width: responsiveWidth(50),
          marginBottom: responsiveHeight(1.5),
          elevation: 3,
        }}
      >
        <Ionicons name="bookmark-outline" size={18} color={COLORS.icon} />

        <Text
          style={{
            marginLeft: responsiveWidth(1.8),
            fontSize: responsiveFontSize(1.6),
          }}
        >
          National Stadium, Nati...
        </Text>
      </View>

      {/* Services Grid */}
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {services.map((service) => {
          const active = selectedService === service.id;

          return (
            <TouchableOpacity
              key={service.id}
              style={[
                {
                  width: "48%",
                  backgroundColor: COLORS.serviceBg,
                  borderRadius: 18,
                  paddingVertical: responsiveHeight(2),
                  alignItems: "center",
                  marginBottom: 8,
                },
                active && { backgroundColor: COLORS.active },
              ]}
              onPress={() => handleServicePress(service)}
            >
              <Image
                source={service.image}
                style={{
                  width: 60,
                  height: 50,
                }}
                resizeMode="contain"
              />

              <Text
                style={{
                  marginTop: 8,
                  fontSize: 12,
                  color: "#777",
                  fontWeight: "600",
                }}
              >
                {service.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

export default RideOptionsPanel;
