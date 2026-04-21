import { TouchableOpacity, Image, Text, View, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
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
import { useTranslation } from "react-i18next";

const RidesSlider = ({
  selectedService,
  setSelectedService,
  pickup,
  destination,
}) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const selectedRide = rides.find((r) => r.id === selectedService);
  const { i18n } = useTranslation();
  const isRTL = i18n.language === "ur";

  const lineAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(lineAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateY = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 18],
  });

  const opacity = lineAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  return (
    <View style={{ paddingBottom: responsiveHeight(10) }}>
      {/* SERVICES SLIDER */}
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
                {t(service.label.toLowerCase())}
              </Text>

              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.3),
                    color: "#777",
                    fontFamily: FONTS.regular,
                  }}
                >
                  {service.eta.split(" ")[0]} {t("mins")}
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

      {/* LOCATION CARD */}
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
        {/* TOP ROW */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: responsiveHeight(0.5),
          }}
        >
          {/* Current Location */}
          <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: COLORS.primary,
                marginRight: 8,
              }}
            />

            <Text
              style={{
                fontFamily: FONTS.medium,
                textAlign: isRTL ? "right" : "left",
              }}
              numberOfLines={1}
            >
              {t("current_location")}
            </Text>
          </View>

          {/* PRICE COMMENTED */}
          {/*
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: responsiveFontSize(1.9),
              color: COLORS.primary,
            }}
          >
            Rs. {selectedRide?.price}
          </Text>
          */}
        </View>

        {/* Pickup Address */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Text
            style={{
              fontSize: responsiveFontSize(1.4),
              color: "#777",
              fontFamily: FONTS.regular,
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {pickup?.address}
          </Text>
        </ScrollView>

        {/* Line */}
        <View
          style={{
            height: 18,
            width: 2,
            backgroundColor: "#F0F0F0",
            marginLeft: 3,
            marginVertical: 4,
            borderRadius: 1,
            overflow: "hidden",
            position: "relative",
          }}
        >
          <Animated.View
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 6,
              backgroundColor: COLORS.primary,
              borderRadius: 1,
              opacity: opacity,
              transform: [{ translateY: translateY }],
            }}
          />
        </View>

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
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: FONTS.medium,
                textAlign: isRTL ? "right" : "left",
              }}
            >
              {t("destination_address")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.4),
                  color: "#777",
                  fontFamily: FONTS.regular,
                  textAlign: isRTL ? "right" : "left",
                }}
              >
                {destination?.address}
              </Text>
            </ScrollView>
          </View>
        </View>

        {/* BOTTOM ROW */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: responsiveHeight(1),
          }}
        >
          {/* ETA COMMENTED */}
          {/*
          <Text
            style={{
              fontSize: responsiveFontSize(1.4),
              color: "#777",
            }}
          >
            {t("eta")}: 3 {t("mins")} • 5.4 {t("km")}
          </Text>
          */}

          {/* PROMO */}
          {/* <TouchableOpacity onPress={() => navigation.navigate("Promo")}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontFamily: FONTS.medium,
                  marginRight: 4,
                  color: COLORS.primary,
                }}
              >
                {t("apply_promo")}
              </Text>
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={16}
                color={COLORS.primary}
              />
            </View>
          </TouchableOpacity> */}
        </View>
      </View>
    </View>
  );
};

export default RidesSlider;
