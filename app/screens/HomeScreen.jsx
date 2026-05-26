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
  // walletBalance and fetchingBalance removed as per request

  // fetchWalletBalance removed as per request

  const fetchUserPreferences = React.useCallback(async () => {
    setFetchingPreferences(true);
    try {
      const response = await preferenceService.getPreferences();
      if (response.succeeded) {
        setPreferences(response.data || []);
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
        let location = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        });
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
  const isUrdu = i18n.language?.startsWith("ur");

  React.useEffect(() => {
    // Reset translation
    translateX.value = 0;

    // Animate opposite sides for UR/EN (Subtle floating effect)
    translateX.value = withRepeat(
      withSequence(
        withTiming(isUrdu ? responsiveWidth(6) : -responsiveWidth(6), {
          duration: 2500,
        }),
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
              alignItems: "flex-start", // Flex-start is Right in RTL, Left in LTR
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(4.2),
                fontFamily: FONTS.bold,
                color: COLORS.white,
                textAlign: isUrdu ? "right" : "left",
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
                textAlign: isUrdu ? "right" : "left",
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
                  <Ionicons
                    name="bookmark-outline"
                    size={20}
                    color={COLORS.primary}
                    style={{ position: "absolute", top: 8, right: 8 }}
                  />
                  <Text
                    style={{
                      fontFamily: FONTS.semiBold,
                      fontSize: responsiveFontSize(1.7),
                      color: COLORS.black,
                      marginTop: responsiveHeight(1),
                    }}
                    numberOfLines={1}
                  >
                    {currentAddressName || t("current_location")}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: responsiveFontSize(1.3),
                      color: COLORS.gray,
                      marginTop: 2,
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
              let detail = {};
              try {
                detail = JSON.parse(pref.value);
              } catch {
                detail = { address: pref.value };
              }

              return (
                <TouchableOpacity
                  key={pref.id}
                  activeOpacity={0.8}
                  onPress={() => {
                    // Navigate to search with this as destination
                    navigation.navigate("Search", { 
                      destination: {
                        address: detail.address,
                        name: pref.key
                      }
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
                  <Ionicons
                    name={pref.icon || "location"}
                    size={20}
                    color={COLORS.primary}
                    style={{ position: "absolute", top: 8, right: 8 }}
                  />
                  <Text
                    style={{
                      fontFamily: FONTS.semiBold,
                      fontSize: responsiveFontSize(1.7),
                      color: COLORS.black,
                      marginTop: responsiveHeight(1),
                    }}
                    numberOfLines={1}
                  >
                    {pref.key}
                  </Text>
                  <Text
                    style={{
                      fontFamily: FONTS.regular,
                      fontSize: responsiveFontSize(1.3),
                      color: COLORS.gray,
                      marginTop: 2,
                    }}
                    numberOfLines={1}
                  >
                    {detail.address || detail.houseNo || ""}
                  </Text>
                </TouchableOpacity>
              );
            })}

            {fetchingPreferences && (
              <View style={{ width: 100, justifyContent: 'center' }}>
                <ActivityIndicator size="small" color={COLORS.primary} />
              </View>
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
            fetchUserPreferences();
          }}
          address={
            currentAddressName
              ? `${currentAddressName}, ${currentAddressDetail}`
              : ""
          }
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
