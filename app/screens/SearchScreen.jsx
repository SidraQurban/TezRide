import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import SearchInput from "../components/SearchInput";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../components/BackBtn";
import CurrentLocation from "../components/CurrentLocation";
import { useTranslation } from "react-i18next";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import * as ExpoLocation from "expo-location";
import { useRide } from "../context/RideContext";

const SearchScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isUrdu = i18n.language?.startsWith("ur");
  const { setPickup: setCtxPickup, setDestination: setCtxDestination } = useRide();

  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupData, setPickupData] = useState(null);
  const [destinationData, setDestinationData] = useState(null);
  const [activeField, setActiveField] = useState("pickup");
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState("");
  const [currentLocation, setCurrentLocation] = useState(null);

  const debounceTimeout = useRef(null);
  const pickupRef = useRef(null);
  const destinationRef = useRef(null);
  const [searchPerformed, setSearchPerformed] = useState(false);

  // Generate a new session token for cost-effective billing
  const generateSessionToken = () => {
    return (
      Math.random().toString(36).substring(2, 15) +
      Math.random().toString(36).substring(2, 15)
    );
  };

  useEffect(() => {
    setSessionToken(generateSessionToken());

    // Auto-fetch location as soon as possible
    (async () => {
      try {
        let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
        if (status === "granted") {
          // Get last known position for immediate result
          let lastLocation = await ExpoLocation.getLastKnownPositionAsync({});
          if (lastLocation) {
            handleGeocode(lastLocation.coords);
          }

          // Then get fresh position
          let location = await ExpoLocation.getCurrentPositionAsync({
            accuracy: ExpoLocation.Accuracy.Balanced,
          });
          handleGeocode(location.coords);
        }
      } catch (error) {
        console.warn("Location fetch error:", error);
      }
    })();
  }, []);

  const handleGeocode = async (coords) => {
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
          "",
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
          distance: "0",
        };
        
        // Only auto-fill if the user hasn't started typing yet
        if (!pickup) {
          setPickup(locationData.name);
          setPickupData(locationData);
          // If we have pickup, focus destination automatically
          setActiveField("destination");
          setTimeout(() => destinationRef.current?.focus(), 100);
        }
      }
    } catch (e) {
      console.warn("Geocode error:", e);
    }
  };

  const fetchPredictions = async (input) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }

    setLoading(true);
    try {
      let url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
        input,
      )}&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken}&components=country:pk`;

      if (currentLocation) {
        url += `&location=${currentLocation.latitude},${currentLocation.longitude}&radius=50000`;
      }

      const response = await fetch(url);
      const json = await response.json();

      setSearchPerformed(true);
      if (json.status === "OK") {
        const filtered = json.predictions.filter(
          (p) =>
            !p.types.includes("locality") &&
            !p.types.includes("administrative_area_level_1") &&
            !p.types.includes("administrative_area_level_2") &&
            !p.types.includes("country"),
        );
        setPredictions(filtered);
      } else {
        setPredictions([]);
      }
    } catch (error) {
      console.error("Autocomplete Error:", error);
      setPredictions([]);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useCallback(
    (input) => {
      if (debounceTimeout.current) {
        clearTimeout(debounceTimeout.current);
      }
      debounceTimeout.current = setTimeout(() => {
        fetchPredictions(input);
      }, 500);
    },
    [sessionToken, currentLocation],
  );

  useEffect(() => {
    const query = activeField === "pickup" ? pickup : destination;
    if (query) {
      debouncedSearch(query);
    } else {
      setPredictions([]);
    }
  }, [pickup, destination, activeField, debouncedSearch]);

  const handleSelectLocation = async (item) => {
    setLoading(true);
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
          distance: "0",
        };

        if (activeField === "pickup") {
          setPickup(locationData.name);
          setPickupData(locationData);
          setPredictions([]);
          setSearchPerformed(false);
          if (destinationData) {
            setCtxPickup(locationData);
            setCtxDestination(destinationData);
            navigation.navigate("ConfirmRide", {
              pickup: locationData,
              destination: destinationData,
            });
          } else {
            setActiveField("destination");
            setTimeout(() => destinationRef.current?.focus(), 100);
          }
        } else {
          setDestination(locationData.name);
          setDestinationData(locationData);
          setPredictions([]);
          setSearchPerformed(false);
          if (pickupData) {
            setCtxPickup(pickupData);
            setCtxDestination(locationData);
            navigation.navigate("ConfirmRide", {
              pickup: pickupData,
              destination: locationData,
            });
          } else {
            setActiveField("pickup");
            setTimeout(() => pickupRef.current?.focus(), 100);
          }
        }
        setSessionToken(generateSessionToken());
      }
    } catch (error) {
      console.error("Place Details Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setLoading(false);
        return;
      }
      let location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.BestForNavigation,
      });
      handleGeocode(location.coords);
    } catch (error) {
      console.error("Geocoding Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSwapLocations = () => {
    const tempText = pickup;
    const tempData = pickupData;
    setPickup(destination);
    setPickupData(destinationData);
    setDestination(tempText);
    setDestinationData(tempData);
  };

  const handleClearAll = () => {
    setPickup("");
    setDestination("");
    setPickupData(null);
    setDestinationData(null);
    setPredictions([]);
    setActiveField("pickup");
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => handleSelectLocation(item)}
      style={{
        flexDirection: isUrdu ? "row-reverse" : "row",
        alignItems: "center",
        paddingVertical: responsiveHeight(1.2),
        borderBottomWidth: index !== predictions.length - 1 ? 1 : 0,
        borderBottomColor: "#E5E5E5",
      }}
    >
      <View style={{ width: responsiveWidth(11), alignItems: "center", justifyContent: "center" }}>
        <Ionicons name="location-sharp" size={20} color={COLORS.primary} />
      </View>

      <View style={{ flex: 1, marginHorizontal: responsiveWidth(2) }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: responsiveFontSize(1.8),
            fontFamily: FONTS.semiBold,
            color: COLORS.black,
            textAlign: isUrdu ? "right" : "left",
          }}
        >
          {item.structured_formatting?.main_text}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: responsiveFontSize(1.5),
            color: "#666",
            marginTop: 2,
            fontFamily: FONTS.regular,
            textAlign: isUrdu ? "right" : "left",
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
      {loading && <ActivityIndicator size="small" color={COLORS.primary} />}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: responsiveWidth(4),
        backgroundColor: COLORS.background,
      }}
    >
      <BackBtn />

      <SearchInput
        pickup={pickup}
        setPickup={(text) => {
          setPickup(text);
          setActiveField("pickup");
        }}
        destination={destination}
        setDestination={(text) => {
          setDestination(text);
          setActiveField("destination");
        }}
        onSwapLocations={handleSwapLocations}
        pickupRef={pickupRef}
        destinationRef={destinationRef}
        onFocusPickup={() => {
          setActiveField("pickup");
          setSearchPerformed(false);
        }}
        onFocusDestination={() => {
          setActiveField("destination");
          setSearchPerformed(false);
        }}
      />
      
      <CurrentLocation onPress={handleUseCurrentLocation} />

      <View
        style={{
          flexDirection: isUrdu ? "row-reverse" : "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: responsiveHeight(2),
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(1.7),
            fontFamily: FONTS.semiBold,
          }}
        >
          {predictions.length} {t("results_found")}
        </Text>

        <TouchableOpacity onPress={handleClearAll}>
          <Text
            style={{
              fontSize: responsiveFontSize(1.7),
              color: COLORS.primary,
              fontFamily: FONTS.regular,
            }}
          >
            {t("clear_all")}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && predictions.length === 0 ? (
        <View style={{ marginTop: 20 }}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (activeField === "pickup" ? pickup : destination).trim().length > 0 &&
        predictions.length === 0 &&
        searchPerformed ? (
        <View style={{ flex: 1 }}>
          <Image
            source={require("../../assets/notFound.png")}
            style={{
              width: responsiveHeight(70),
              height: responsiveHeight(25),
              resizeMode: "contain",
              alignSelf: "center",
              marginTop: responsiveHeight(5),
            }}
          />
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(2),
                marginTop: responsiveHeight(5),
              }}
            >
              {t("not_found")}
            </Text>
            <Text
              style={{
                fontFamily: FONTS.regular,
                textAlign: "center",
                color: "#777",
              }}
            >
              {t("not_found_desc")}
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={predictions}
          keyExtractor={(item) => item.place_id}
          renderItem={renderItem}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
