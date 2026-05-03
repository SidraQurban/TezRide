import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Modal,
  ScrollView,
  ActivityIndicator,
  Alert,
} from "react-native";
import React, {
  useRef,
  useMemo,
  useEffect,
  useState,
  useCallback,
} from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import MapComponent from "../components/MapComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrivingCard from "../components/ArrivingCard";
import BottomSheet from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import BackBtn from "../components/BackBtn";
import { useTranslation } from "react-i18next";

import customerHub from "../api/customerHub";
import DriverInterestCard from "../components/DriverInterestCard";
import { useRide } from "../context/RideContext";

const SearchingDirection = ({ route }) => {
  const navigation = useNavigation();
  const { rideImage, pickup, destination, rideId, vehicleType, price } =
    route.params || {};
  const { t } = useTranslation();
  const { setActiveRide, clearActiveRide } = useRide();
  const bottomSheetRef = useRef(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const snapPoints = useMemo(() => ["10%", "30%", "55%"], []);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [interestedDrivers, setInterestedDrivers] = useState([]);
  const [assignedDriver, setAssignedDriver] = useState(null);
  // searching | driver_selected | assigned | no_drivers | completed | cancelled
  const [rideStatus, setRideStatus] = useState("searching");
  const [searchWave, setSearchWave] = useState(null);

  // Stable refs for use inside event callbacks without stale closures
  const rideStatusRef = useRef(rideStatus);
  const interestedDriversRef = useRef(interestedDrivers);
  // Prevents duplicate selectDriver calls from double-taps or card timers
  const selectionSentRef = useRef(false);

  useEffect(() => {
    rideStatusRef.current = rideStatus;
    interestedDriversRef.current = interestedDrivers;
  }, [rideStatus, interestedDrivers]);

  // ── SignalR Event Handlers ───────────────────────────────────────────────
  useEffect(() => {
    // driver_interested: { rideId, driverInfo: NearbyDriverDto }
    const handleDriverInterested = (payload) => {
      if (String(payload.rideId) !== String(rideId)) return;

      setInterestedDrivers((prev) => {
        // Deduplicate by driverId
        const alreadyPresent = prev.find(
          (d) => String(d.driverId) === String(payload.driverInfo.driverId)
        );
        if (alreadyPresent) return prev;
        // Attach price from nav params to the driver card
        return [...prev, { ...payload.driverInfo, price }];
      });
    };

    // ride_assigned: { rideId, driverId }
    // NOTE: The server only sends rideId + driverId — no nested driverInfo.
    // We look up the full driver object from the interestedDrivers list.
    const handleRideAssigned = (payload) => {
      if (String(payload.rideId) !== String(rideId)) return;

      const confirmedDriverId = String(payload.driverId);
      
      // Look up the driver in this order: 
      // 1. Explicit payload data
      // 2. Currently visible cards
      // 3. What we just selected (assignedDriver state)
      const driverData =
        payload.driverInfo ||
        interestedDriversRef.current.find(
          (d) => String(d.driverId) === confirmedDriverId
        ) ||
        assignedDriver; 

      setRideStatus("assigned");
      // Merge to ensure we don't lose existing fields (like price or local distance)
      setAssignedDriver(prev => ({ ...prev, ...driverData }));
      setInterestedDrivers([]);
      setSearchWave(null);

      // Persist to global context
      setActiveRide({ 
        status: "assigned", 
        assignedDriver: { ...assignedDriver, ...driverData } 
      });

      // Expand the bottom sheet to show the ArrivingCard
      bottomSheetRef.current?.snapToIndex(2);
    };

    // ride_completed: { rideId, finalFare, currency }
    const handleRideCompleted = (payload) => {
      if (String(payload.rideId) !== String(rideId)) return;

      setRideStatus("completed");
      setActiveRide({
        status: "completed",
        finalFare: payload.finalFare,
        currency: payload.currency,
      });

      const fareText = payload.finalFare
        ? `${payload.currency || "PKR"} ${payload.finalFare}`
        : "";

      Alert.alert(
        t("ride_completed_title"),
        fareText
          ? `${t("final_fare_label")}: ${fareText}`
          : t("ride_completed_title"),
        [
          {
            text: t("ok_btn"),
            onPress: async () => {
              clearActiveRide();
              // Disconnect the hub — ride lifecycle is fully over
              await customerHub.stop();
              navigation.reset({
                index: 0,
                routes: [{ name: "MainDrawer" }],
              });
            },
          },
        ]
      );
    };

    // no_drivers_found: { rideId }
    const handleNoDriversFound = (payload) => {
      if (String(payload.rideId) !== String(rideId)) return;
      // Ignore if we already have interested drivers or the ride is assigned/completed
      if (
        rideStatusRef.current === "assigned" ||
        rideStatusRef.current === "completed" ||
        interestedDriversRef.current.length > 0
      ) {
        return;
      }
      setRideStatus("no_drivers");
      setActiveRide({ status: "no_drivers" });
      Alert.alert(t("search_failed"), t("no_drivers_found_desc"), [
        { text: t("retry"), onPress: () => navigation.goBack() },
        { text: t("cancel"), onPress: () => confirmCancelRide() },
      ]);
    };

    // search_progress: { rideId, currentWave, maxWaves, minRing, maxRing }
    const handleSearchProgress = (payload) => {
      if (String(payload.rideId) !== String(rideId)) return;
      setSearchWave({
        currentWave: payload.currentWave,
        maxWaves: payload.maxWaves,
      });
    };

    // SelectDriverFailed: { rideId, reason }
    // Only alert when we are still actively searching — ignore if DriverSelected
    // was already acknowledged (the server may fire this for concurrent attempts).
    const handleSelectDriverFailed = (payload) => {
      if (String(payload.rideId) !== String(rideId)) return;
      if (rideStatusRef.current !== "searching") return; // already handled
      Alert.alert(t("error"), payload.reason || t("selection_failed"));
    };

    // DriverSelected: { rideId, driverId, success: true }
    // Server ACK that our SelectDriver call was accepted.
    // Immediately lock the UI so no further selectDriver calls can fire.
    const handleDriverSelected = (payload) => {
      if (String(payload.rideId) !== String(rideId)) return;
      if (!payload.success) return; // handled by SelectDriverFailed

      // Lock against any further accept attempts
      selectionSentRef.current = true;

      // Clear all pending driver cards — we have our driver
      setInterestedDrivers([]);
      setSearchWave(null);
      setRideStatus("driver_selected");
      setActiveRide({ status: "driver_selected" });
      // ride_assigned will follow and expand the ArrivingCard
    };

    // RideCancelled: { rideId, success }
    const handleRideCancelled = (payload) => {
      if (String(payload.rideId) !== String(rideId)) return;
      setShowCancelModal(false);
      clearActiveRide();
      // Disconnect hub — no more events expected for this ride
      customerHub.stop().finally(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainDrawer" }],
        });
      });
    };

    customerHub.on("driver_interested", handleDriverInterested);
    customerHub.on("ride_assigned", handleRideAssigned);
    customerHub.on("ride_completed", handleRideCompleted);
    customerHub.on("no_drivers_found", handleNoDriversFound);
    customerHub.on("search_progress", handleSearchProgress);
    customerHub.on("DriverSelected", handleDriverSelected);
    customerHub.on("SelectDriverFailed", handleSelectDriverFailed);
    customerHub.on("RideCancelled", handleRideCancelled);

    return () => {
      customerHub.off("driver_interested", handleDriverInterested);
      customerHub.off("ride_assigned", handleRideAssigned);
      customerHub.off("ride_completed", handleRideCompleted);
      customerHub.off("no_drivers_found", handleNoDriversFound);
      customerHub.off("search_progress", handleSearchProgress);
      customerHub.off("DriverSelected", handleDriverSelected);
      customerHub.off("SelectDriverFailed", handleSelectDriverFailed);
      customerHub.off("RideCancelled", handleRideCancelled);
    };
  }, [rideId, navigation, t]);

  // ── Customer Actions ─────────────────────────────────────────────────────

  const handleAcceptDriver = async (driverId) => {
    // Guard: only allow one selectDriver call per ride
    if (selectionSentRef.current) return;
    if (rideStatusRef.current !== "searching") return;

    // Capture the driver info before we clear the list to ensure 
    // it remains visible in the slider during the "driver_selected" state.
    const selected = interestedDrivers.find(d => String(d.driverId) === String(driverId));
    if (selected) {
        setAssignedDriver(selected);
        setActiveRide({ status: "driver_selected", assignedDriver: selected });
    }

    selectionSentRef.current = true; // lock immediately to prevent race conditions
    try {
      await customerHub.selectDriver(rideId, String(driverId));
      // UI clears in handleDriverSelected (DriverSelected ACK from server)
    } catch (error) {
      selectionSentRef.current = false; // allow retry on network error
      Alert.alert(t("error"), error.message || t("something_went_wrong"));
    }
  };

  const handleDeclineDriver = (driverId) => {
    setInterestedDrivers((prev) =>
      prev.filter((d) => String(d.driverId) !== String(driverId))
    );
  };

  const handleCancelRide = () => {
    setShowCancelModal(true);
  };

  const confirmCancelRide = useCallback(async () => {
    try {
      // Ask the server to cancel; navigation + hub.stop() fire in handleRideCancelled
      await customerHub.cancelRide(rideId);
    } catch {
      // Hub offline — stop it and navigate immediately as a fallback
      setShowCancelModal(false);
      clearActiveRide();
      await customerHub.stop();
      navigation.reset({
        index: 0,
        routes: [{ name: "MainDrawer" }],
      });
    }
  }, [navigation, rideId, clearActiveRide]);

  // ── Pulse Animation ──────────────────────────────────────────────────────
  useEffect(() => {
    Animated.loop(
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const opacity = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, paddingBottom: responsiveHeight(2) }}>
        <View style={{ left: responsiveWidth(1.5) }}>
          <BackBtn />
        </View>

        {/* MAP + OVERLAY */}
        <View style={{ flex: 1 }}>
          <MapComponent
            pickup={pickup}
            destination={destination}
            showMarkers={false}
            showRoute={false}
            showPickupMarker={true}
            animateZoomOut={true}
          />

          {/* Pulse / vehicle icon */}
          <View
            style={{
              position: "absolute",
              top: responsiveHeight(18),
              left: 0,
              right: 0,
              alignItems: "center",
              elevation: 1,
            }}
          >
            <View
              style={{
                position: "relative",
                width: 140,
                height: 140,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* PULSE */}
              <Animated.View
                style={{
                  position: "absolute",
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: "orange",
                  opacity: opacity,
                  transform: [{ scale: scale }],
                }}
              />

              {/* STATIC CIRCLE */}
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 75,
                  borderWidth: 4,
                  borderColor: "orange",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                }}
              >
                <Image
                  source={rideImage || require("../../assets/auto.png")}
                  style={{
                    width: responsiveWidth(30),
                    height: responsiveHeight(30),
                    resizeMode: "contain",
                  }}
                />
              </View>

              {/* CANCEL BUTTON */}
              <TouchableOpacity
                onPress={handleCancelRide}
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: responsiveWidth(10),
                  height: responsiveWidth(10),
                  borderRadius: responsiveWidth(5),
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  zIndex: 10,
                }}
              >
                <Ionicons name="close" size={20} color="red" />
              </TouchableOpacity>
            </View>


          </View>

          {/* DRIVER INTEREST POPUPS */}
          <View
            style={{
              position: "absolute",
              top: responsiveHeight(10),
              left: 0,
              right: 0,
              zIndex: 1000,
              elevation: 10,
              maxHeight: responsiveHeight(60),
            }}
          >
            <ScrollView showsVerticalScrollIndicator={false}>
              {interestedDrivers.map((driver) => (
                <DriverInterestCard
                  key={driver.driverId}
                  driver={driver}
                  onAccept={handleAcceptDriver}
                  onDecline={handleDeclineDriver}
                />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* BOTTOM SHEET */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          style={{ zIndex: 999, elevation: 999 }}
          enablePanDownToClose={false}
          animateOnMount={true}
          enableDynamicSizing={false}
          handleIndicatorStyle={{
            width: 60,
            height: 5,
            backgroundColor: "#E0E0E0",
          }}
        >
          {rideStatus === "assigned" || rideStatus === "driver_selected" ? (
            <ArrivingCard
              driver={assignedDriver}
              pickup={pickup}
              destination={destination}
              onClose={() => bottomSheetRef.current?.snapToIndex(0)}
            />
          ) : interestedDrivers.length > 0 ? (
            <View style={{ flex: 1, padding: 20 }}>
              <Text
                style={{
                  fontFamily: FONTS.semiBold,
                  fontSize: responsiveFontSize(2),
                  color: COLORS.primary,
                  textAlign: "center",
                  marginTop: responsiveHeight(2),
                }}
              >
                {t("drivers_found")}
              </Text>
            </View>
          ) : (
            <View style={{ flex: 1, padding: 20 }}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 20,
                }}
              >
                <Text
                  style={{
                    fontFamily: FONTS.semiBold,
                    fontSize: responsiveFontSize(2),
                  }}
                >
                  {t("finding_drivers")}
                </Text>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>

              <Text
                style={{
                  fontFamily: FONTS.regular,
                  color: "#8A8A8A",
                  fontSize: responsiveFontSize(1.6),
                }}
              >
                {t("searching_nearby_drivers_desc")}
              </Text>
            </View>
          )}
        </BottomSheet>

        {/* CANCEL CONFIRMATION MODAL */}
        <Modal
          transparent
          animationType="fade"
          visible={showCancelModal}
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: responsiveWidth(5),
            }}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: responsiveWidth(5),
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: FONTS.semiBold,
                  marginBottom: responsiveHeight(2),
                }}
              >
                {t("cancel_ride_title")}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.8),
                  fontFamily: FONTS.regular,
                  textAlign: "left",
                  marginBottom: responsiveHeight(3),
                }}
              >
                {t("cancel_ride_desc")}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                <TouchableOpacity
                  onPress={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    marginRight: 10,
                    borderRadius: 10,
                    paddingVertical: responsiveHeight(1.5),
                    backgroundColor: "#E0E0E0",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontFamily: FONTS.semiBold, color: "#000" }}>
                    {t("no_btn")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={confirmCancelRide}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: responsiveHeight(1.5),
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: FONTS.semiBold, color: "#fff" }}>
                      {t("yes_cancel_btn")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default SearchingDirection;
