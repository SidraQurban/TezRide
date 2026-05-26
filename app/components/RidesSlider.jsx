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
  genderPreference = "any",
  onPreferencePress,
  onEditPickup,
  onEditDestination,
  waveDrivers = [],
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
    // Return nulls if not loaded yet so it triggers shimmer or empty state until live prices load
    return { fare: "...", currency: "PKR", isSurge: false, surgeFactor: 1 };
  };

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
                height: responsiveHeight(18),
                width: responsiveWidth(34),
                borderRadius: 22,
                marginRight: responsiveWidth(4),
                padding: responsiveHeight(1.5),
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
              <View style={{ height: responsiveHeight(7), justifyContent: 'center' }}>
                <Image
                  source={service.image}
                  style={{
                    width: '100%',
                    height: '100%',
                    resizeMode: "contain",
                  }}
                />
              </View>

              {/* Info content */}
              <View style={{ alignItems: "center", gap: 2 }}>
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.7),
                    fontFamily: FONTS.bold,
                    color: "#1F2937",
                  }}
                >
                  {t(service.label.toLowerCase())}
                </Text>

                <Text
                  style={{
                    fontSize: responsiveFontSize(1.2),
                    color: "#6B7280",
                    fontFamily: FONTS.medium,
                  }}
                >
                  {(() => {
                    // Try to find nearest driver of this type
                    const driversOfType = waveDrivers.filter(d => d.vehicleType === service.id);
                    if (driversOfType.length > 0) {
                      // Just a rough estimate for demo: 2 mins per km distance is common in city
                      // Usually we would use Google Distance Matrix here, but for reactive UI we can estimate
                      return `2 ${t("mins")}`; 
                    }
                    return duration
                      ? `${Math.round(duration)} ${t("mins")}`
                      : t(service.eta?.toLowerCase().replace(" ", "_"));
                  })()}
                  {" • "}{distance ? `${distance.toFixed(1)} km` : "---"}
                </Text>

                {/* Price Display */}
                {!hasLivePrice ? (
                  <Animated.View
                    style={{
                      opacity: shimmerAnim,
                      backgroundColor: "#F3F4F6",
                      borderRadius: 6,
                      height: responsiveHeight(2),
                      width: responsiveWidth(20),
                      marginTop: 2,
                    }}
                  />
                ) : (
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.8),
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
          marginHorizontal: responsiveWidth(3),
          padding: responsiveWidth(4.5),
          backgroundColor: "#FFF",
          borderRadius: 22,
          elevation: 5,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.08,
          shadowRadius: 10,
          marginBottom: responsiveHeight(2),
          borderWidth: 1,
          borderColor: "#F3F4F6",
        }}
      >
        {/* TOP ROW — Pickup */}
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
                width: 10,
                height: 10,
                borderRadius: 5,
                backgroundColor: "#FF6B00",
                marginRight: 10,
              }}
            />
            <Text
              style={{
                fontFamily: FONTS.bold,
                fontSize: responsiveFontSize(1.9),
                color: "#1F2937",
                textAlign: isRTL ? "right" : "left",
              }}
            >
              {t("current_location")}
            </Text>
          </View>

          <TouchableOpacity onPress={onPreferencePress}>
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                color: COLORS.primary,
                fontFamily: FONTS.bold,
              }}
            >
              {genderPreference === "any" 
                ? t("rider_preference", "Rider Preference") 
                : genderPreference === "female" 
                  ? t("female_driver") 
                  : t("male_driver")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Pickup Address */}
        <TouchableOpacity 
          style={{ marginLeft: 20, marginTop: 4 }} 
          onPress={onEditPickup}
          activeOpacity={0.7}
        >
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
        </TouchableOpacity>

        {/* Connector line */}
        <View
          style={{
            height: 20,
            width: 1,
            backgroundColor: "#E5E7EB",
            marginLeft: 4.5,
            marginVertical: 4,
          }}
        />

        {/* Dropoff */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginLeft: -3,
          }}
        >
          <Ionicons
            name="location-sharp"
            size={20}
            color="#FF6B00"
            style={{ marginRight: 6 }}
          />
          <Text
            style={{
              fontFamily: FONTS.bold,
              fontSize: responsiveFontSize(1.9),
              color: "#1F2937",
              textAlign: isRTL ? "right" : "left",
            }}
          >
            {t("destination_address")}
          </Text>
        </View>

        {/* Destination Address */}
        <TouchableOpacity 
          style={{ marginLeft: 20, marginTop: 4 }} 
          onPress={onEditDestination}
          activeOpacity={0.7}
        >
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
        </TouchableOpacity>

        {/* BOTTOM ROW — ETA summary */}
        {distance && duration ? (
          <View
            style={{
              marginTop: responsiveHeight(1.5),
              paddingTop: responsiveHeight(1.5),
              borderTopWidth: 1,
              borderTopColor: "#F3F4F6",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(1.4),
                color: "#9CA3AF",
                fontFamily: FONTS.medium,
              }}
            >
              ETA: {Math.round(duration)} mins • {distance.toFixed(1)} km
            </Text>

            {priceLoading && (
              <ActivityIndicator size="small" color={COLORS.primary} />
            )}
          </View>
        ) : null}
      </View>
    </View>
  );
};

export default RidesSlider;
