import React, { useState, useEffect, useRef } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import BackBtn from "../components/BackBtn";
import MapComponent from "../components/MapComponent";
import SearchInput from "../components/SearchInput";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";

// MODULAR COMPONENTS
import CargoPackageDetails from "../components/CargoPackageDetails";
import CargoReceiverInfo from "../components/CargoReceiverInfo";
import CargoVehicleSelection from "../components/CargoVehicleSelection";
import CargoPricingSummary from "../components/CargoPricingSummary";
import CargoSchedule from "../components/CargoSchedule";

const CargoScreen = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = false; // Layout is always LTR
  const [pickup, setPickup] = useState("Clifton, Karachi, Pakistan");
  const [destination, setDestination] = useState("DHA Phase 6, Karachi, Pakistan");
  const [pickupCoords, setPickupCoords] = useState({ latitude: 24.8138, longitude: 67.0333 });
  const [destinationCoords, setDestinationCoords] = useState({ latitude: 24.7952, longitude: 67.0700 });
  const [predictions, setPredictions] = useState([]);
  const [activeField, setActiveField] = useState("pickup");
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState("");

  const [selectedCategory, setSelectedCategory] = useState("large_parcel");
  const [selectedVehicle, setSelectedVehicle] = useState("car");
  const [scheduleType, setScheduleType] = useState("Now");

  const debounceTimeout = useRef(null);

  useEffect(() => {
    setSessionToken(Math.random().toString(36).substring(2, 15));
  }, []);

  const fetchPredictions = async (input) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }
    setLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input,
      )}&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken}&components=country:pk`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.status === "OK") {
        setPredictions(json.predictions);
      }
    } catch (error) {
      console.warn("Prediction error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLocationSelect = async (placeId, description) => {
    setPredictions([]);

    if (activeField === "pickup") setPickup(description);
    else setDestination(description);

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry`;

      const response = await fetch(url);
      const json = await response.json();

      if (json.status === "OK") {
        const { lat, lng } = json.result.geometry.location;
        const coords = { latitude: lat, longitude: lng };

        if (activeField === "pickup") setPickupCoords(coords);
        else setDestinationCoords(coords);
      }
    } catch (error) {
      console.warn("Details error:", error);
    }
  };

  const handleTextChange = (text, field) => {
    if (field === "pickup") {
      setPickup(text);
    } else {
      setDestination(text);
    }

    setActiveField(field);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);

    debounceTimeout.current = setTimeout(() => {
      fetchPredictions(text);
    }, 500);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <BackBtn />

      {/* MAP */}
      <View style={styles.mapContainer}>
        <MapComponent
          pickup={pickupCoords}
          destination={destinationCoords}
          showMarkers={true}
        />

        {/* SEARCH CARD */}
        <View style={styles.searchInputContainer}>
          <SearchInput
            pickup={pickup}
            setPickup={(text) => handleTextChange(text, "pickup")}
            destination={destination}
            setDestination={(text) => handleTextChange(text, "destination")}
            onFocusPickup={() => setActiveField("pickup")}
            onFocusDestination={() => setActiveField("destination")}
            onSwapLocations={() => {
              const temp = pickup;
              setPickup(destination);
              setDestination(temp);

              const tempCoords = pickupCoords;
              setPickupCoords(destinationCoords);
              setDestinationCoords(tempCoords);
            }}
          />
        </View>

        {/* PREDICTIONS */}
        {predictions.length > 0 && (
          <View style={styles.predictionsContainer}>
            {loading && (
              <ActivityIndicator
                color={COLORS.primary}
                style={{ marginVertical: 10 }}
              />
            )}

            <FlatList
              data={predictions}
              keyExtractor={(item) => item.place_id}
              keyboardShouldPersistTaps="always"
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.predictionItem, { flexDirection: "row" }]}
                  onPress={() =>
                    handleLocationSelect(item.place_id, item.description)
                  }
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={COLORS.primary}
                  />
                  <Text style={[styles.predictionText, { textAlign: "left", marginRight: 0, marginLeft: 10 }]} numberOfLines={1}>
                    {item.description}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      {/* DETAILS */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <CargoPackageDetails
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
        />

        <CargoReceiverInfo />

        <CargoVehicleSelection
          selectedVehicle={selectedVehicle}
          setSelectedVehicle={setSelectedVehicle}
        />

        <CargoPricingSummary total="850" />

        <CargoSchedule
          scheduleType={scheduleType}
          setScheduleType={setScheduleType}
        />

        {/* BADGES */}
        <View style={[styles.badgesRow, { flexDirection: "row" }]}>
          <View style={[styles.badge, { flexDirection: "row" }]}>
            <Ionicons name="checkmark-circle" size={14} color="gray" />
            <Text style={[styles.badgeText, { marginRight: 0, marginLeft: 4 }]}>{t("insurance_badge")}</Text>
          </View>

          <View style={[styles.badge, { flexDirection: "row" }]}>
            <Ionicons name="time-outline" size={14} color="gray" />
            <Text style={[styles.badgeText, { marginRight: 0, marginLeft: 4 }]}>{t("realtime_tracking")}</Text>
          </View>

          <View style={[styles.badge, { flexDirection: "row" }]}>
            <Ionicons name="shield-checkmark" size={14} color="gray" />
            <Text style={[styles.badgeText, { marginRight: 0, marginLeft: 4 }]}>{t("verified_driver")}</Text>
          </View>
        </View>
      </ScrollView>

      {/* FOOTER */}
      <View style={styles.footer}>
        <TouchableOpacity activeOpacity={0.8}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.confirmBtn}
          >
            <Text style={styles.confirmBtnText}>
              {t("confirm_booking")} Rs 850
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default CargoScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },

  header: {
    height: responsiveHeight(7),
    justifyContent: "center",
    backgroundColor: COLORS.background,
    zIndex: 10,
  },

  mapContainer: {
    height: responsiveHeight(35),
    width: "100%",
  },

  searchInputContainer: {
    position: "absolute",
    bottom: -responsiveHeight(5),
    left: responsiveWidth(4),
    right: responsiveWidth(4),
    zIndex: 20,
  },

  predictionsContainer: {
    position: "absolute",
    top: responsiveHeight(30),
    left: responsiveWidth(4),
    right: responsiveWidth(4),
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 5,
    maxHeight: responsiveHeight(30),
    zIndex: 100,
    borderWidth: 1,
    borderColor: "#EEE",
  },

  predictionItem: {
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },

  predictionText: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    flex: 1,
    color: COLORS.black,
  },

  scrollContent: {
    paddingTop: responsiveHeight(7),
    paddingHorizontal: responsiveWidth(5), // Increased margin for better Urdu readability
    paddingBottom: responsiveHeight(12),
  },

  badgesRow: {
    justifyContent: "space-between",
    marginTop: 10,
  },

  badge: {
    alignItems: "center",
  },

  badgeText: {
    fontSize: responsiveFontSize(1.1),
    color: "gray",
  },

  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(2),
    paddingBottom: responsiveHeight(8),
    backgroundColor: "white",
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    elevation: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: -4 },
  },

  confirmBtn: {
    height: responsiveHeight(7),
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 4,
  },

  confirmBtnText: {
    color: "white",
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.2),
  },
});
