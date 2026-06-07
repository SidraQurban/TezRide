import React from "react";
import {
  View,
  ScrollView,
  Image,
  Text,
  AppState,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import AppHeader from "../components/AppHeader";
import Services from "../components/Services";
import SearchBar from "../components/SearchBar";
import LocationModal from "../components/LocationModal";
import SaveAddressModal from "../components/SaveAddressModal";
import MapLocationPickerModal from "../components/MapLocationPickerModal";
import SingleMapLocationPickerModal from "../components/SingleMapLocationPickerModal";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, withSequence } from "react-native-reanimated";
import { FONTS } from "../constants/theme";
import { useAlert } from "../context/AlertContext";
import preferenceService from "../api/preferenceService";
import customerHub from "../api/customerHub";
import rideService from "../api/rideService";
import { useRide } from "../context/RideContext";
// import walletService from "../api/walletService"; // Removed as per request

import { useIsFocused } from "@react-navigation/native";

const HomeScreen = ({ navigation, route }) => {
  const isFocused = useIsFocused();
  const { t, i18n } = useTranslation();
  const { showAlert, showToast } = useAlert();
  const [locationModalVisible, setLocationModalVisible] = React.useState(false);
  const dismissedManuallyRef = React.useRef(false);
  const appState = React.useRef(AppState.currentState);

  const [currentAddressName, setCurrentAddressName] = React.useState(null);
  const [currentAddressDetail, setCurrentAddressDetail] = React.useState(null);
  const [fetchingLocation, setFetchingLocation] = React.useState(false);
  const [saveAddressModalVisible, setSaveAddressModalVisible] =
    React.useState(false);
  const [preferences, setPreferences] = React.useState([]);
  const [fetchingPreferences, setFetchingPreferences] = React.useState(false);
  const [mapPickerVisible, setMapPickerVisible] = React.useState(false);
  const [selectedMapAddress, setSelectedMapAddress] = React.useState(null);
  const { activeRide, setActiveRide, setPickup, setDestination, hasRestoredSession, setHasRestoredSession } = useRide();

  const fetchUserPreferences = React.useCallback(async () => {
    setFetchingPreferences(true);
    try {
      const response = await preferenceService.getPreferences();
      // Handle both camelCase and PascalCase from various backend environments/caches
      const hasSucceeded = response.succeeded || response.Succeeded;
      const data = response.data || response.Data;

      if (hasSucceeded) {
        setPreferences(data || []);
      }
    } catch (error) {
      console.warn("Failed to fetch user preferences", error);
    } finally {
      setFetchingPreferences(false);
    }
  }, []);

  const handleDeletePreference = async (key) => {
    showAlert({
      title: t("delete_location", "Delete Location"),
      message: t("delete_location_msg", `Are you sure you want to delete "${key}"?`),
      type: 'warning',
      okText: t("delete", "Delete"),
      cancelText: t("cancel", "Cancel"),
      onOk: async () => {
        try {
          const response = await preferenceService.deletePreference(key);
          if (response.succeeded || response.Succeeded) {
            // Stronger optimistic update: filter by trimmed key and also attempt ID match if possible
            setPreferences(current => {
              return current.filter(p => {
                const pk = (p.key || p.Key || "").toString().trim().toLowerCase();
                const targetKey = key.toString().trim().toLowerCase();
                return pk !== targetKey;
              });
            });

            showToast(t("preference_deleted", "Location deleted successfully"), 'success');

            // Wait slightly before refreshing from backend to avoid stale cache data
            setTimeout(() => {
              fetchUserPreferences();
            }, 1500);
          } else {
            showToast(response.message || t("delete_failed", "Failed to delete"), 'error');
          }
        } catch (error) {
          console.warn("Failed to delete preference", error);
          showToast(t("something_went_wrong"), 'error');
        }
      }
    });
  };

  // Show modal if permission is missing OR device GPS is turned off
  const checkLocationStatus = React.useCallback(async () => {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      const isGpsEnabled = await ExpoLocation.hasServicesEnabledAsync();

      if (
        (status !== "granted" || !isGpsEnabled) &&
        !dismissedManuallyRef.current
      ) {
        setLocationModalVisible(true);
      } else {
        setLocationModalVisible(false);
      }
    } catch (e) {
      if (!dismissedManuallyRef.current) setLocationModalVisible(true);
    }
  }, []);

  // Fetch real address
  const fetchCurrentAddress = React.useCallback(async () => {
    setFetchingLocation(true);
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      const isGpsEnabled = await ExpoLocation.hasServicesEnabledAsync();
      if (status === "granted" && isGpsEnabled) {
        // Fast first: try last known position
        let location = await ExpoLocation.getLastKnownPositionAsync({});

        if (!location) {
          // Fallback to low accuracy for faster result if no recent location exists
          location = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.Low,
          });
        }
        const coords = location.coords;
        const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.status === "OK") {
          const result =
            json.results.find((r) => !r.types.includes("plus_code")) ||
            json.results[0];
          let cleanAddress = result.formatted_address.replace(
            /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}\s*,?\s*/,
            "",
          );
          const addressParts = cleanAddress.split(",");
          if (addressParts.length > 1) {
            setCurrentAddressName(addressParts[0].trim());
            setCurrentAddressDetail(addressParts.slice(1).join(",").trim());
          } else {
            setCurrentAddressName(t("current_location") || "Current Location");
            setCurrentAddressDetail(cleanAddress);
          }
        }
      }
    } catch (e) {
      console.warn("Error fetching address on home screen", e);
    } finally {
      setFetchingLocation(false);
    }
  }, [t]);

  // On mount: check location
  React.useEffect(() => {
    checkLocationStatus();
    fetchCurrentAddress();
    fetchUserPreferences();
  }, [checkLocationStatus, fetchCurrentAddress, fetchUserPreferences]);

  const isSyncingRef = React.useRef(false); // useRef for reliable sync mutex (useState is async)

  React.useEffect(() => {
    const checkActiveRide = async () => {
      // Guard 1: Only attempt recovery when this screen is focused and not yet restored this session.
      if (!isFocused || hasRestoredSession) return;

      // Guard 2: Prevent concurrent calls
      if (isSyncingRef.current) return;

      setHasRestoredSession(true); // Mark as checked for this app session
      try {
        await customerHub.start();

        if (customerHub.isConnected()) {
          isSyncingRef.current = true;
          const activeSession = await customerHub.syncActiveRide();

          if (activeSession) {
            console.log("[HomeScreen] Recovered active session:", activeSession.rideId);

            // Map DB status code to UI string
            // DB enum: Assigned=1, DriverArrived=2, InTransit=3
            let statusStr = "searching";
            if (activeSession.status === 1) statusStr = "assigned";
            else if (activeSession.status === 2) statusStr = "driver_arrived";
            else if (activeSession.status === 3) statusStr = "in_transit";

            // Update Global State
            setPickup(activeSession.pickup);
            setDestination(activeSession.destination);
            setActiveRide({
              rideId: activeSession.rideId,
              status: statusStr,
              assignedDriver: activeSession.driverInfo,
              price: activeSession.fare,
              pickup: activeSession.pickup,
              destination: activeSession.destination,
              vehicleType: activeSession.vehicleType,
              serviceType: "ride"
            });

            // Redirect to the active ride screen
            navigation.replace("SearchingDirection", {
              rideId: activeSession.rideId,
              pickup: activeSession.pickup,
              destination: activeSession.destination,
              vehicleType: activeSession.vehicleType,
              price: activeSession.fare,
              driverInfo: activeSession.driverInfo,
              serviceType: "ride",
              recoveredStatus: statusStr
            });
          }
        }
      } catch (err) {
        console.warn("[HomeScreen] Persistence sync failed:", err);
      } finally {
        isSyncingRef.current = false;
      }
    };

    // Initial check on mount
    checkActiveRide();

    // Re-check when app comes back to foreground
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") checkActiveRide();
    });
    return () => sub.remove();
  }, [navigation, setActiveRide, setPickup, setDestination, isFocused, hasRestoredSession]);

  // Re-check when user returns from Settings
  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkLocationStatus();
        if (!currentAddressName) {
          fetchCurrentAddress();
        }
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [checkLocationStatus, fetchCurrentAddress, currentAddressName]);

  const [refreshing, setRefreshing] = React.useState(false);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([
      fetchCurrentAddress(),
      fetchUserPreferences(),
      checkLocationStatus(),
    ]);
    setRefreshing(false);
  }, [fetchCurrentAddress, fetchUserPreferences, checkLocationStatus]);

  const translateX = useSharedValue(0);
  const isUrdu = false;

  React.useEffect(() => {
    translateX.value = 0;
    translateX.value = withRepeat(
      withSequence(
        withTiming(-responsiveWidth(6), { duration: 2500 }),
        withTiming(0, { duration: 2500 }),
      ),
      -1,
      true,
    );
  }, [i18n.language]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={{ paddingBottom: responsiveHeight(5) }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
      >
        {/* Banner Section */}
        <View
          style={{
            height: responsiveHeight(25),
            backgroundColor: COLORS.backgroundimg,
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Background Banner Image */}
          <Image
            source={require("../../assets/banner1.png")}
            style={{
              width: responsiveWidth(95),
              height: responsiveHeight(25),
              resizeMode: "contain",
              alignSelf: "center",
              position: "absolute",
            }}
          />

          {/* Text Overlay */}
          <View
            style={{
              position: "absolute",
              top: responsiveHeight(5),
              width: responsiveWidth(85),
              alignSelf: "center",
              zIndex: 1,
              alignItems: "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(4.2),
                fontFamily: FONTS.bold,
                color: COLORS.white,
                textAlign: "left",
                includeFontPadding: false,
              }}
            >
              {t("tez_ride")}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2.2),
                fontFamily: FONTS.medium,
                color: COLORS.white,
                opacity: 0.8,
                textAlign: "left",
                includeFontPadding: false,
              }}
            >
              {t("home_tagline")}
            </Text>
          </View>

          {/* Animated Image (Floating Car) */}
          <Animated.Image
            source={require("../../assets/animationimg.png")}
            style={[
              {
                width: responsiveWidth(45),
                height: responsiveHeight(18),
                resizeMode: "contain",
                position: "absolute",
                bottom: responsiveHeight(3),
                // Native direction-aware positioning (end is Left in RTL, Right in LTR)
                end: responsiveWidth(2),
              },
              animatedStyle,
            ]}
          />
        </View>

        {/* Search Bar */}
        <View>
          <SearchBar />
        </View>

        {/* Current Location (Dynamic) */}
        <View
          style={{
            marginTop: responsiveHeight(2),
            marginHorizontal: responsiveWidth(2),
          }}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
              paddingHorizontal: responsiveWidth(4),
              paddingVertical: 4,
            }}
          >
            {/* Current Location Card */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setSaveAddressModalVisible(true)}
              style={{
                backgroundColor: COLORS.white,
                borderRadius: 12,
                padding: responsiveWidth(3),
                marginRight: responsiveWidth(3),
                width: responsiveWidth(38),
                elevation: 2,
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.1,
                shadowRadius: 2,
              }}
            >
              {fetchingLocation ? (
                <ActivityIndicator
                  size="small"
                  color={COLORS.primary}
                  style={{ paddingVertical: responsiveHeight(1) }}
                />
              ) : (
                <>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: FONTS.semiBold,
                        fontSize: responsiveFontSize(1.7),
                        color: COLORS.black,
                        textAlign: "left",
                      }}
                      numberOfLines={1}
                    >
                      {currentAddressName || t("current_location")}
                    </Text>
                    <Ionicons
                      name="bookmark-outline"
                      size={20}
                      color={COLORS.primary}
                      style={{ marginStart: 8 }}
                    />
                  </View>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: responsiveFontSize(1.3),
                      color: COLORS.gray,
                      marginTop: 4,
                      textAlign: "left",
                    }}
                    numberOfLines={1}
                  >
                    {currentAddressDetail || t("fetching")}
                  </Text>
                </>
              )}
            </TouchableOpacity>

            {/* Saved Preferences (Home, Work, etc.) */}
            {preferences.map((pref) => {
              // Handle both PascalCase (from Redis/some endpoints) and camelCase (from others)
              const pKey = pref.key || pref.Key;
              const pValue = pref.value || pref.Value;
              const pIcon = pref.icon || pref.Icon;
              const pId = pref.id || pref.Id || `pref-${pKey}`;

              let detail = {};
              try {
                detail = JSON.parse(pValue);
              } catch {
                detail = { address: pValue };
              }

              // Normalize detail fields too
              const addr = detail.address || detail.Address || "";
              const lat = detail.latitude || detail.Latitude;
              const lon = detail.longitude || detail.Longitude;

              return (
                <TouchableOpacity
                  key={pId}
                  activeOpacity={0.8}
                  onPress={() => {
                    const displayName = addr.split(",")[0].trim() || pKey;
                    navigation.navigate("Search", {
                      destination: {
                        address: addr,
                        name: displayName,
                        latitude: lat || undefined,
                        longitude: lon || undefined,
                      },
                      activeField: "destination",
                    });
                  }}
                  style={{
                    backgroundColor: COLORS.white,
                    borderRadius: 16,
                    padding: 12,
                    marginRight: 12,
                    width: responsiveWidth(40),
                    elevation: 3,
                    shadowColor: "#000",
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.08,
                    shadowRadius: 8,
                    borderWidth: 1,
                    borderColor: '#F0F0F0',
                    position: 'relative',
                  }}
                >
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
                    <View style={{
                      width: 28,
                      height: 28,
                      borderRadius: 14,
                      backgroundColor: 'rgba(255, 92, 0, 0.08)',
                      justifyContent: 'center',
                      alignItems: 'center',
                      marginRight: 8
                    }}>
                      <Ionicons
                        name={pIcon || "location"}
                        size={16}
                        color={COLORS.primary}
                      />
                    </View>
                    <Text
                      style={{
                        flex: 1,
                        fontFamily: FONTS.semiBold,
                        fontSize: responsiveFontSize(1.6),
                        color: COLORS.black,
                        textAlign: "left",
                      }}
                      numberOfLines={1}
                    >
                      {pKey}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: responsiveFontSize(1.3),
                      color: COLORS.gray,
                      textAlign: "left",
                      opacity: 0.7
                    }}
                    numberOfLines={1}
                  >
                    {addr || detail.houseNo || detail.HouseNo || ""}
                  </Text>

                  {/* Delete Button - Premium styling with no overlap */}
                  <TouchableOpacity
                    onPress={() => handleDeletePreference(pKey)}
                    activeOpacity={0.7}
                    style={{
                      position: 'absolute',
                      top: 6,
                      right: 6,
                      padding: 4,
                      backgroundColor: '#FFF1F0',
                      borderRadius: 10,
                      zIndex: 20
                    }}
                  >
                    <Ionicons name="close" size={12} color="#FF4D4F" />
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}

            {fetchingPreferences && (
              <View style={{ width: 100, justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
            )}

            {/* Add New Address Card */}
            {!fetchingPreferences && (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setMapPickerVisible(true)}
                style={{
                  backgroundColor: "rgba(255, 92, 0, 0.05)",
                  borderRadius: 12,
                  padding: responsiveWidth(3),
                  marginRight: responsiveWidth(6),
                  width: responsiveWidth(30),
                  borderWidth: 1.5,
                  borderColor: COLORS.primary,
                  borderStyle: 'dashed',
                  justifyContent: 'center',
                  alignItems: 'center'
                }}
              >
                <Ionicons name="add-circle" size={32} color={COLORS.primary} />
                <Text style={{
                  fontFamily: FONTS.bold,
                  fontSize: responsiveFontSize(1.4),
                  color: COLORS.primary,
                  marginTop: 6
                }}>
                  {t("add_new", "Add New")}
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </View>

        {/* Services */}
        <View style={{ marginTop: responsiveHeight(1) }}>
          <Services />
        </View>



        {/* Location Modal */}
        <LocationModal
          visible={locationModalVisible}
          onClose={() => {
            setLocationModalVisible(false);
            dismissedManuallyRef.current = true;
          }}
        />

        <SaveAddressModal
          visible={saveAddressModalVisible}
          onClose={() => {
            setSaveAddressModalVisible(false);
            setSelectedMapAddress(null);
            fetchUserPreferences();
          }}
          address={
            selectedMapAddress
              ? selectedMapAddress.address
              : currentAddressName
                ? `${currentAddressName}, ${currentAddressDetail}`
                : ""
          }
          latitude={selectedMapAddress?.latitude}
          longitude={selectedMapAddress?.longitude}
        />

        <SingleMapLocationPickerModal
          visible={mapPickerVisible}
          onClose={() => setMapPickerVisible(false)}
          onSelect={(data) => {
            setSelectedMapAddress(data);
            setSaveAddressModalVisible(true);
          }}
        />
      </ScrollView>

      {/* Live Trip Floating Pill - High visibility entry to live ride */}
      {activeRide?.rideId && (
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => {
              // Passing full details ensures SearchingDirection hydrates correctly
              navigation.navigate('SearchingDirection', { 
                 rideId: activeRide.rideId,
                 recoveredStatus: activeRide.status,
                 pickup: activeRide.pickup,
                 destination: activeRide.destination,
                 driverInfo: activeRide.assignedDriver,
                 price: activeRide.price,
                 vehicleType: activeRide.vehicleType,
                 serviceType: activeRide.serviceType || "ride"
              });
            }}
            style={{
              position: 'absolute',
              bottom: responsiveHeight(5),
              left: responsiveWidth(5),
              right: responsiveWidth(5),
              backgroundColor: COLORS.white,
              borderRadius: 30,
              padding: 10,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              elevation: 10,
              shadowColor: COLORS.primary,
              shadowOffset: { width: 0, height: 5 },
              shadowOpacity: 0.3,
              shadowRadius: 10,
              borderWidth: 1.5,
              borderColor: COLORS.primary,
              zIndex: 1000,
            }}
          >
            <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}>
              <View style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: 'rgba(255, 92, 0, 0.1)',
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: 10
              }}>
                <Ionicons name="car-sport" size={18} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text 
                  style={{ fontFamily: FONTS.bold, fontSize: 11, color: '#999', textTransform: 'uppercase' }}
                  numberOfLines={1}
                >
                  {t("live_trip", "Live Trip")}
                </Text>
                <Text 
                  style={{ fontFamily: FONTS.bold, fontSize: 14, color: COLORS.black }}
                  numberOfLines={1}
                >
                  {activeRide.status === 'assigned' ? t("driver_assigned", "Driver Assigned") : 
                   activeRide.status === 'driver_arrived' ? t("driver_arrived", "Driver Arrived") :
                   activeRide.status === 'in_transit' ? t("in_transit", "In Transit") :
                   t("ride_in_progress", "Ride In Progress")}
                </Text>
              </View>
            </View>
            <View style={{
              backgroundColor: COLORS.primary,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 20,
              flexDirection: 'row',
              alignItems: 'center'
            }}>
              <Text style={{ color: '#fff', fontFamily: FONTS.bold, fontSize: 12, marginRight: 5 }}>
                {t("open", "Open")}
              </Text>
                </View>
          </TouchableOpacity>
      )}

    </SafeAreaView>
  );
};

export default HomeScreen;
