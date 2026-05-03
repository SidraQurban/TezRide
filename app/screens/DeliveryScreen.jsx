import React, { useState, useEffect, useRef } from "react";
import {
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import MapComponent from "../components/MapComponent";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import BackBtn from "../components/BackBtn";
import DeliverybottomPanel from "../components/DeliverybottomPanel";
import { COLORS, FONTS } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { useNavigation } from "@react-navigation/native";
import { useRide } from "../context/RideContext";

const DeliveryScreen = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language?.startsWith("ur");

  const [pickup, setPickup] = useState({ latitude: 24.893, longitude: 67.075 });
  const [destination, setDestination] = useState({
    latitude: 24.8138,
    longitude: 67.0333,
  });
  const [pickupAddress, setPickupAddress] = useState(
    "Near 3 Sector 24 Chowrangi industrial area, Karachi",
  );
  const [homeAddress, setHomeAddress] = useState("Clifton, Karachi");

  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeField, setActiveField] = useState("pickup");
  const [sessionToken, setSessionToken] = useState("");
  const { setRouteCoords } = useRide();

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
    if (activeField === "pickup") setPickupAddress(description);
    else setHomeAddress(description);

    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${GOOGLE_MAPS_API_KEY}&fields=geometry`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === "OK") {
        const { lat, lng } = json.result.geometry.location;
        const coords = { latitude: lat, longitude: lng };
        setRouteCoords([]); // Clear old route immediately
        if (activeField === "pickup") setPickup(coords);
        else setDestination(coords);
      }
    } catch (error) {
      console.warn("Details error:", error);
    }
  };

  const onTextChange = (text, type) => {
    if (type === "pickup") {
      setPickupAddress(text);
    } else {
      setHomeAddress(text);
    }
    setActiveField(type);

    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      fetchPredictions(text);
    }, 500);
  };

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <View style={{ flex: 1 }}>
          {/* BACK BUTTON */}
          <View>
            <BackBtn />
          </View>

          {/* MAP */}
          <View
            style={{
              height: responsiveHeight(55),
              width: "100%",
              borderRadius: 15,
              overflow: "hidden",
            }}
          >
            <MapComponent
              pickup={pickup}
              destination={destination}
              showMarkers={true}
            />
          </View>

          {/* PREDICTIONS LIST OVERLAY */}
          {predictions.length > 0 && (
            <View style={styles.predictionsOverlay}>
              <FlatList
                data={predictions}
                keyExtractor={(item) => item.place_id}
                keyboardShouldPersistTaps="always"
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[styles.predictionItem, { flexDirection: isUrdu ? "row-reverse" : "row" }]}
                    onPress={() =>
                      handleLocationSelect(item.place_id, item.description)
                    }
                  >
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                    <Text style={[styles.predictionText, { 
                      textAlign: isUrdu ? "right" : "left",
                      marginLeft: isUrdu ? 0 : 10,
                      marginRight: isUrdu ? 10 : 0
                    }]} numberOfLines={1}>
                      {item.description}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          )}

          {/* BOTTOM PANEL */}
          <View
            style={{
              position: "absolute",
              bottom: 0,
              width: "100%",
              zIndex: 20,
            }}
          >
            <DeliverybottomPanel
              pickupAddress={pickupAddress}
              homeAddress={homeAddress}
              onTextChange={onTextChange}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  predictionsOverlay: {
    position: "absolute",
    bottom: responsiveHeight(30), // Adjusted to appear above bottom panel
    left: responsiveWidth(4),
    right: responsiveWidth(4),
    backgroundColor: "white",
    borderRadius: 12,
    elevation: 10,
    maxHeight: responsiveHeight(30),
    zIndex: 100,
    borderWidth: 1,
    borderColor: "#EEE",
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  predictionText: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    marginLeft: 10,
    color: COLORS.black,
  },
});

export default DeliveryScreen;
