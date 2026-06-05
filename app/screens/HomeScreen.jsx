import React from "react";
import {
  View,
  ScrollView,
  Image,
  Text,
  AppState,
  ActivityIndicator,
  TouchableOpacity,
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { FONTS } from "../constants/theme";


import preferenceService from "../api/preferenceService";
// import walletService from "../api/walletService"; // Removed as per request

const HomeScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
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
  // walletBalance and fetchingBalance removed as per request

  // fetchWalletBalance removed as per request

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
              const pId = pref.id || pref.Id;

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
                    // Navigate to search with this as destination
                    // Use the first part of the address as the "name" for display in search bar
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
                      {pKey}
                    </Text>
                    <Ionicons
                      name={pIcon || "location"}
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
                    {addr || detail.houseNo || detail.HouseNo || ""}
                  </Text>
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
      
    </SafeAreaView>
  );
};

export default HomeScreen;
