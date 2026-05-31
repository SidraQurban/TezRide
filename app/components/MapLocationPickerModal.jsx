import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  TextInput,
  FlatList,
  Keyboard,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import * as ExpoLocation from "expo-location";
import { COLORS, FONTS } from "../constants";
import MapComponent from "./MapComponent";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";

const { height } = Dimensions.get("window");

/**
 * MapLocationPickerModal
 * 
 * Self-contained two-step map picker:
 *   Step 1: User picks PICKUP on map
 *   Step 2: User picks DESTINATION on map
 *   → calls onSelect({ pickup, destination }) and closes
 * 
 * Props:
 *   visible   – bool
 *   onClose   – () => void  (called when user closes before completing)
 *   onSelect  – ({ pickup, destination }) => void
 */
const MapLocationPickerModal = ({ visible, onClose, onSelect }) => {
  const { t } = useTranslation();

  // ── Step tracking ─────────────────────────────────────────────────────────
  // "pickup" | "destination"
  const [step, setStep] = useState("pickup");
  const [confirmedPickup, setConfirmedPickup] = useState(null);

  // ── Map / address state ───────────────────────────────────────────────────
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [address, setAddress] = useState("");
  const [fetchingAddress, setFetchingAddress] = useState(false);
  const [forcedRegion, setForcedRegion] = useState(null);

  // ── Search state ──────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [searching, setSearching] = useState(false);
  const searchTimeout = useRef(null);

  // ── Step badge animation ──────────────────────────────────────────────────
  const stepAnim = useRef(new Animated.Value(0)).current;

  const isPickupStep = step === "pickup";
  const modeColor = isPickupStep ? COLORS.primary : "#FF3B30";
  const modeIcon = isPickupStep ? "person" : "flag";

  // ── Reset on open, reset on close ────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      // Full reset every time modal opens
      setStep("pickup");
      setConfirmedPickup(null);
      setAddress("");
      setSelectedRegion(null);
      setForcedRegion(null);
      setSearchQuery("");
      setPredictions([]);
      fetchCurrentLocation();
    }
  }, [visible]);

  // Animate step badge when step changes
  useEffect(() => {
    Animated.sequence([
      Animated.timing(stepAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
      Animated.timing(stepAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
    ]).start();
  }, [step]);

  // ── Fetch and center on current GPS location ──────────────────────────────
  const fetchCurrentLocation = async () => {
    try {
      const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") return;

      const location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.Balanced,
      });

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.012,
        longitudeDelta: 0.012,
      };

      setForcedRegion(region);
      setSelectedRegion(region);
      reverseGeocode(region);
    } catch (error) {
      console.warn("[MapPicker] Could not fetch location:", error);
    }
  };

  // ── Reverse geocode coordinates → address string ──────────────────────────
  const reverseGeocode = async (region) => {
    setFetchingAddress(true);
    setAddress("");
    try {
      const results = await ExpoLocation.reverseGeocodeAsync({
        latitude: region.latitude,
        longitude: region.longitude,
      });

      if (results && results.length > 0) {
        const item = results[0];
        const parts = [item.name, item.street, item.district, item.city].filter(Boolean);
        setAddress(parts.join(", "));
      } else {
        setAddress(`${region.latitude.toFixed(5)}, ${region.longitude.toFixed(5)}`);
      }
    } catch {
      setAddress(`${region.latitude.toFixed(5)}, ${region.longitude.toFixed(5)}`);
    } finally {
      setFetchingAddress(false);
    }
  };

  // ── Search autocomplete ───────────────────────────────────────────────────
  const fetchPredictions = async (input) => {
    if (!input.trim()) { setPredictions([]); return; }
    setSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&components=country:pk`;
      const res = await fetch(url);
      const json = await res.json();
      setPredictions(json.status === "OK" ? json.predictions : []);
    } catch {
      setPredictions([]);
    } finally {
      setSearching(false);
    }
  };

  const onSearchChange = (text) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchPredictions(text), 600);
  };

  const onSelectPrediction = async (item) => {
    Keyboard.dismiss();
    setPredictions([]);
    setSearchQuery(item.structured_formatting?.main_text || item.description);
    setSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&fields=geometry,formatted_address&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "OK" && json.result.geometry) {
        const { lat, lng } = json.result.geometry.location;
        const region = { latitude: lat, longitude: lng, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setForcedRegion(region);
        setSelectedRegion(region);
        setAddress(json.result.formatted_address);
      }
    } catch (e) {
      console.warn("[MapPicker] Place details error:", e);
    } finally {
      setSearching(false);
    }
  };

  // ── Confirm current step ──────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedRegion || !address || fetchingAddress) return;

    const locationData = {
      latitude: selectedRegion.latitude,
      longitude: selectedRegion.longitude,
      address,
      name: address.split(",")[0].trim(),
    };

    if (isPickupStep) {
      // Save pickup, advance to destination step
      setConfirmedPickup(locationData);
      setStep("destination");

      // Reset map state for destination selection
      setAddress("");
      setSelectedRegion(null);
      setSearchQuery("");
      setPredictions([]);
      // Keep the same map region visible (user starts from pickup spot and pans to destination)
    } else {
      // Both done – call parent and close
      onSelect({ pickup: confirmedPickup, destination: locationData });
      onClose();
    }
  };

  // ── Go back to pickup step ────────────────────────────────────────────────
  const handleBack = () => {
    if (!isPickupStep) {
      // Go back to pickup step
      setStep("pickup");
      setAddress(confirmedPickup?.address || "");
      setSelectedRegion(
        confirmedPickup
          ? { latitude: confirmedPickup.latitude, longitude: confirmedPickup.longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 }
          : null
      );
      setForcedRegion(
        confirmedPickup
          ? { latitude: confirmedPickup.latitude, longitude: confirmedPickup.longitude, latitudeDelta: 0.012, longitudeDelta: 0.012 }
          : null
      );
      setSearchQuery("");
      setPredictions([]);
      setConfirmedPickup(confirmedPickup); // keep it
    } else {
      // Close modal entirely
      onClose();
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={handleBack}>
      <View style={styles.container}>

        {/* ── HEADER ── */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
              <Ionicons
                name={isPickupStep ? "close" : "arrow-back"}
                size={26}
                color={COLORS.black}
              />
            </TouchableOpacity>

            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>
                {isPickupStep
                  ? t("set_pickup", "Set Pickup")
                  : t("set_destination", "Set Destination")}
              </Text>

              {/* Step pills */}
              <View style={styles.stepRow}>
                <View style={[styles.stepPill, { backgroundColor: COLORS.primary }]}>
                  <Ionicons name="person" size={10} color="#FFF" />
                  <Text style={styles.stepPillText}>{t("pickup", "Pickup")}</Text>
                </View>
                <View style={[styles.stepConnector, { backgroundColor: isPickupStep ? "#E0E0E0" : "#FF3B30" }]} />
                <View style={[styles.stepPill, { backgroundColor: isPickupStep ? "#E0E0E0" : "#FF3B30" }]}>
                  <Ionicons name="flag" size={10} color={isPickupStep ? "#999" : "#FFF"} />
                  <Text style={[styles.stepPillText, { color: isPickupStep ? "#999" : "#FFF" }]}>
                    {t("destination", "Destination")}
                  </Text>
                </View>
              </View>
            </View>

            {/* Confirmed pickup preview (visible on step 2) */}
            <View style={{ width: 44 }}>
              {!isPickupStep && confirmedPickup && (
                <View style={styles.pickupDot}>
                  <Ionicons name="checkmark" size={16} color="#FFF" />
                </View>
              )}
            </View>
          </View>

          {/* Search bar */}
          <View style={[styles.searchBar, { borderColor: `${modeColor}30` }]}>
            <Ionicons name="search" size={18} color={modeColor} />
            <TextInput
              key={step} // forces re-mount so placeholder/text clears on step change
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={
                isPickupStep
                  ? t("enter_pickup", "Search pickup location...")
                  : t("enter_destination", "Search destination...")
              }
              placeholderTextColor="#AAA"
              style={styles.searchInput}
            />
            {searching && <ActivityIndicator size="small" color={modeColor} />}
          </View>

          {/* Confirmed pickup summary (only shows on step 2) */}
          {!isPickupStep && confirmedPickup && (
            <View style={styles.confirmedPickupRow}>
              <View style={styles.confirmedPickupDot} />
              <Text style={styles.confirmedPickupText} numberOfLines={1}>
                {confirmedPickup.name || confirmedPickup.address}
              </Text>
              <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            </View>
          )}
        </View>

        {/* ── MAP ── */}
        <View style={styles.mapContainer}>
          <MapComponent
            isSelectionMode={true}
            forcedRegion={forcedRegion}
            onLocationSelected={(region) => {
              setSelectedRegion(region);
              reverseGeocode(region);
            }}
          />

          {/* Search suggestion overlay */}
          {predictions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <FlatList
                data={predictions}
                keyExtractor={(item) => item.place_id}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={styles.suggestionItem}
                    onPress={() => onSelectPrediction(item)}
                  >
                    <Ionicons name="location-outline" size={18} color={modeColor} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionMain} numberOfLines={1}>
                        {item.structured_formatting?.main_text || item.description}
                      </Text>
                      {item.structured_formatting?.secondary_text && (
                        <Text style={styles.suggestionSub} numberOfLines={1}>
                          {item.structured_formatting.secondary_text}
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>

        {/* ── BOTTOM CARD ── */}
        <View style={styles.addressCard}>
          <View style={styles.addressInfo}>
            <View style={[styles.addressIconBox, { backgroundColor: isPickupStep ? "rgba(255,92,0,0.08)" : "rgba(255,59,48,0.08)" }]}>
              <Ionicons name={modeIcon} size={22} color={modeColor} />
            </View>
            <View style={styles.addressTextBox}>
              <Text style={[styles.addressLabel, { color: modeColor }]}>
                {isPickupStep ? t("pickup", "Pickup") : t("destination", "Destination")}
              </Text>
              {fetchingAddress ? (
                <ActivityIndicator size="small" color={modeColor} style={{ alignSelf: "flex-start", marginTop: 4 }} />
              ) : (
                <Text style={styles.addressText} numberOfLines={2}>
                  {address || t("calculating_address", "Calculating address...")}
                </Text>
              )}
            </View>
          </View>

          <TouchableOpacity
            onPress={handleConfirm}
            disabled={fetchingAddress || !address}
            style={[styles.confirmBtn, (fetchingAddress || !address) && { opacity: 0.5 }]}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={isPickupStep ? [COLORS.primary, COLORS.secondary] : ["#FF3B30", "#FF6B6B"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.confirmBtnText}>
                {isPickupStep
                  ? t("confirm_pickup", "Confirm Pickup →")
                  : t("confirm_destination", "Confirm Destination ✓")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },

  // ── Header
  header: {
    paddingTop: height * 0.05,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 100,
  },
  headerTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2),
    color: COLORS.black,
    marginBottom: 6,
  },

  // Step pills
  stepRow: { flexDirection: "row", alignItems: "center" },
  stepPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
    gap: 4,
  },
  stepPillText: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.1),
    color: "#FFF",
  },
  stepConnector: {
    width: 20,
    height: 2,
    marginHorizontal: 4,
    borderRadius: 1,
  },
  pickupDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
  },

  // Confirmed pickup row (step 2)
  confirmedPickupRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,92,0,0.06)",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginTop: 8,
    gap: 8,
  },
  confirmedPickupDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  confirmedPickupText: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.4),
    color: COLORS.black,
  },

  // Search bar
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    marginLeft: 8,
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    color: COLORS.black,
  },

  // Map
  mapContainer: { flex: 1 },

  // Suggestions
  suggestionsContainer: {
    position: "absolute",
    top: 0,
    left: 12,
    right: 12,
    backgroundColor: "#FFF",
    borderRadius: 12,
    marginTop: 8,
    maxHeight: height * 0.35,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    zIndex: 1000,
  },
  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  suggestionMain: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.6),
    color: "#222",
  },
  suggestionSub: {
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.3),
    color: "#888",
    marginTop: 2,
  },

  // Bottom address card
  addressCard: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 22,
    paddingTop: 20,
    paddingBottom: height * 0.04,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.1,
    shadowRadius: 14,
  },
  addressInfo: { flexDirection: "row", alignItems: "center", marginBottom: 18 },
  addressIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  addressTextBox: { flex: 1 },
  addressLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.3),
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  addressText: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.6),
    color: COLORS.black,
    lineHeight: 20,
  },
  confirmBtn: { borderRadius: 16, overflow: "hidden" },
  gradient: { height: 54, justifyContent: "center", alignItems: "center" },
  confirmBtnText: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.9),
    color: COLORS.white,
  },
});

export default MapLocationPickerModal;
