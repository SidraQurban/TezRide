import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import MapComponent from "../components/MapComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import RidesSlider from "../components/RidesSlider";
import { LinearGradient } from "expo-linear-gradient";
import BackBtn from "../components/BackBtn";
import { useTranslation } from "react-i18next";
import rideService from "../api/rideService";
import pricingService from "../api/pricingService";
import customerHub from "../api/customerHub";
import { rides } from "../data/data.jsx";
import { ActivityIndicator, Alert } from "react-native";
import { useRide } from "../context/RideContext";

const ConfirmRide = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    pickup: ctxPickup,
    destination: ctxDestination,
    routeDetails,
    setRouteDetails,
    setPickup,
    setDestination,
    setActiveRide,
  } = useRide();

  const pickup = route.params?.pickup || ctxPickup;
  const destination = route.params?.destination || ctxDestination;

  // Sync route params to context on mount
  useEffect(() => {
    if (
      route.params?.pickup &&
      JSON.stringify(route.params.pickup) !== JSON.stringify(ctxPickup)
    ) {
      setPickup(route.params.pickup);
    }
    if (
      route.params?.destination &&
      JSON.stringify(route.params.destination) !== JSON.stringify(ctxDestination)
    ) {
      setDestination(route.params.destination);
    }
  }, [route.params, setPickup, setDestination, ctxPickup, ctxDestination]);

  const { t } = useTranslation();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["55%", "56%"], []);
  const [selectedService, setSelectedService] = useState("bike");
  const [loading, setLoading] = useState(false);

  // ── Live pricing state ────────────────────────────────────────────────────
  // Map of vehicleTypeSlug → EstimateDto
  // e.g. { bike: { estimatedFare: 192, currency: 'PKR', surgeFactor: 1.0, ... } }
  const [priceMap, setPriceMap] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);

  const selectedRide = rides.find((r) => r.id === selectedService);

  // ── Called by MapViewDirections when route is computed ────────────────────
  const handleRouteReady = useCallback(
    async (result) => {
      // result.distance = km, result.duration = minutes
      setRouteDetails(result);

      if (!pickup || !destination) return;

      setPriceLoading(true);
      try {
        const response = await pricingService.getEstimates({
          pickupLat: pickup.latitude,
          pickupLon: pickup.longitude,
          dropoffLat: destination.latitude,
          dropoffLon: destination.longitude,
          // Pass Google-derived hints for better accuracy
          estimatedDistanceKm: result.distance,
          estimatedDurationMinutes: result.duration,
        });

        if (response.succeeded && Array.isArray(response.data)) {
          // Build a slug → estimate map for O(1) lookups in RidesSlider
          const map = {};
          response.data.forEach((item) => {
            map[item.vehicleTypeSlug] = item;
          });
          setPriceMap(map);
        }
      } catch (err) {
        // Fail silently — cards will still show static fallback prices
        console.warn('[ConfirmRide] Pricing fetch failed:', err?.message);
      } finally {
        setPriceLoading(false);
      }
    },
    [pickup, destination, setRouteDetails]
  );

  // ── Confirm ride ──────────────────────────────────────────────────────────
  const handleConfirmRide = async () => {
    if (!pickup || !destination || loading) return;

    setLoading(true);
    try {
      // Connect the SignalR hub on-demand (no-op if already connected)
      // Must happen BEFORE requestRide so the server can push events immediately
      await customerHub.start();

      const requestData = {
        pickup: { lat: pickup.latitude, lon: pickup.longitude },
        dropoff: { lat: destination.latitude, lon: destination.longitude },
        vehicleType: selectedService,
        genderPreference: "any",
        minRating: 0,
      };

      const response = await rideService.requestRide(requestData);

      if (response.succeeded) {
        const rideId = response.data.rideId;

        setActiveRide({
          rideId,
          status: "searching",
          assignedDriver: null,
          finalFare: null,
          currency: null,
        });

        // Resolve live price for this vehicle (fallback to static)
        const liveEstimate = priceMap[selectedService];

        navigation.navigate("SearchingDirection", {
          rideImage: selectedRide?.image,
          pickup,
          destination,
          rideId,
          vehicleType: selectedService,
          price: liveEstimate
            ? Math.round(liveEstimate.estimatedFare)
            : selectedRide?.price,
        });
      } else {
        Alert.alert(t("error"), response.message || t("ride_request_failed"));
      }
    } catch (error) {
      Alert.alert(t("error"), error.message || t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* MAIN CONTENT */}
      <View style={{ flex: 1 }}>
        <View style={{ left: responsiveWidth(1.5) }}>
          <BackBtn />
        </View>

        {/* MAP */}
        <View
          style={{
            height: responsiveHeight(60),
            marginBottom: responsiveHeight(0.5),
          }}
        >
          <MapComponent
            pickup={pickup}
            destination={destination}
            onRouteReady={handleRouteReady}
          />
        </View>
      </View>

      {/* CONFIRM BUTTON */}
      <View
        style={{
          position: "absolute",
          bottom: responsiveHeight(6),
          left: responsiveWidth(4),
          right: responsiveWidth(4),
          zIndex: 5,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={loading}
          onPress={handleConfirmRide}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: "100%",
              height: responsiveHeight(7),
              borderRadius: responsiveHeight(3.5),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text
                style={{
                  color: COLORS.white,
                  fontFamily: FONTS.semiBold,
                  fontSize: responsiveFontSize(2),
                }}
              >
                {t("confirm_ride")}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        animateOnMount={true}
        enableDynamicSizing={false}
        enableContentPanningGesture={true}
        handleIndicatorStyle={{
          width: 60,
          height: 2,
          backgroundColor: "#E0E0E0",
        }}
        style={{ zIndex: 10 }}
      >
        <RidesSlider
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          pickup={pickup}
          destination={destination}
          distance={routeDetails?.distance}
          duration={routeDetails?.duration}
          priceMap={priceMap}
          priceLoading={priceLoading}
          onClose={() => bottomSheetRef.current?.snapToIndex(0)}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ConfirmRide;
