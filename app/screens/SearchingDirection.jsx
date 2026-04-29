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
import { Alert } from "react-native";

const SearchingDirection = ({ route }) => {
  const navigation = useNavigation();
  const { rideImage, pickup, destination, rideId, vehicleType, price } =
    route.params || {};
  const { t } = useTranslation();
  const bottomSheetRef = useRef(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const snapPoints = useMemo(() => ["10%", "30%", "55%"], []); // Added larger snap point for ArrivingCard

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [interestedDrivers, setInterestedDrivers] = useState([]);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [rideStatus, setRideStatus] = useState("searching"); // searching, assigned, no_drivers, cancelled

  const firstDriverFoundRef = useRef(false);

  // SignalR Event Handlers
  useEffect(() => {
    const handleDriverInterested = (payload) => {
      if (payload.rideId === rideId) {
        setInterestedDrivers((prev) => {
          // Avoid duplicates
          if (prev.find((d) => d.driverId === payload.driverInfo.driverId))
            return prev;

          // Expand bottom sheet when first driver is found
          if (!firstDriverFoundRef.current) {
            firstDriverFoundRef.current = true;
          }

          return [...prev, { ...payload.driverInfo, price }];
        });
      }
    };

    const handleRideAssigned = (payload) => {
      if (payload.rideId === rideId) {
        setRideStatus("assigned");
        setAssignedDriver((prev) => {
          return { ...payload.driverInfo, driverId: payload.driverId };
        });
        // Clear popups when assigned
        setInterestedDrivers([]);
        bottomSheetRef.current?.snapToIndex(2); // Slide up the arriving card
      }
    };

    const handleNoDriversFound = (payload) => {
      if (payload.rideId === rideId) {
        setRideStatus("no_drivers");
        Alert.alert(t("search_failed"), t("no_drivers_found_desc"), [
          { text: t("retry"), onPress: () => navigation.goBack() },
          { text: t("cancel"), onPress: () => confirmCancelRide() },
        ]);
      }
    };

    const handleSelectDriverFailed = (payload) => {
      if (payload.rideId === rideId) {
        Alert.alert(t("error"), payload.reason || t("selection_failed"));
      }
    };

    customerHub.on("driver_interested", handleDriverInterested);
    customerHub.on("ride_assigned", handleRideAssigned);
    customerHub.on("no_drivers_found", handleNoDriversFound);
    customerHub.on("SelectDriverFailed", handleSelectDriverFailed);

    return () => {
      customerHub.off("driver_interested", handleDriverInterested);
      customerHub.off("ride_assigned", handleRideAssigned);
      customerHub.off("no_drivers_found", handleNoDriversFound);
      customerHub.off("SelectDriverFailed", handleSelectDriverFailed);
    };
  }, [rideId, navigation, t]);

  const handleAcceptDriver = async (driverId) => {
    if (rideId.startsWith("mock-ride-")) {
      setRideStatus("assigned");
      const driver = interestedDrivers.find((d) => d.driverId === driverId);
      setAssignedDriver(driver || { driverId });
      setInterestedDrivers([]);
      bottomSheetRef.current?.snapToIndex(2); // Slide up the arriving card
      return;
    }
    try {
      await customerHub.selectDriver(rideId, driverId);
      // The snapToIndex(1) will happen automatically via handleRideAssigned
    } catch (error) {
      Alert.alert(t("error"), error.message || t("something_went_wrong"));
    }
  };

  const handleDeclineDriver = (driverId) => {
    setInterestedDrivers((prev) => prev.filter((d) => d.driverId !== driverId));
  };

  const handleCancelRide = () => {
    setShowCancelModal(true);
  };

  const confirmCancelRide = useCallback(async () => {
    try {
      await customerHub.cancelRide(rideId);
      setShowCancelModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "MainDrawer" }],
      });
    } catch (error) {
      setShowCancelModal(false);
      navigation.reset({
        index: 0,
        routes: [{ name: "MainDrawer" }],
      });
    }
  }, [navigation, rideId]);

  // Animated pulse scale and opacity
  useEffect(() => {
    Animated.loop(
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, paddingBottom: responsiveHeight(2) }}>
        <View
          style={{
            left: responsiveWidth(1.5),
          }}
        >
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

          {/* INTEREST POPUPS */}
          <View
            style={{
              position: "absolute",
              top: responsiveHeight(10),
              left: 0,
              right: 0,
              zIndex: 1000,
              elevation: 10,
              maxHeight: responsiveHeight(60), // Limit height so it doesn't cover the whole screen
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
          {rideStatus === "assigned" ? (
            <ArrivingCard
              driver={assignedDriver}
              pickup={pickup}
              destination={destination}
              onClose={() => bottomSheetRef.current?.snapToIndex(0)}
            />
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
                {t("searching_nearby_drivers_desc") ||
                  "Please wait while we connect you with nearby drivers..."}
              </Text>
            </View>
          )}
        </BottomSheet>

        {/* CUSTOM CANCEL MODAL */}
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

              {/* BUTTONS */}
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
