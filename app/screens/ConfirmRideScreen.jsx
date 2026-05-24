import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons, Fontisto, FontAwesome } from "@expo/vector-icons";
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
      JSON.stringify(route.params.destination) !==
        JSON.stringify(ctxDestination)
    ) {
      setDestination(route.params.destination);
    }
  }, [route.params, setPickup, setDestination, ctxPickup, ctxDestination]);

  const { t } = useTranslation();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["55%", "56%"], []);
  const [selectedService, setSelectedService] = useState("bike");
  const [loading, setLoading] = useState(false);
  const [genderPreference, setGenderPreference] = useState("any"); // 'any', 'male', 'female'
  const [prefModalVisible, setPrefModalVisible] = useState(false);

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
        console.warn("[ConfirmRide] Pricing fetch failed:", err?.message);
      } finally {
        setPriceLoading(false);
      }
    },
    [pickup, destination, setRouteDetails],
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
        genderPreference: genderPreference,
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

  // Preference Modal Component
  const PreferenceModal = () => {
    const [tempPref, setTempPref] = useState(genderPreference);

    return (
      <Modal visible={prefModalVisible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setPrefModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>{t("rider_preference")}</Text>

            <View style={styles.prefOptions}>
              {[
                { id: "any", label: "no_preference", icon: "account" },
                { id: "male", label: "male_driver", icon: "account-tie" },
                { id: "female", label: "female_driver", icon: "account-tie-woman" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.prefItem,
                    tempPref === opt.id && styles.prefItemActive,
                  ]}
                  onPress={() => setTempPref(opt.id)}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      tempPref === opt.id && styles.iconCircleActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={40}
                      color={tempPref === opt.id ? COLORS.primary : "#374151"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.prefLabel,
                      tempPref === opt.id && styles.prefLabelActive,
                    ]}
                  >
                    {t(opt.label)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => {
                setGenderPreference(tempPref);
                setPrefModalVisible(false);
              }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>{t("confirm_btn")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    );
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
            useGlobalState={true}
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
          zIndex: 50,
        }}
      >
        <TouchableOpacity
          onPress={handleConfirmRide}
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mainConfirmBtn}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.mainConfirmBtnText}>
                {t("confirm_ride")}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* PREFERENCE MODAL */}
      <PreferenceModal />

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
          onPreferencePress={() => setPrefModalVisible(true)}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainConfirmBtn: {
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  mainConfirmBtnText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: responsiveHeight(4),
    borderTopRightRadius: responsiveHeight(4),
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: responsiveHeight(2),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIndicator: {
    width: 32,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  prefOptions: {
    gap: 12,
    marginBottom: 24,
  },
  prefItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
  },
  prefItemActive: {
    backgroundColor: "rgba(255, 92, 0, 0.04)",
    borderColor: COLORS.primary,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  iconCircleActive: {
    backgroundColor: "#FFF7ED",
    borderColor: COLORS.primary,
  },
  prefLabel: {
    fontSize: responsiveFontSize(1.9),
    fontFamily: FONTS.medium,
    color: "#374151",
  },
  prefLabelActive: {
    color: "#111827",
    fontFamily: FONTS.semiBold,
  },
  confirmBtn: {
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
  },
});

export default ConfirmRide;
