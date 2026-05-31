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
 * SingleMapLocationPickerModal
 * 
 * Simplified map picker for selecting a SINGLE location.
 */
const SingleMapLocationPickerModal = ({ visible, onClose, onSelect, title }) => {
  const { t } = useTranslation();

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

  // ── Reset on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (visible) {
      setAddress("");
      setSelectedRegion(null);
      setForcedRegion(null);
      setSearchQuery("");
      setPredictions([]);
      fetchCurrentLocation();
    }
  }, [visible]);

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
      console.warn("[SingleMapPicker] Could not fetch location:", error);
    }
  };

  // ── Reverse geocode using Google Maps ──────────────────────────────────────
  const reverseGeocode = async (region) => {
    setFetchingAddress(true);
    setAddress("");
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${region.latitude},${region.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
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
        setAddress(cleanAddress);
      } else {
        setAddress(`${region.latitude.toFixed(5)}, ${region.longitude.toFixed(5)}`);
      }
    } catch (error) {
      console.warn("[SingleMapPicker] Reverse geocode error:", error);
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
      console.warn("[SingleMapPicker] Place details error:", e);
    } finally {
      setSearching(false);
    }
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (!selectedRegion || !address || fetchingAddress) return;

    const addressParts = address.split(",");
    const locationName = addressParts.length > 1
      ? `${addressParts[0]}, ${addressParts[1]}`.trim()
      : addressParts[0].trim();

    const locationData = {
      latitude: selectedRegion.latitude,
      longitude: selectedRegion.longitude,
      address,
      name: locationName,
    };

    onSelect(locationData);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <View style={styles.container}>
        {/* HEADER */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <TouchableOpacity onPress={onClose} style={styles.backBtn}>
              <Ionicons name="close" size={26} color={COLORS.black} />
            </TouchableOpacity>
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{title || t("selected_location", "Select Location")}</Text>
            </View>
            <View style={{ width: 44 }} />
          </View>

          {/* Search bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={18} color={COLORS.primary} />
            <TextInput
              value={searchQuery}
              onChangeText={onSearchChange}
              placeholder={t("enter_address_placeholder", "Search location...")}
              placeholderTextColor="#AAA"
              style={styles.searchInput}
            />
            {searching && <ActivityIndicator size="small" color={COLORS.primary} />}
          </View>
        </View>

        {/* MAP */}
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
                    <Ionicons name="location-outline" size={18} color={COLORS.primary} style={{ marginRight: 10 }} />
                    <View style={{ flex: 1 }}>
                      <Text style={styles.suggestionMain} numberOfLines={1}>{item.structured_formatting?.main_text || item.description}</Text>
                      {item.structured_formatting?.secondary_text && (
                        <Text style={styles.suggestionSub} numberOfLines={1}>{item.structured_formatting.secondary_text}</Text>
                      )}
                    </View>
                  </TouchableOpacity>
                )}
                keyboardShouldPersistTaps="handled"
              />
            </View>
          )}
        </View>

        {/* BOTTOM CARD */}
        <View style={styles.addressCard}>
          <View style={styles.addressInfo}>
            <View style={styles.addressIconBox}>
              <Ionicons name="location" size={22} color={COLORS.primary} />
            </View>
            <View style={styles.addressTextBox}>
              <Text style={styles.addressLabel}>{t("selected_location", "Selected Location")}</Text>
              {fetchingAddress ? (
                <ActivityIndicator size="small" color={COLORS.primary} style={{ alignSelf: "flex-start", marginTop: 4 }} />
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
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradient}
            >
              <Text style={styles.confirmBtnText}>{t("confirm_location", "CONFIRM LOCATION")}</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  header: {
    paddingTop: height * 0.05,
    paddingBottom: 14,
    paddingHorizontal: 16,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    zIndex: 100,
  },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  backBtn: { padding: 4 },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontFamily: FONTS.bold, fontSize: responsiveFontSize(2), color: COLORS.black },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F7FA",
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    borderWidth: 1,
    borderColor: "rgba(255,92,0,0.1)",
  },
  searchInput: { flex: 1, height: "100%", marginLeft: 8, fontFamily: FONTS.medium, fontSize: responsiveFontSize(1.6), color: COLORS.black },
  mapContainer: { flex: 1 },
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
  suggestionItem: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#F0F0F0" },
  suggestionMain: { fontFamily: FONTS.semiBold, fontSize: responsiveFontSize(1.6), color: "#222" },
  suggestionSub: { fontFamily: FONTS.regular, fontSize: responsiveFontSize(1.3), color: "#888", marginTop: 2 },
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
  addressIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,92,0,0.08)", justifyContent: "center", alignItems: "center", marginRight: 14 },
  addressTextBox: { flex: 1 },
  addressLabel: { fontFamily: FONTS.semiBold, fontSize: responsiveFontSize(1.3), marginBottom: 2, color: COLORS.primary, textTransform: "uppercase", letterSpacing: 0.5 },
  addressText: { fontFamily: FONTS.bold, fontSize: responsiveFontSize(1.6), color: COLORS.black, lineHeight: 20 },
  confirmBtn: { borderRadius: 16, overflow: "hidden" },
  gradient: { height: 54, justifyContent: "center", alignItems: "center" },
  confirmBtnText: { fontFamily: FONTS.bold, fontSize: responsiveFontSize(1.9), color: COLORS.white },
});

export default SingleMapLocationPickerModal;
