import React, { useState } from "react";
import { TouchableOpacity, Image, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { rides } from "../data/data";
import { ScrollView } from "react-native-gesture-handler";

const RidesSlider = () => {
  const navigation = useNavigation();
  const [selectedService, setSelectedService] = useState("bike");
  const selectedRide = rides.find((r) => r.id === selectedService);

  return (
    <View>
      {/* SERVICES SLIDER ) */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: responsiveHeight(1),
          marginLeft: responsiveWidth(1),
        }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {rides.map((service) => {
          const active = selectedService === service.id;
          return (
            <TouchableOpacity
              key={service.id}
              onPress={() => setSelectedService(service.id)}
              activeOpacity={0.9}
              style={{
                height: responsiveHeight(17),
                width: responsiveWidth(35),
                borderRadius: 20,
                marginRight: responsiveWidth(3),
                padding: responsiveHeight(1.2),
                justifyContent: "space-between",
                backgroundColor: active ? COLORS.active : COLORS.white,
                borderWidth: active ? 2 : 0,
                borderColor: COLORS.primary,
                elevation: 4,
                shadowColor: "#000",
                shadowOpacity: 0.08,
                shadowRadius: 6,
              }}
            >
              {active && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                  style={{ position: "absolute", top: 8, right: 8 }}
                />
              )}

              <Image
                source={service.image}
                style={{
                  width: responsiveWidth(20),
                  height: responsiveHeight(7),
                  resizeMode: "contain",
                  alignSelf: "center",
                }}
              />

              <Text
                style={{
                  fontSize: responsiveFontSize(1.6),
                  fontFamily: FONTS.bold,
                  textAlign: "center",
                  color: "#222",
                }}
              >
                {service.label}
              </Text>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.3),
                    color: "#777",
                    fontFamily: FONTS.regular,
                  }}
                >
                  {service.eta}
                </Text>

                <Text
                  style={{
                    fontSize: responsiveFontSize(1.6),
                    fontFamily: FONTS.bold,
                    color: COLORS.primary,
                  }}
                >
                  Rs. {service.price}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* LOCATION CARD (UPDATED) */}
      <View
        style={{
          marginHorizontal: responsiveWidth(2),
          padding: responsiveWidth(3.5),
          backgroundColor: "#fff",
          borderRadius: 15,
          elevation: 2,
          marginBottom: responsiveHeight(1),
        }}
      >
        {/* TOP ROW: LOCATION TITLE + PRICE */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: responsiveHeight(0.5),
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(1.9),
            }}
          >
            Locations
          </Text>

          {/* SELECTED PRICE TOP RIGHT */}
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: responsiveFontSize(1.9),
              color: COLORS.primary,
            }}
          >
            Rs. {selectedRide.price}
          </Text>
        </View>

        {/* Pickup */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: COLORS.primary,
              marginRight: 8,
            }}
          />
          <Text style={{ fontFamily: FONTS.medium }}>Current Location</Text>
        </View>

        {/* Line */}
        <View
          style={{
            height: 18,
            width: 1,
            backgroundColor: "#ccc",
            marginLeft: 4,
            marginVertical: 4,
          }}
        />

        {/* Drop */}
        <View
          style={{ flexDirection: "row", alignItems: "center", marginLeft: -2 }}
        >
          <Ionicons
            name="location-sharp"
            size={16}
            color={COLORS.primary}
            style={{ marginRight: 6 }}
          />
          <Text style={{ fontFamily: FONTS.medium }}>Destination address</Text>
        </View>

        {/* BOTTOM ROW: ETA + APPLY PROMO */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: responsiveHeight(1),
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.4),
              color: "#777",
            }}
          >
            ETA: 3 min • 5.4 km
          </Text>

          {/*   PROMO SECTIOn  */}
          <TouchableOpacity onPress={() => navigation.navigate("Promo")}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginRight: 4,
                  color: COLORS.primary,
                }}
              >
                Apply Promo
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={COLORS.primary}
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

export default RidesSlider;
