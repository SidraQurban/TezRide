import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import BackBtn from "../components/BackBtn";
import VehicleType from "../components/VehicleType";
import CurrentLocation from "../components/CurrentLocation";
import TimeSelector from "../components/TimeSelector";
import DriverPreference from "../components/DriverPreference";
import RateInfo from "../components/RateInfo";
import { driverPreferences, timeOptions } from "../data/data";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import * as ExpoLocation from "expo-location";

const HireDriverScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const [pickup, setPickup] = useState("");
  const [pickupData, setPickupData] = useState(null);
  const [time, setTime] = useState("morning");
  const [gender, setGender] = useState("no_preference");
  const [startTime, setStartTime] = useState(new Date(2023, 1, 1, 9, 0));
  const [endTime, setEndTime] = useState(new Date(2023, 1, 1, 17, 0));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const scrollViewRef = useRef(null);

  // Places autocomplete state
  const [predictions, setPredictions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(() =>
    Math.random().toString(36).substring(2, 15)
  );
  const [currentLocation, setCurrentLocation] = useState(null);
  const debounceTimeout = useRef(null);

  // ─── Geocode coords → address ───────────────────────────────────────────────
  const handleGeocode = useCallback(async (coords) => {
    setCurrentLocation(coords);
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === "OK") {
        const result =
          json.results.find((r) => !r.types.includes("plus_code")) ||
          json.results[0];
        let cleanAddress = result.formatted_address.replace(
          /^[A-Z0-9]{4,}\+[A-Z0-9]{2,}\s*,?\s*/,
          ""
        );
        const addressParts = cleanAddress.split(",");
        const locationData = {
          id: result.place_id,
          name:
            addressParts.length > 1
              ? `${addressParts[0]}, ${addressParts[1]}`
              : addressParts[0],
          address: cleanAddress,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
        setPickup(locationData.name);
        setPickupData(locationData);
      }
    } catch (e) {
      console.warn("Geocode error:", e);
    } finally {
      setGeoLoading(false);
    }
  }, []);

  // ─── Auto-fetch on mount: instant (last known) + fresh ──────────────────────
  useEffect(() => {
    (async () => {
      try {
        const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status !== "granted") return;

        setGeoLoading(true);

        // 1. Immediately show last known position (near-instant)
        const lastKnown = await ExpoLocation.getLastKnownPositionAsync({});
        if (lastKnown) {
          handleGeocode(lastKnown.coords);
        }

        // 2. Refresh with accurate position in background
        const fresh = await ExpoLocation.getCurrentPositionAsync({
          accuracy: ExpoLocation.Accuracy.Balanced,
        });
        handleGeocode(fresh.coords);
      } catch (err) {
        console.warn("Location fetch error:", err);
        setGeoLoading(false);
      }
    })();
  }, []);

  // ─── Manual "use current location" button ───────────────────────────────────
  const fetchCurrentLocation = async () => {
    setGeoLoading(true);
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") { setGeoLoading(false); return; }
      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.BestForNavigation,
      });
      handleGeocode(location.coords);
    } catch (error) {
      console.warn("Location error:", error);
      setGeoLoading(false);
    }
  };

  // ─── Places Autocomplete ─────────────────────────────────────────────────────
  const fetchPredictions = useCallback(
    async (input) => {
      if (!input.trim()) { setPredictions([]); return; }
      setSearchLoading(true);
      try {
        let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken}&components=country:pk`;
        if (currentLocation) {
          url += `&location=${currentLocation.latitude},${currentLocation.longitude}&radius=50000`;
        }
        const response = await fetch(url);
        const json = await response.json();
        if (json.status === "OK") {
          const filtered = json.predictions.filter(
            (p) =>
              !p.types.includes("locality") &&
              !p.types.includes("administrative_area_level_1") &&
              !p.types.includes("administrative_area_level_2") &&
              !p.types.includes("country")
          );
          setPredictions(filtered);
        } else {
          setPredictions([]);
        }
      } catch (err) {
        console.error("Autocomplete Error:", err);
        setPredictions([]);
      } finally {
        setSearchLoading(false);
      }
    },
    [sessionToken, currentLocation]
  );

  const handlePickupChange = (text) => {
    setPickup(text);
    setPickupData(null); // clear saved data when user edits
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchPredictions(text), 500);
  };

  // ─── Select a suggestion ────────────────────────────────────────────────────
  const handleSelectPrediction = async (item) => {
    setSearchLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&fields=name,geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === "OK") {
        const { location } = json.result.geometry;
        const locationData = {
          id: item.place_id,
          name: json.result.name,
          address: json.result.formatted_address,
          latitude: location.lat,
          longitude: location.lng,
        };
        setPickup(locationData.name);
        setPickupData(locationData);
        setPredictions([]);
        // Rotate session token after a completed session
        setSessionToken(Math.random().toString(36).substring(2, 15));
      }
    } catch (err) {
      console.error("Place Details Error:", err);
    } finally {
      setSearchLoading(false);
    }
  };


  const [driverRate, setDriverRate] = useState(150);

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const calculateDuration = (start, end) => {
    const diff = end - start;
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  };

  const duration = calculateDuration(startTime, endTime);
  const totalPrice = duration * driverRate;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: responsiveWidth(4),
      }}
    >
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View>
          <BackBtn />
        </View>
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 350 }}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Pickup input with autocomplete ─────────────────────── */}
          <View style={{ zIndex: 999 }}>
            <View
              style={{
                backgroundColor: COLORS.white,
                borderRadius: responsiveWidth(3),
                padding: responsiveHeight(1),
                elevation: 3,
                borderWidth: 1,
                borderColor: COLORS.primary,
              }}
            >
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Ionicons name="location-outline" size={20} color={COLORS.icon} />
                <TextInput
                  placeholder={t("enter_pickup")}
                  value={pickup}
                  onChangeText={handlePickupChange}
                  style={{
                    flex: 1,
                    marginLeft: responsiveWidth(2),
                    fontSize: responsiveFontSize(1.8),
                    fontFamily: FONTS.medium,
                    paddingVertical: 2,
                    color: COLORS.black,
                    lineHeight: responsiveFontSize(3.5),
                    includeFontPadding: false,
                  }}
                  placeholderTextColor="#999"
                />
                {/* spinner: geocoding or search in progress */}
                {(geoLoading || searchLoading) && (
                  <ActivityIndicator
                    size="small"
                    color={COLORS.primary}
                    style={{ marginRight: responsiveWidth(2) }}
                  />
                )}
                {/* clear button */}
                {pickup.length > 0 && !geoLoading && (
                  <TouchableOpacity
                    onPress={() => {
                      setPickup("");
                      setPickupData(null);
                      setPredictions([]);
                    }}
                  >
                    <Ionicons name="close-circle" size={18} color="#aaa" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* ── Autocomplete dropdown — floats OVER content below ─── */}
            {predictions.length > 0 && (
              <View
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  right: 0,
                  backgroundColor: COLORS.white,
                  borderRadius: responsiveWidth(2),
                  elevation: 20,
                  zIndex: 999,
                  shadowColor: "#000",
                  shadowOpacity: 0.15,
                  shadowOffset: { width: 0, height: 4 },
                  shadowRadius: 6,
                  maxHeight: responsiveHeight(30),
                  marginTop: 4,
                  overflow: "hidden",
                }}
              >
                <FlatList
                  data={predictions}
                  keyExtractor={(item) => item.place_id}
                  keyboardShouldPersistTaps="handled"
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item, index }) => (
                    <TouchableOpacity
                      onPress={() => handleSelectPrediction(item)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        paddingVertical: responsiveHeight(1.2),
                        paddingHorizontal: responsiveWidth(3),
                        borderBottomWidth: index !== predictions.length - 1 ? 1 : 0,
                        borderBottomColor: "#F0F0F0",
                      }}
                    >
                      <Ionicons
                        name="location-sharp"
                        size={18}
                        color={COLORS.primary}
                        style={{ marginRight: responsiveWidth(2) }}
                      />
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: responsiveFontSize(1.8),
                            fontFamily: FONTS.semiBold,
                            color: COLORS.black,
                          }}
                        >
                          {item.structured_formatting?.main_text}
                        </Text>
                        <Text
                          numberOfLines={1}
                          style={{
                            fontSize: responsiveFontSize(1.5),
                            fontFamily: FONTS.regular,
                            color: "#888",
                            marginTop: 2,
                          }}
                        >
                          {item.structured_formatting?.secondary_text
                            ?.split(",")
                            .slice(0, -2)
                            .join(",")
                            .trim() ||
                            item.structured_formatting?.secondary_text?.split(",")[0]}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          <CurrentLocation onPress={fetchCurrentLocation} />
          <VehicleType />
          <TimeSelector
            timeOptions={timeOptions}
            time={time}
            setTime={setTime}
            startTime={startTime}
            setStartTime={setStartTime}
            endTime={endTime}
            setEndTime={setEndTime}
            showStartPicker={showStartPicker}
            setShowStartPicker={setShowStartPicker}
            showEndPicker={showEndPicker}
            setShowEndPicker={setShowEndPicker}
            formatTime={formatTime}
          />
          <DriverPreference
            driverPreferences={driverPreferences}
            gender={gender}
            setGender={setGender}
          />
          <RateInfo
            driverRate={driverRate}
            setDriverRate={setDriverRate}
            duration={duration}
            totalPrice={totalPrice}
            onFocus={() => {
              setTimeout(() => {
                scrollViewRef.current?.scrollToEnd({ animated: true });
              }, 150);
            }}
          />
        </ScrollView>
      </KeyboardAvoidingView>

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() =>
          navigation.navigate("SearchDriver", {
            selectedGender: gender,
            pickup: pickupData || { address: pickup, latitude: 33.6844, longitude: 73.0479 },
          })
        }
        style={{
          marginTop: responsiveHeight(1),
          position: "absolute",
          bottom: responsiveHeight(7),
          left: responsiveWidth(4),
          right: responsiveWidth(4),
          zIndex: 5,
        }}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: "100%",
            paddingVertical: responsiveHeight(2),
            borderRadius: responsiveHeight(3),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(2),
            }}
          >
            {t("request_driver")}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HireDriverScreen;

