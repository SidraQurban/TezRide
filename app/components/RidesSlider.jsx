import React, { useState } from "react";
import { ScrollView, TouchableOpacity, Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { rides } from "../data/data";

const RidesSlider = () => {
  const navigation = useNavigation();
  const [selectedService, setSelectedService] = useState("bike");
  const selectedRide = rides.find((r) => r.id === selectedService);

  return (
    <View>
      {/* SERVICES SLIDER */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingVertical: responsiveHeight(1),
          marginLeft: responsiveWidth(1),
        }}
        style={{ flexGrow: 0 }}
      >
        {rides.map((service) => {
          const active = selectedService === service.id;
          return (
            <TouchableOpacity
              key={service.id}
              onPress={() => setSelectedService(service.id)}
              style={[
                {
                  height: responsiveHeight(16),
                  width: responsiveWidth(33),
                  backgroundColor: COLORS.serviceBg,
                  borderRadius: 18,
                  padding: responsiveHeight(1),
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginRight: responsiveWidth(3),
                },
                active && {
                  backgroundColor: COLORS.active,
                  borderWidth: 2,
                  borderColor: COLORS.primary,
                },
              ]}
            >
              {/* Tick Icon */}
              {active && (
                <View style={{ position: "absolute", top: 8, right: 8 }}>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.secondary}
                  />
                </View>
              )}

              <Image
                source={service.image}
                style={{
                  width: responsiveWidth(18),
                  height: responsiveHeight(6),
                  resizeMode: "contain",
                }}
              />
              <Text
                style={{
                  marginTop: 4,
                  fontSize: responsiveFontSize(1.5),
                  color: active ? COLORS.primary : "#555",
                  fontFamily: FONTS.bold,
                }}
              >
                {service.label}
              </Text>
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.4),
                    color: "#777",
                    fontFamily: FONTS.semiBold,
                  }}
                >
                  {service.eta}
                </Text>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.5),
                    fontWeight: "600",
                    color: "#000",
                    fontFamily: FONTS.bold,
                  }}
                >
                  Rs. {service.price}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* LOCATION DETAILS & PRICE */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(1),
        }}
      >
        <View>
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              fontFamily: FONTS.semiBold,
            }}
          >
            Locations
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: responsiveHeight(1),
            }}
          >
            <MaterialIcons
              name="location-pin"
              size={18}
              color={COLORS.primary}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                fontFamily: FONTS.regular,
              }}
            >
              Pickup: 123 Main St., Karachi
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: responsiveHeight(0.8),
            }}
          >
            <MaterialIcons
              name="location-pin"
              size={18}
              color={COLORS.icon}
              style={{ marginRight: 6 }}
            />
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                fontFamily: FONTS.regular,
              }}
            >
              Drop: 456 University Rd., Karachi
            </Text>
          </View>
        </View>

        {/* Price */}
        <View>
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              fontFamily: FONTS.bold,
              color: COLORS.primary,
            }}
          >
            Rs. {selectedRide.price}
          </Text>
        </View>
      </View>

      {/* CONFIRM BUTTON */}
      <View
        style={{
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(3),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SearchingDirection")}
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
              Confirm Ride
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RidesSlider;
