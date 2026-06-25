import { TouchableOpacity, Image, Text, View, Animated, ActivityIndicator, StyleSheet, Modal } from "react-native";
import React, { useEffect, useRef, useMemo, useState } from "react";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
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
  genderPreference = "male",
  onPreferencePress,
  onEditPickup,
  onEditDestination,
  onPaymentPress,
  activePayment,
}) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isRTL = false;

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
  const resolvePrice = (serviceId) => {
    const estimate = priceMap[serviceId];
    if (estimate) {
      return {
        fare: Math.round(estimate.estimatedFare),
        currency: estimate.currency || t("currency"),
        isSurge: estimate.surgeFactor > 1,
        surgeFactor: estimate.surgeFactor,
        hasLivePrice: true,
      };
    }
    // Return placeholder
    return { fare: "...", currency: "PKR", isSurge: false, surgeFactor: 1, hasLivePrice: false };
  };

  /**
   * Dynamically build the list of displayed rides.
   * We prioritize slugs returned from the pricing API.
   */
  // Defined display order — matches the rides array order in data.jsx
  const SLUG_ORDER = ["bike", "rickshaw", "car", "ac-car", "premium-car"];

  const availableRides = useMemo(() => {
    const slugs = Object.keys(priceMap);
    if (slugs.length > 0) {
      // Sort by defined order; unknown slugs go to the end
      const sorted = slugs.slice().sort((a, b) => {
        const ai = SLUG_ORDER.indexOf(a);
        const bi = SLUG_ORDER.indexOf(b);
        const aIdx = ai === -1 ? 999 : ai;
        const bIdx = bi === -1 ? 999 : bi;
        return aIdx - bIdx;
      });
      return sorted.map((slug) => {
        const staticInfo = rides.find((r) => r.id === slug);
        return {
          id: slug,
          label: staticInfo?.label || (slug.charAt(0).toUpperCase() + slug.slice(1)),
          image: staticInfo?.image || require("../../assets/car.png"),
          imageStyle: staticInfo?.imageStyle || {},
          eta: staticInfo?.eta || "5 mins",
        };
      });
    }
    // Fallback if priceMap is empty (during initial load)
    return [...rides];
  }, [priceMap]);

  return (
    <View style={{ paddingBottom: responsiveHeight(16) }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: responsiveHeight(1.5),
          paddingHorizontal: responsiveWidth(2),
        }}
        keyboardShouldPersistTaps="handled"
        nestedScrollEnabled={true}
      >
        {availableRides.map((service) => {
          const active = selectedService === service.id;
          const { fare, currency, isSurge, surgeFactor, hasLivePrice } = resolvePrice(service.id);

          return (
            <TouchableOpacity
              key={service.id}
              onPress={() => setSelectedService(service.id)}
              activeOpacity={0.9}
              style={{
                height: responsiveHeight(18),
                width: responsiveWidth(34),
                borderRadius: 22,
                marginRight: responsiveWidth(4),
                paddingVertical: responsiveHeight(1.2),
                paddingHorizontal: responsiveWidth(2),
                justifyContent: "space-between",
                backgroundColor: active ? "#FFF0DD" : COLORS.white, // Light primary background for active
                borderWidth: 2,
                borderColor: active ? COLORS.primary : "transparent",
                elevation: active ? 6 : 4,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 3 },
                shadowOpacity: active ? 0.15 : 0.08,
                shadowRadius: 8,
              }}
            >
              {/* Checkmark when selected */}
              {active && (
                <View style={{ 
                  position: "absolute", 
                  top: 8, 
                  right: 8, 
                  zIndex: 10,
                  backgroundColor: COLORS.primary,
                  borderRadius: 10,
                  padding: 1
                }}>
                  <Ionicons name="checkmark" size={14} color="#FFF" />
                </View>
              )}

              {/* Surge badge */}
              {isSurge && (
                <View
                  style={{
                    position: "absolute",
                    top: 8,
                    left: 8,
                    zIndex: 10,
                    backgroundColor: "#FF6B00",
                    borderRadius: 10,
                    paddingHorizontal: 6,
                    paddingVertical: 2,
                    flexDirection: 'row',
                    alignItems: 'center'
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

              {/* Vehicle image - Larger and cleaner */}
              <View style={{ height: responsiveHeight(7), justifyContent: 'center', overflow: 'hidden' }}>
                <Image
                  source={service.image}
                  style={[
                    { width: '100%', height: '100%', resizeMode: "contain" },
                    service.imageStyle,
                  ]}
                />
              </View>

              {/* Info content */}
              <View style={{ alignItems: "center", gap: 2, width: "100%" }}>
                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  style={{
                    fontSize: responsiveFontSize(1.7),
                    fontFamily: FONTS.bold,
                    color: "#1F2937",
                  }}
                >
                  {(() => {
                    const key = service.label.toLowerCase();
                    const translated = t(key);
                    // If i18next returned the key unchanged, no translation exists — use the original label
                    return translated === key ? service.label : translated;
                  })()}
                </Text>

                <Text
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  minimumFontScale={0.7}
                  style={{
                    fontSize: responsiveFontSize(1.2),
                    color: "#6B7280",
                    fontFamily: FONTS.medium,
                    textAlign: "center",
                  }}
                >
                  {(() => {
                    if (duration) return `${Math.round(duration)} ${t("mins")}`;
                    
                    if (service.eta) return t(service.eta.replace(" ", "_").toLowerCase());
                    
                    return t("calculating");
                  })()}
                  {" • "}
                  {distance ? `${distance.toFixed(1)} km` : "---"}
                </Text>

                {/* Price Display */}
                {!hasLivePrice ? (
                  <Animated.View
                    style={{
                      opacity: shimmerAnim,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 6,
                      height: responsiveHeight(2),
                      width: "80%",
                      marginTop: 2,
                    }}
                  />
                ) : (
                  <Text
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    minimumFontScale={0.7}
                    style={{
                      fontSize: responsiveFontSize(1.8),
                      fontFamily: FONTS.bold,
                      color: isSurge ? "#FF6B00" : COLORS.primary,
                      marginTop: 2,
                      textAlign: "center",
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
          marginHorizontal: responsiveWidth(3),
          padding: responsiveWidth(3.5),
          backgroundColor: "#FFF",
          borderRadius: 22,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          marginBottom: responsiveHeight(3),
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        {/* Pickup Row */}
        <View 
          style={{ width: '100%', paddingVertical: 4 }}
        >
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <View
                style={{
                  width: responsiveWidth(2),
                  height: responsiveWidth(2),
                  borderRadius: responsiveWidth(1),
                  backgroundColor: COLORS.primary,
                  marginRight: responsiveWidth(2),
                }}
              />
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  fontSize: responsiveFontSize(1.8),
                  color: "#1F2937",
                  textAlign: isRTL ? "right" : "left",
                }}
              >
                {t("pickup_location")}
              </Text>
            </View>

            <TouchableOpacity onPress={onPreferencePress}>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.6),
                  color: COLORS.primary,
                  fontFamily: FONTS.semiBold,
                  textAlign: "right",
                }}
              >
                {genderPreference === "female" 
                    ? t("female_driver") 
                    : t("male_driver")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginLeft: responsiveWidth(3.5) }}>
            <Text
              style={{
                fontSize: responsiveFontSize(1.5),
                color: "#6B7280",
                fontFamily: FONTS.medium,
                textAlign: isRTL ? "right" : "left",
              }}
              numberOfLines={1}
            >
              {pickup?.address || t("select_pickup")}
            </Text>
          </View>
        </View>

        {/* Connector line */}
        <View
          style={{
            height: 20,
            width: 2,
            backgroundColor: "#E5E7EB",
            marginStart: responsiveWidth(1),
            marginVertical: 2,
            overflow: "hidden",
          }}
        >
          <Animated.View
            style={{
              width: 2,
              height: 15,
              backgroundColor: COLORS.primary,
              transform: [{ translateY: lineTranslateY }],
              opacity: lineOpacity,
            }}
          />
        </View>

        {/* Destination Row */}
        <View 
          style={{ width: '100%'}}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            
            }}
          >
            <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
              <Ionicons
                name="location-sharp"
                size={18}
                color="#FF6B00"
                style={{ marginRight: responsiveWidth(2),marginLeft: responsiveWidth(-1) }}
              />
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  fontSize: responsiveFontSize(1.8),
                  color: "#1F2937",
                  textAlign: isRTL ? "right" : "left",
                }}
              >
                {t("destination_address")}
              </Text>
            </View>

            {/* Payment Dropdown */}
            {activePayment && (
              <TouchableOpacity 
                onPress={onPaymentPress}
                activeOpacity={0.7}
                style={{ 
                  flexDirection: "row", 
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.4),
                    color: COLORS.primary,
                    fontFamily: FONTS.semiBold,
                  }}
                >
                  {t(activePayment.label) !== activePayment.label
                    ? t(activePayment.label)
                    : activePayment.fallbackLabel}
                </Text>
                <Ionicons name="chevron-down" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            )}
            {!activePayment && <Ionicons name="chevron-forward" size={14} color="#9CA3AF" />}
          </View>

          <View style={{ marginLeft: responsiveWidth(5.5) }}>
            <Text
              style={{
                fontSize: responsiveFontSize(1.5),
                color: "#6B7280",
                fontFamily: FONTS.medium,
                textAlign: isRTL ? "right" : "left",
              }}
              numberOfLines={1}
            >
              {destination?.address || t("select_destination")}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RidesSlider;
