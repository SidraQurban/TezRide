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
  StyleSheet,
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
import BottomSheet, { BottomSheetScrollView } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import BackBtn from "../components/BackBtn";
import { useTranslation } from "react-i18next";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";

import customerHub from "../api/customerHub";
import DriverInterestCard from "../components/DriverInterestCard";
import { useRide } from "../context/RideContext";
import { rides } from "../data/data.jsx";
import rideService from "../api/rideService";

const SearchingDirection = ({ route }) => {
  const navigation = useNavigation();
  const { rideImage, pickup, destination, rideId, vehicleType, price } =
    route.params || {};
  const { t } = useTranslation();
  const { activeRide, setActiveRide, clearActiveRide } = useRide();

  const selectedRide = rides.find((r) => r.id === vehicleType);
  const displayImage = selectedRide?.image || rideImage || require("../../assets/rickshaw.png");

  const bottomSheetRef = useRef(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const snapPoints = useMemo(() => ["10%", "40%", "75%"], []);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showNoDriversModal, setShowNoDriversModal] = useState(false);
  const [rating, setRating] = useState(5);
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [driverAssignedInfo, setDriverAssignedInfo] = useState(null);
  const [interestedDrivers, setInterestedDrivers] = useState([]);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  // searching | driver_selected | assigned | no_drivers | completed | cancelled
  const [rideStatus, setRideStatus] = useState("searching");
  const [searchWave, setSearchWave] = useState(null);
  const [waveDrivers, setWaveDrivers] = useState([]);

  // Stable refs for use inside event callbacks without stale closures
  const rideStatusRef = useRef(rideStatus);
  const interestedDriversRef = useRef(interestedDrivers);
  const assignedDriverRef = useRef(assignedDriver);
  // Prevents duplicate selectDriver calls from double-taps or card timers
  const selectionSentRef = useRef(false);

  useEffect(() => {
    rideStatusRef.current = rideStatus;
    interestedDriversRef.current = interestedDrivers;
    assignedDriverRef.current = assignedDriver;
  }, [rideStatus, interestedDrivers, assignedDriver]);

  // ── SignalR Event Handlers ───────────────────────────────────────────────
  useEffect(() => {
    // Ensure hub is connected when screen mounts
    customerHub.start();

    // driver_interested: { rideId, driverInfo: NearbyDriverDto }
    const handleDriverInterested = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      setInterestedDrivers((prev) => {
        const driverInfo = payload.driverInfo || payload.DriverInfo;
        if (!driverInfo) return prev;
        
        // Deduplicate by driverId
        const incomingId = String(driverInfo.driverId || driverInfo.DriverId);
        const alreadyPresent = prev.find(
          (d) => String(d.driverId || d.DriverId) === incomingId
        );
        if (alreadyPresent) return prev;
        // Attach price from nav params to the driver card
        return [...prev, { ...driverInfo, price }];
      });
    };

    // ride_assigned: { rideId, driverId }
    // NOTE: The server only sends rideId + driverId — no nested driverInfo.
    // We look up the full driver object from the interestedDrivers list.
    const handleRideAssigned = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;

      const confirmedDriverId = String(payload.driverId || payload.DriverId);
      
      // Look up the driver in this order: 
      // 1. Explicit nested payload data (legacy/fallback)
      // 2. The payload itself if it contains driver fields (flat format)
      // 3. Currently visible cards
      // 4. What we just selected (assignedDriver state)
      const driverData =
        payload.driverInfo ||
        payload.DriverInfo ||
        (payload.DriverName || payload.driverName ? payload : null) ||
        interestedDriversRef.current.find(
          (d) => String(d.driverId || d.DriverId) === confirmedDriverId
        ) ||
        assignedDriverRef.current; 

      setRideStatus("assigned");
      // Merge to ensure we don't lose existing fields (like price or local distance)
      setAssignedDriver(prev => ({ ...prev, ...driverData }));
      setInterestedDrivers([]);
      setSearchWave(null);

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      // Extract and set starting coordinates of driver immediately if present
      if (driverData) {
        const lat = driverData.lat || driverData.latitude;
        const lon = driverData.lon || driverData.longitude;
        if (lat && lon) {
          setDriverLocation({
            latitude: parseFloat(lat),
            longitude: parseFloat(lon)
          });
        }
      }

      // Persist to global context
      setActiveRide({ 
        status: "assigned", 
        driverId: confirmedDriverId,
        assignedDriver: { ...assignedDriverRef.current, ...driverData } 
      });

      // Expand the bottom sheet to show the ArrivingCard
      bottomSheetRef.current?.snapToIndex(2);
    };

    // ride_status_updated: { rideId, status }
    const handleRideStatusUpdated = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;
      
      const pStatus = payload.status ?? payload.Status;
      // 2 = DriverArrived, 3 = InTransit
      if (pStatus === 2) {
        setRideStatus("driver_arrived");
        setActiveRide({ status: "driver_arrived" });
      } else if (pStatus === 3) {
        setRideStatus("in_transit");
        setActiveRide({ status: "in_transit" });
      }
    };

    // driver_location_changed: { driverId, lat, lon }
    const handleDriverLocationChanged = (payload) => {
      const pDriverId = payload.driverId || payload.DriverId;
      const activeDriver = assignedDriverRef.current;
      if (!activeDriver || String(pDriverId) !== String(activeDriver.driverId || activeDriver.DriverId)) {
        return;
      }
      const lat = payload.lat ?? payload.Lat;
      const lon = payload.lon ?? payload.Lon;
      if (lat && lon) {
        setDriverLocation({
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
        });
      }
    };

    // ride_completed: { rideId, finalFare, currency }
    const handleRideCompleted = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;

      const fare = payload.finalFare ?? payload.FinalFare ?? 0;
      const curr = payload.currency ?? payload.Currency ?? "PKR";
      const dist = payload.distanceKm ?? payload.DistanceKm ?? 0;
      const dur = payload.durationMinutes ?? payload.DurationMinutes ?? 0;
      const payFromWallet = payload.payFromWallet ?? payload.PayFromWallet ?? false;

      setRideStatus("completed");
      setActiveRide({
        status: "completed",
        finalFare: fare,
        currency: curr,
        distanceKm: dist,
        durationMinutes: dur,
        payFromWallet: payFromWallet
      });

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setShowCompletionModal(true);
      bottomSheetRef.current?.close();
    };

    // no_drivers_found: { rideId }
    const handleNoDriversFound = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;
      
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
      setShowNoDriversModal(true);
      bottomSheetRef.current?.close();
    };

    // search_progress: { rideId, currentWave, maxWaves, minRing, maxRing }
    const handleSearchProgress = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;

      setSearchWave({
        currentWave: payload.currentWave ?? payload.CurrentWave,
        maxWaves: payload.maxWaves ?? payload.MaxWaves,
      });
    };

    // wave_drivers: { drivers: NearbyDriverDto[] }
    const handleWaveDrivers = (payload) => {
      if (payload && payload.drivers) {
        setWaveDrivers(payload.drivers);
      }
    };

    // SelectDriverFailed: { rideId, reason }
    const handleSelectDriverFailed = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;
      
      if (rideStatusRef.current !== "searching") return; // already handled
      Alert.alert(t("error"), payload.reason || payload.Reason || t("selection_failed"));
    };

    // DriverSelected: { rideId, driverId, success: true }
    const handleDriverSelected = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;
      
      const success = payload.success ?? payload.Success;
      if (!success) return; // handled by SelectDriverFailed

      // Lock against any further accept attempts
      selectionSentRef.current = true;

      // Clear all pending driver cards — we have our driver
      setInterestedDrivers([]);
      setSearchWave(null);
      setRideStatus("driver_selected");
      setActiveRide({ status: "driver_selected" });
    };

    // RideCancelled: { rideId, success }
    const handleRideCancelled = (payload) => {
      const pRideId = payload.rideId || payload.RideId;
      if (String(pRideId) !== String(rideId)) return;
      
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
    customerHub.on("wave_drivers", handleWaveDrivers);
    customerHub.on("DriverSelected", handleDriverSelected);
    customerHub.on("SelectDriverFailed", handleSelectDriverFailed);
    customerHub.on("RideCancelled", handleRideCancelled);
    customerHub.on("driver_location_changed", handleDriverLocationChanged);
    customerHub.on("ride_status_updated", handleRideStatusUpdated);

    return () => {
      customerHub.off("driver_interested", handleDriverInterested);
      customerHub.off("ride_assigned", handleRideAssigned);
      customerHub.off("ride_completed", handleRideCompleted);
      customerHub.off("no_drivers_found", handleNoDriversFound);
      customerHub.off("search_progress", handleSearchProgress);
      customerHub.off("wave_drivers", handleWaveDrivers);
      customerHub.off("DriverSelected", handleDriverSelected);
      customerHub.off("SelectDriverFailed", handleSelectDriverFailed);
      customerHub.off("RideCancelled", handleRideCancelled);
      customerHub.off("driver_location_changed", handleDriverLocationChanged);
      customerHub.off("ride_status_updated", handleRideStatusUpdated);
    };
  }, [rideId, navigation, t]);

  // ── Customer Actions ─────────────────────────────────────────────────────

  const handleAcceptDriver = async (driverId) => {
    // Guard: only allow one selectDriver call per ride
    if (selectionSentRef.current) return;
    if (rideStatusRef.current !== "searching") return;

    // Capture the driver info before we clear the list to ensure 
    // it remains visible in the slider during the "driver_selected" state.
    const selected = interestedDrivers.find(d => String(d.driverId || d.DriverId) === String(driverId));
    
    if (selected) {
        setAssignedDriver(selected);
        setRideStatus("driver_selected"); // Set immediately for UI responsiveness
        setActiveRide({ status: "driver_selected", assignedDriver: selected });
        
        // Immediately expand the bottom sheet to show the driver details (ArrivingCard)
        bottomSheetRef.current?.snapToIndex(2);
    }

    selectionSentRef.current = true; // lock immediately to prevent race conditions
    try {
      await customerHub.selectDriver(rideId, String(driverId));
      // Final confirmation UI clears in handleDriverSelected (DriverSelected ACK from server)
    } catch (error) {
      selectionSentRef.current = false; // allow retry on network error
      setRideStatus("searching"); // rollback UI on error
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
            driverLocation={driverLocation}
            rideStatus={rideStatus}
            waveDrivers={waveDrivers.filter(d => String(d.driverId) !== String(assignedDriver?.driverId))}
            selectedCategory={vehicleType}
            useGlobalState={true}
            showMarkers={rideStatus === "assigned" || rideStatus === "driver_selected" || rideStatus === "driver_arrived" || rideStatus === "in_transit" || rideStatus === "completed"}
            showRoute={rideStatus === "assigned" || rideStatus === "driver_selected" || rideStatus === "driver_arrived" || rideStatus === "in_transit" || rideStatus === "completed"}
            showPickupMarker={true}
            animateZoomOut={true}
          />

          {/* Pulse / vehicle icon */}
          {rideStatus !== "assigned" && rideStatus !== "driver_selected" && rideStatus !== "driver_arrived" && rideStatus !== "in_transit" && rideStatus !== "completed" && rideStatus !== "cancelled" && (
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
                    source={displayImage}
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
          )}

          {/* DRIVER INTEREST POPUPS - Direct Display (No Background) */}
          {interestedDrivers.length > 0 && (
            <View
              style={{
                position: 'absolute',
                top: responsiveHeight(10),
                left: 12,
                right: 12,
                zIndex: 1000,
                maxHeight: responsiveHeight(70),
              }}
            >
              <ScrollView 
                showsVerticalScrollIndicator={false} 
                contentContainerStyle={{ gap: 8, paddingBottom: 20 }}
              >
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
          )}
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
           {rideStatus === "assigned" || rideStatus === "driver_selected" || rideStatus === "driver_arrived" || rideStatus === "in_transit" ? (
            <ArrivingCard
              driver={assignedDriver}
              pickup={pickup}
              destination={destination}
              rideStatus={rideStatus}
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
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
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
      
      {/* Ride Completion Modal */}
      <Modal
        visible={showCompletionModal}
        animationType="slide"
        transparent={false}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FFF' }}>
          <ScrollView contentContainerStyle={{ padding: 24, alignItems: 'center' }} showsVerticalScrollIndicator={false}>
            <View style={{ 
              width: 100, 
              height: 100, 
              borderRadius: 50, 
              backgroundColor: '#F0FDF4', 
              justifyContent: 'center', 
              alignItems: 'center',
              marginTop: 40,
              marginBottom: 20
            }}>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
            </View>
            
            <Text style={{ fontFamily: FONTS.bold, fontSize: 28, color: COLORS.text, textAlign: 'center' }}>
              {t("ride_completed_title", { defaultValue: "Trip Completed!" })}
            </Text>
            
            <View style={{ 
              width: '100%', 
              backgroundColor: '#F8F9FA', 
              borderRadius: 20, 
              padding: 20, 
              marginVertical: 30,
              borderWidth: 1,
              borderColor: '#E9ECEF'
            }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 }}>
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text }}>{activeRide?.distanceKm || 0} km</Text>
                  <Text style={{ fontFamily: FONTS.medium, fontSize: 14, color: '#6C757D' }}>Distance</Text>
                </View>
                <View style={{ width: 1, backgroundColor: '#DEE2E6', height: '80%', alignSelf: 'center' }} />
                <View style={{ alignItems: 'center' }}>
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 22, color: COLORS.text }}>{activeRide?.durationMinutes || 0} min</Text>
                  <Text style={{ fontFamily: FONTS.medium, fontSize: 14, color: '#6C757D' }}>Time Taken</Text>
                </View>
              </View>

              <View style={{ height: 1, backgroundColor: '#DEE2E6', marginBottom: 20 }} />

              <Text style={{ fontFamily: FONTS.medium, fontSize: 14, color: '#6C757D', textAlign: 'center', marginBottom: 8 }}>
                {activeRide?.payFromWallet 
                   ? t("paid_via_wallet", { defaultValue: "PAID VIA WALLET" }) 
                   : t("total_fare_paid", { defaultValue: "TOTAL FARE PAID (CASH)" })}
              </Text>
              <Text style={{ fontFamily: FONTS.bold, fontSize: 36, color: COLORS.primary, textAlign: 'center' }}>
                {activeRide?.finalFare ? `${activeRide.currency || "PKR"} ${activeRide.finalFare}` : "PKR 0"}
              </Text>
            </View>

            {/* Rating Section */}
            <View style={{ width: '100%', alignItems: 'center', marginBottom: 40 }}>
              <Text style={{ fontFamily: FONTS.bold, fontSize: 18, color: COLORS.text, marginBottom: 15 }}>
                 How was your Captain?
              </Text>
              <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                  {[1, 2, 3, 4, 5].map((s) => (
                      <TouchableOpacity 
                        key={s} 
                        onPress={() => {
                          setRating(s);
                          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                        }}
                      >
                          <Ionicons 
                              name={s <= rating ? "star" : "star-outline"} 
                              size={48} 
                              color={s <= rating ? "#F59E0B" : "#D1D5DB"} 
                              style={{ marginHorizontal: 8 }}
                          />
                      </TouchableOpacity>
                  ))}
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              disabled={isSubmittingRating}
              onPress={async () => {
                setIsSubmittingRating(true);
                try {
                  const targetDriverId = activeRide?.driverId;
                  if (targetDriverId) {
                      await rideService.submitRating({
                          rideId: rideId,
                          targetUserId: targetDriverId,
                          rating: rating,
                          comment: "Great captain!"
                      });
                  }

                  setShowCompletionModal(false);
                  clearActiveRide();
                  await customerHub.stop();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainDrawer" }],
                  });
                } catch (err) {
                  console.warn("Rating submission failed", err);
                  setShowCompletionModal(false);
                  clearActiveRide();
                  await customerHub.stop();
                  navigation.reset({
                    index: 0,
                    routes: [{ name: "MainDrawer" }],
                  });
                } finally {
                  setIsSubmittingRating(false);
                }
              }}
              style={{
                width: '100%',
                height: 60,
                borderRadius: 18,
                backgroundColor: COLORS.primary,
                justifyContent: 'center',
                alignItems: 'center',
                shadowColor: COLORS.primary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 10,
                elevation: 8,
              }}
            >
              {isSubmittingRating ? (
                  <ActivityIndicator color="#FFF" />
              ) : (
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 18, color: '#FFF' }}>
                      {t("submit_and_finish", { defaultValue: "Submit & Finish" })}
                  </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* No Drivers Found Modal */}
      <Modal
        visible={showNoDriversModal}
        animationType="fade"
        transparent={true}
      >
        <BlurView intensity={20} style={{ flex: 1 }}>
          <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'center', padding: 24 }}>
            <View style={{ 
              backgroundColor: '#FFF', 
              borderRadius: 30, 
              padding: 30, 
              alignItems: 'center',
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 10 },
              shadowOpacity: 0.2,
              shadowRadius: 20,
              elevation: 15
            }}>
              <View style={{ marginBottom: 25 }}>
                <LinearGradient
                  colors={[COLORS.active, '#FFF7ED']}
                  style={{ 
                    width: 100, 
                    height: 100, 
                    borderRadius: 50, 
                    justifyContent: 'center', 
                    alignItems: 'center',
                    shadowColor: COLORS.primary,
                    shadowOffset: { width: 0, height: 6 },
                    shadowOpacity: 0.15,
                    shadowRadius: 10,
                    elevation: 5,
                    borderWidth: 1,
                    borderColor: COLORS.active
                  }}
                >
                  <View style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    backgroundColor: '#FFF',
                    justifyContent: 'center',
                    alignItems: 'center',
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.05,
                    shadowRadius: 5,
                  }}>
                    <Ionicons name="search-outline" size={38} color={COLORS.primary} />
                  </View>
                </LinearGradient>
              </View>
              
              <Text style={{ fontFamily: FONTS.bold, fontSize: 24, color: COLORS.text, textAlign: 'center', marginBottom: 12 }}>
                {t("no_rider_found_title", { defaultValue: "No Riders Found" })}
              </Text>
              
              <Text style={{ fontFamily: FONTS.regular, fontSize: 15, color: '#64748B', textAlign: 'center', marginBottom: 30, lineHeight: 22 }}>
                {t("no_rider_found_desc", { defaultValue: "We couldn't find any available riders in your area at the moment. Please try again in a few minutes." })}
              </Text>
              
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => {
                  setShowNoDriversModal(false);
                  navigation.goBack();
                }}
                style={{ width: '100%', marginBottom: 12 }}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    height: 56,
                    borderRadius: 16,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Text style={{ fontFamily: FONTS.bold, fontSize: 17, color: '#FFF' }}>
                    {t("go_back", { defaultValue: "Go Back" })}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                activeOpacity={0.6}
                onPress={() => {
                  setShowNoDriversModal(false);
                  confirmCancelRide();
                }}
                style={{
                  paddingVertical: 12,
                  width: '100%',
                  alignItems: 'center'
                }}
              >
                <Text style={{ fontFamily: FONTS.semiBold, fontSize: 16, color: '#94A3B8' }}>
                  {t("cancel_request", { defaultValue: "Cancel Request" })}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </Modal>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({});

export default SearchingDirection;
