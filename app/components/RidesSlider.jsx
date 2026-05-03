import { TouchableOpacity, Image, Text, View, Animated, ActivityIndicator } from "react-native";
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
import { rides } from "../data/data.jsx";
import { ScrollView } from "react-native-gesture-handler";
import { useTranslation } from "react-i18next";

/**
 * RidesSlider
 *
 * Props:
 *  - selectedService: string (vehicle slug)
 *  - setSelectedService: fn
 *  - pickup: LocationDto
 *  - destination: LocationDto
 *  - distance: number (km from Google Maps)
 *  - duration: number (minutes from Google Maps)
 *  - priceMap: { [vehicleTypeSlug]: EstimateDto }  — live prices from /api/pricing/estimates
 *  - priceLoading: boolean
 */
const RidesSlider = ({
  selectedService,
  setSelectedService,
  pickup,
  destination,
  distance,
  duration,
  priceMap = {},
  priceLoading = false,
}) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ur";

  // Animated shimmer for loading prices
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (priceLoading) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shimmerAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(shimmerAnim, {
            toValue: 0.3,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      shimmerAnim.setValue(1);
    }
  }, [priceLoading]);

  // Animated line for the location card connector
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

  const lineTranslateY = lineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-5, 18],
  });

  const lineOpacity = lineAnim.interpolate({
    inputRange: [0, 0.2, 0.8, 1],
    outputRange: [0, 1, 1, 0],
  });

  /**
   * Resolve the price for a given ride card:
   * 1. If priceMap has an entry for this slug → use live estimatedFare
   * 2. Otherwise fall back to the static price in the rides array
   */
  const resolvePrice = (service) => {
    const estimate = priceMap[service.id];
    if (estimate) {
      return {
        fare: Math.round(estimate.estimatedFare),
        currency: estimate.currency || t("currency"),
        isSurge: estimate.surgeFactor > 1,
        surgeFactor: estimate.surgeFactor,
      };
    }
    return { fare: service.price, currency: "Rs.", isSurge: false, surgeFactor: 1 };
  };

  return (
    <View style={{ paddingBottom: responsiveHeight(16) }}>
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
          const { fare, currency, isSurge, surgeFactor } = resolvePrice(service);
          const hasLivePrice = Boolean(priceMap[service.id]);

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
              {/* Checkmark when selected */}
              {active && (
                <Ionicons
                  name="checkmark-circle"
                  size={20}
                  color={COLORS.primary}
                  style={{ position: "absolute", top: 8, right: 8 }}
                />
              )}

              {/* Surge badge */}
              {isSurge && (
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    backgroundColor: "#FF6B00",
                    borderRadius: 8,
                    paddingHorizontal: 5,
                    paddingVertical: 1,
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontSize: responsiveFontSize(1.1),
                      fontFamily: FONTS.bold,
                    }}
                  >
                    {surgeFactor.toFixed(1)}x
                  </Text>
                </View>
              )}

              {/* Vehicle image */}
              <Image
                source={service.image}
                style={{
                  width: responsiveWidth(20),
                  height: responsiveHeight(5.5),
                  resizeMode: "contain",
                  alignSelf: "center",
                }}
              />

              {/* Label */}
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

              {/* ETA + Price */}
              <View style={{ alignItems: "center" }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.2),
                    color: "#777",
                    fontFamily: FONTS.regular,
                  }}
                >
                  {duration
                    ? `${Math.round(duration)} ${t("mins")}`
                    : t(service.eta?.toLowerCase().replace(" ", "_"))}{" "}
                  •{" "}
                  {distance
                    ? `${distance.toFixed(1)} ${t("km")}`
                    : "---"}
                </Text>

                {/* Price — shimmer while loading */}
                {priceLoading && !hasLivePrice ? (
                  <Animated.View
                    style={{
                      opacity: shimmerAnim,
                      backgroundColor: "#E8E8E8",
                      borderRadius: 6,
                      height: responsiveHeight(2),
                      width: responsiveWidth(18),
                      marginTop: 4,
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.6),
                      fontFamily: FONTS.bold,
                      color: isSurge ? "#FF6B00" : COLORS.primary,
                      marginTop: 2,
                    }}
                  >
                    {currency} {fare}
                  </Text>
                )}
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
          // marginTop: responsiveHeight(0.5),
          marginBottom: responsiveHeight(1),
        }}
      >
        {/* TOP ROW — Pickup */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            // marginBottom: responsiveHeight(0.5),
          }}
        >
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

        {/* Animated connector line */}
        <View
          style={{
            height: 18,
            width: 2,
            backgroundColor: "#F0F0F0",
            marginLeft: 3,
            marginVertical: 4,
            borderRadius: 1,
            overflow: "hidden",
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
              opacity: lineOpacity,
              transform: [{ translateY: lineTranslateY }],
            }}
          />
        </View>

        {/* Dropoff */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: -2,
          }}
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

        {/* BOTTOM ROW — ETA summary */}
        {distance && duration ? (
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: responsiveHeight(1),
              paddingBottom: responsiveHeight(0.5),
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(1.3),
                color: "#777",
                fontFamily: FONTS.regular,
              }}
            >
              {t("eta")}: {Math.round(duration)} {t("mins")} •{" "}
              {distance.toFixed(1)} {t("km")}
            </Text>

            {/* Show pricing loading indicator */}
            {priceLoading && (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.2),
                    color: COLORS.primary,
                    fontFamily: FONTS.regular,
                  }}
                >
                  {t("fetching_prices")}
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default RidesSlider;
