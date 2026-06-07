import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Modal,
  TextInput,
  Image,
  ScrollView,
} from "react-native";

import { useNavigation, useRoute } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons, Fontisto, FontAwesome } from "@expo/vector-icons";
import MapComponent from "../components/MapComponent";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import RidesSlider from "../components/RidesSlider";
import { LinearGradient } from "expo-linear-gradient";
import BackBtn from "../components/BackBtn";
import { useTranslation } from "react-i18next";
import rideService from "../api/rideService";
import pricingService from "../api/pricingService";
import customerHub from "../api/customerHub";
import authService from "../api/authService";
import * as ImagePicker from "expo-image-picker";
import storage from "../utils/storage";
import { rides } from "../data/data.jsx";
import { useRide } from "../context/RideContext";
import { useAlert } from "../context/AlertContext";

const ConfirmRide = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {
    pickup: ctxPickup,
    destination: ctxDestination,
    routeDetails,
    setRouteDetails,
    setPickup,
    setDestination,
    selectedService,
    setSelectedService,
    setActiveRide,
  } = useRide();
  const { showAlert, showToast } = useAlert();

  const pickup = ctxPickup;
  const destination = ctxDestination;

  // Sync route params to context on mount - ONLY ONCE
  useEffect(() => {
    if (route.params?.pickup) {
      setPickup(route.params.pickup);
    }
    if (route.params?.destination) {
      setDestination(route.params.destination);
    }
  }, []); // Empty dependency array to run only once on mount

  const { t, i18n } = useTranslation();
  const isRTL = false;
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["54%", "56%"], []);
  const [loading, setLoading] = useState(false);
  const [genderPreference, setGenderPreference] = useState("male"); // 'male', 'female'
  const [prefModalVisible, setPrefModalVisible] = useState(false);

  // ── Live pricing state ────────────────────────────────────────────────────
  // Map of vehicleTypeSlug → EstimateDto
  // e.g. { bike: { estimatedFare: 192, currency: 'PKR', surgeFactor: 1.0, ... } }
  const [priceMap, setPriceMap] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  
  // Ref-based tracker to prevent infinite loops in handleRouteReady
  const lastStateRef = useRef({
    distance: 0,
    duration: 0,
    slugsJson: "[]",
    faresJson: "{}",
    pickupLat: 0,
    pickupLon: 0,
    destLat: 0,
    destLon: 0,
    lastFetchedAt: 0
  });
  const [customerStatus, setCustomerStatus] = useState(null); // 0: NotSubmitted, 1: Pending, 2: Approved
  const [vModalVisible, setVModalVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [tempPref, setTempPref] = useState("male");
  const [gModalVisible, setGModalVisible] = useState(false);
  const [waveDrivers, setWaveDrivers] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [walletAlertVisible, setWalletAlertVisible] = useState(false);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionType, setSelectionType] = useState("pickup");
  const [forcedRegion, setForcedRegion] = useState(null);

  // Verification form state
  const [vForm, setVForm] = useState({
    firstName: "",
    lastName: "",
    gender: "Female",
    cnicNumber: "",
    address: "",
    frontImage: null,
    backImage: null,
    requiresWomenOnlyRides: true,
  });

  // Search state for selection mode
  const [searchQuery, setSearchQuery] = useState("");
  const [predictions, setPredictions] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [isResolvingAddress, setIsResolvingAddress] = useState(false);
  const debounceTimer = useRef(null);
  const ignoreNextRegionChange = useRef(false);

  const PAYMENT_METHODS = [
    {
      id: "Cash",
      label: "cash",
      fallbackLabel: "Cash",
      icon: "cash-outline",
      desc: "pay_with_cash",
      descFallback: "Pay after your ride",
    },
    {
      id: "Digital Payment",
      label: "digital_payment",
      fallbackLabel: "Digital Payment",
      icon: "card-outline",
      desc: "pay_digitally",
      descFallback: "EasyPaisa, JazzCash, Card",
    },
    {
      id: "Wallet",
      label: "wallet",
      fallbackLabel: "Wallet",
      icon: "wallet-outline",
      desc: "pay_from_wallet",
      descFallback: "Use your app balance",
    },
  ];

  const handlePaymentSelect = (method) => {
    setPaymentMethod(method);
    setPaymentModalVisible(false);
  };

  const activePayment = PAYMENT_METHODS.find(m => m.id === paymentMethod) || PAYMENT_METHODS[0];

  // Pre-fill form from storage if available
  useEffect(() => {
    const prefill = async () => {
      const name = await storage.getItem("customerName");
      const gender = await storage.getItem("customerGender");
      if (name || gender) {
        setVForm(prev => ({
          ...prev,
          firstName: name ? name.split(" ")[0] : prev.firstName,
          lastName: name && name.split(" ").length > 1 ? name.split(" ").slice(1).join(" ") : prev.lastName,
          gender: gender === "female" ? "Female" : (gender === "male" ? "Male" : prev.gender)
        }));
      }
    };
    prefill();
  }, []);

  const selectedRide = rides.find((r) => r.id === selectedService);

  // Real-time wave drivers listener & polling idle drivers
  useEffect(() => {
    let intervalId;
    let isActive = true;

    const setupHubAndPoll = async () => {
      try {
        await customerHub.start();
        
        const fetchNearby = async () => {
          if (isActive && pickup?.latitude && pickup?.longitude) {
            try {
              const svc = selectedService || "bike";
              const gen = genderPreference || "male";
              const drivers = await customerHub.getNearbyDrivers(svc, pickup.latitude, pickup.longitude, gen);
              
              if (isActive && drivers) {
                setWaveDrivers(drivers);
              }
            } catch (err) {
              // Silent catch
            }
          }
        };

        // Initial fetch
        fetchNearby();

        // Polling every 3 seconds for nearby drivers
        intervalId = setInterval(fetchNearby, 3000);
      } catch (e) {
        console.warn("[ConfirmRide] Hub/Poll setup failed:", e);
      }
    };

    setupHubAndPoll();

    const onWaveDrivers = (payload) => {
      // Handle both camelCase and PascalCase from server
      const drivers = payload?.drivers || payload?.Drivers;
      if (drivers) {
        setWaveDrivers(drivers);
      }
    };

    customerHub.on("wave_drivers", onWaveDrivers);
    
    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
      customerHub.off("wave_drivers", onWaveDrivers);
    };
  }, [pickup, selectedService, genderPreference]);

  // ── Called by MapViewDirections when route is computed ────────────────────
  const handleRouteReady = useCallback(
    async (result) => {
      const now = Date.now();
      
      // 1. Check if route metrics or coords truly changed
      const isMetricsSame = 
        Math.abs(lastStateRef.current.distance - result.distance) < 0.01 &&
        Math.abs(lastStateRef.current.duration - result.duration) < 0.1;
      
      const isPathSame = 
        lastStateRef.current.pickupLat === pickup?.latitude &&
        lastStateRef.current.pickupLon === pickup?.longitude &&
        lastStateRef.current.destLat === destination?.latitude &&
        lastStateRef.current.destLon === destination?.longitude;

      // Tight loop protection: if everything is same, or if we fetched < 3s ago, block it.
      const timeSinceLastFetch = now - lastStateRef.current.lastFetchedAt;
      if (isMetricsSame && isPathSame && (timeSinceLastFetch < 3000 || lastStateRef.current.slugsJson !== "[]")) {
        return;
      }

      // Update refs to block concurrent triggers
      lastStateRef.current.distance = result.distance;
      lastStateRef.current.duration = result.duration;
      lastStateRef.current.pickupLat = pickup?.latitude || 0;
      lastStateRef.current.pickupLon = pickup?.longitude || 0;
      lastStateRef.current.destLat = destination?.latitude || 0;
      lastStateRef.current.destLon = destination?.longitude || 0;
      lastStateRef.current.lastFetchedAt = now;

      setRouteDetails(result);

      if (!pickup?.latitude || !destination?.latitude) return;

      setPriceLoading(true);
      try {
        const response = await pricingService.getEstimates({
          pickupLat: pickup.latitude,
          pickupLon: pickup.longitude,
          dropoffLat: destination.latitude,
          dropoffLon: destination.longitude,
          estimatedDistanceKm: result.distance,
          estimatedDurationMinutes: result.duration,
        });

        if (response.succeeded && Array.isArray(response.data)) {
          const newMap = {};
          response.data.forEach((item) => {
            newMap[item.vehicleTypeSlug] = item;
          });

          const sortedSlugs = Object.keys(newMap).sort();
          const slugsJson = JSON.stringify(sortedSlugs);
          const faresJson = JSON.stringify(sortedSlugs.map(s => newMap[s].estimatedFare));

          if (slugsJson !== lastStateRef.current.slugsJson || faresJson !== lastStateRef.current.faresJson) {
            lastStateRef.current.slugsJson = slugsJson;
            lastStateRef.current.faresJson = faresJson;
            setPriceMap(newMap);
          }
        }
      } catch (err) {
        console.warn("[ConfirmRide] Pricing fetch failed:", err?.message);
      } finally {
        setPriceLoading(false);
      }
    },
    [pickup?.latitude, pickup?.longitude, destination?.latitude, destination?.longitude, setRouteDetails],
  );

  // Auto-select first available vehicle if current one is not in estimates
  useEffect(() => {
    const slugs = Object.keys(priceMap).sort();
    if (slugs.length > 0 && !slugs.includes(selectedService)) {
      setSelectedService(slugs[0]);
    }
  }, [priceMap, selectedService]);

  // ── Confirm ride ──────────────────────────────────────────────────────────
  const handleConfirmRide = async () => {
    if (!pickup || !destination || loading) return;

    // Final guard for women preference
    if (genderPreference === "female" && (customerStatus !== 2 && customerStatus !== "Approved")) {
      showAlert({
        title: t("verification_required_title"),
        message: t("verification_required_msg"),
        type: 'info'
      });
      return;
    }

    setLoading(true);
    try {
      // Connect the SignalR hub on-demand (no-op if already connected)
      // Must happen BEFORE requestRide so the server can push events immediately
      await customerHub.start();

      const liveEstimate = priceMap[selectedService];
        const getAddr = (loc, fallback) => {
          if (!loc) return fallback;
          return (loc.address || loc.formatted_address || loc.name || loc.description || fallback).trim();
        };

        const pickupAddr = getAddr(pickup, "Pickup Location");
        const dropoffAddr = getAddr(destination, "Dropoff Location");

      const requestData = {
        pickup: {
          lat: pickup.latitude,
          lon: pickup.longitude,
          address: pickupAddr,
          name: pickup.name || pickupAddr,
          formatted_address: pickup.address || pickup.formatted_address || pickupAddr,
        },
        dropoff: {
          lat: destination.latitude,
          lon: destination.longitude,
          address: dropoffAddr,
          name: destination.name || dropoffAddr,
          formatted_address: destination.address || destination.formatted_address || dropoffAddr,
        },
        pickupAddress: pickupAddr,
        dropoffAddress: dropoffAddr,
        vehicleType: selectedService,
        genderPreference: genderPreference,
        minRating: 0,
        estimatedFare: liveEstimate?.estimatedFare || 0,
        estimatedDistance: liveEstimate?.estimatedDistanceKm || routeDetails?.distance || 0,
        estimatedDuration: liveEstimate?.estimatedDurationMinutes || routeDetails?.duration || 0,
        paymentMethod: paymentMethod,
      };

      const response = await rideService.requestRide(requestData);

      if (response.succeeded) {
        const rideId = response.data.rideId;
        const status = response.data.status;

        // Force-sync addresses via WebSocket to ensure backend captures them
        try {
          customerHub.submitRideAddresses(rideId, pickupAddr, dropoffAddr);
        } catch (e) {
          console.warn("[WS Address Sync Failed]:", e);
        }

        if (!rideId || rideId === "00000000-0000-0000-0000-000000000000") {
          showAlert({
            title: t("error"),
            message: t("could_not_create_ride") || "Could not create ride. Please try again.",
            type: 'error',
            icon: <Ionicons name="alert-circle-outline" size={60} color={COLORS.primary} />
          });
          return;
        }

        setActiveRide({
          rideId,
          status: "searching",
          assignedDriver: null,
          finalFare: null,
          currency: null,
        });

        // Resolve live price for this vehicle (fallback to static)
        const liveEstimate = priceMap[selectedService];

        navigation.navigate("SearchingDirection", {
          rideImage: selectedRide?.image,
          pickup,
          destination,
          rideId,
          vehicleType: selectedService,
          price: liveEstimate
            ? Math.round(liveEstimate.estimatedFare)
            : selectedRide?.price,
        });
      } else {
        const msg = response.message || "";
        showAlert({
          title: t("error"),
          message: msg.includes("Insufficient wallet balance") 
            ? t("insufficient_balance_msg") 
            : (msg || t("ride_request_failed")),
          type: 'error',
          icon: paymentMethod === 'Wallet' 
            ? <Ionicons name="wallet-outline" size={60} color={COLORS.primary} />
            : <Ionicons name="alert-circle-outline" size={60} color={COLORS.primary} />
        });
      }
    } catch (error) {
      showAlert({
        title: t("error"),
        message: error.message || t("something_went_wrong"),
        type: 'error',
        icon: <Ionicons name="alert-circle-outline" size={60} color={COLORS.primary} />
      });
    } finally {
      setLoading(false);
    }
  };

  const reverseGeocode = async (coords) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const response = await fetch(url);
      const json = await response.json();
      if (json.status === "OK") {
        const result = json.results[0];
        const address = result.formatted_address;
        const name = address.split(',')[0];
        return {
          id: result.place_id,
          address,
          name,
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }
    } catch (error) {
      console.warn("[ConfirmRide] Reverse geocode error:", error);
    }
    return null;
  };

  const handlePickupDragEnd = async (coords) => {
    setIsResolvingAddress(true);
    const data = await reverseGeocode(coords);
    if (data) setPickup(data);
    setIsResolvingAddress(false);
  };

  const handleDestinationDragEnd = async (coords) => {
    setIsResolvingAddress(true);
    const data = await reverseGeocode(coords);
    if (data) setDestination(data);
    setIsResolvingAddress(false);
  };

  const handleLocationConfirm = () => {
    setIsSelectionMode(false);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const startSelection = (type) => {
    const point = type === "pickup" ? pickup : destination;
    if (point?.latitude && point?.longitude) {
      setForcedRegion({
        latitude: point.latitude,
        longitude: point.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      });
    }
    setSelectionType(type);
    setIsSelectionMode(true);
    bottomSheetRef.current?.close();
  };

  const checkStatusAndSetPref = async (newPref) => {
    if (newPref !== "female") {
      setGenderPreference("male");
      setPrefModalVisible(false);
      return;
    }

    try {
      setStatusLoading(true);
      const userId = await storage.getItem("userId");
      const response = await authService.getUserProfile(userId);

      if (response.succeeded) {
        // Based on audit, response.data holds the user profile directly
        const status = response.data.customerProfile?.customerStatus;
        setCustomerStatus(status);

        if (status === 2 || status === "Approved") {
          setGenderPreference("female");
          setPrefModalVisible(false);
        } else if (status === 1 || status === "Pending") {
          showAlert({
            title: t("pending_verification_title"),
            message: t("pending_verification_msg"),
            type: 'info'
          });
        } else {
          // status 0 or NotSubmitted
          showAlert({
            title: t("verification_required_title"),
            message: t("verification_required_msg"),
            type: 'info',
            okText: t("continue_btn"),
            cancelText: t("cancel_btn"),
            onOk: () => setVModalVisible(true),
            onCancel: () => {},
            icon: <Ionicons name="shield-checkmark-outline" size={60} color={COLORS.primary} />
          });
        }
      }
    } catch (error) {
      showAlert({
        title: t("error"),
        message: error.message || t("something_went_wrong"),
        type: 'error'
      });
    } finally {
      setStatusLoading(false);
    }
  };

  const pickImage = async (field) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
    });

    if (!result.canceled) {
      setVForm(prev => ({ ...prev, [field]: result.assets[0].uri }));
    }
  };

  const handleVerifySubmit = async () => {
    if (!vForm.firstName || !vForm.lastName || !vForm.cnicNumber || !vForm.address || !vForm.frontImage || !vForm.backImage) {
      showAlert({
        title: t("error"),
        message: "Please fill all fields and provide images.",
        type: 'error'
      });
      return;
    }

    setVerifying(true);
    try {
      const userId = await storage.getItem("userId");
      const formData = new FormData();
      formData.append("UserId", userId);
      formData.append("FirstName", vForm.firstName);
      formData.append("LastName", vForm.lastName);
      formData.append("Gender", vForm.gender);
      formData.append("CnicNumber", vForm.cnicNumber);
      formData.append("Address", vForm.address);
      formData.append("RequiresWomenOnlyRides", "true");

      // Append images
      const frontUri = vForm.frontImage;
      const frontName = frontUri.split("/").pop();
      formData.append("CnicFrontImage", {
        uri: frontUri,
        name: frontName,
        type: "image/jpeg",
      });

      const backUri = vForm.backImage;
      const backName = backUri.split("/").pop();
      formData.append("CnicBackImage", {
        uri: backUri,
        name: backName,
        type: "image/jpeg",
      });

      const response = await authService.submitCustomerVerification(formData);
      const isSuccess = response.succeeded === true || response.success === true || (response.message && response.message.toLowerCase().includes("success"));
      if (isSuccess) {
        showToast(response.message || t("verification_success_msg"), 'success');
        setVModalVisible(false);
        setCustomerStatus(1); // Set to pending locally
      } else {
        showAlert({
          title: t("error"),
          message: response.message || t("something_went_wrong"),
          type: 'error'
        });
      }
    } catch (error) {
      showAlert({
        title: t("error"),
        message: error.message || t("something_went_wrong"),
        type: 'error'
      });
    } finally {
      setVerifying(false);
    }
  };

  // ── Modals are inlined in the return below to avoid re-rendering issues ──

  const handleEditPickup = () => {
    navigation.navigate("Search", { activeField: "pickup" });
  };

  const handleEditDestination = () => {
    navigation.navigate("Search", { activeField: "destination" });
  };

  const fetchPredictions = async (text) => {
    if (!text || text.length < 3) {
      setPredictions([]);
      return;
    }
    setSearching(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(text)}&key=${GOOGLE_MAPS_API_KEY}&components=country:pk&language=${i18n.language}`;
      const resp = await fetch(url);
      const data = await resp.json();
      if (data.status === "OK") {
        setPredictions(data.predictions);
      }
    } catch (err) {
      console.warn("[ConfirmRide] Prediction error:", err);
    } finally {
      setSearching(false);
    }
  };

  const handleSearchChange = (text) => {
    setSearchQuery(text);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchPredictions(text), 600);
  };

  const handleSelectPrediction = async (prediction) => {
    setSearchQuery(prediction.description);
    setPredictions([]);
    try {
      const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${prediction.place_id}&key=${GOOGLE_MAPS_API_KEY}`;
      const resp = await fetch(detailUrl);
      const data = await resp.json();
      if (data.status === "OK") {
        const { lat, lng } = data.result.geometry.location;
        const newLoc = {
          id: prediction.place_id,
          name: prediction.structured_formatting?.main_text || prediction.description.split(",")[0],
          address: prediction.description,
          latitude: lat,
          longitude: lng,
        };
        
        if (selectionType === "pickup") setPickup(newLoc);
        else setDestination(newLoc);

        ignoreNextRegionChange.current = true;
        setForcedRegion({
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        });
      }
    } catch (err) {
      console.warn("[ConfirmRide] Place details error:", err);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* MAIN CONTENT */}
      <View style={{ flex: 1 }}>
        <View style={{ left: responsiveWidth(1.5) }}>
          <BackBtn />
        </View>

        <View
          style={{
            height: isSelectionMode ? responsiveHeight(90) : responsiveHeight(60),
            marginBottom: responsiveHeight(0.5),
          }}
        >
          <MapComponent
            pickup={pickup}
            destination={destination}
            useGlobalState={true}
            onRouteReady={handleRouteReady}
            onPickupDragEnd={handlePickupDragEnd}
            onDestinationDragEnd={handleDestinationDragEnd}
            onEditPickup={() => startSelection("pickup")}
            onEditDestination={() => startSelection("destination")}
            forcedRegion={forcedRegion}
            waveDrivers={waveDrivers}
            selectedCategory={selectedService}
            isSelectionMode={isSelectionMode}
            selectionType={selectionType}
            onLocationSelected={async (region) => {
              setForcedRegion(null); // Clear force once user moves map
              if (ignoreNextRegionChange.current) {
                ignoreNextRegionChange.current = false;
                return;
              }
              setIsResolvingAddress(true);
              const data = await reverseGeocode(region);
              if (data) {
                if (selectionType === "pickup") setPickup(data);
                else setDestination(data);
              }
              setIsResolvingAddress(false);
            }}
          />

          {/* FLOAT SEARCH BAR IN SELECTION MODE */}
          {isSelectionMode && (
            <View style={styles.floatingSearchContainer}>
              <View style={[
                styles.searchBox, 
                (searching || isFocused) && { borderColor: COLORS.primary, borderWidth: 1.5 }
              ]}>
                <TouchableOpacity 
                  onPress={() => {
                    setIsSelectionMode(false);
                    bottomSheetRef.current?.snapToIndex(0);
                    setSearchQuery("");
                    setPredictions([]);
                  }}
                  style={styles.selectionBackBtn}
                >
                  <Ionicons name="arrow-back" size={24} color={COLORS.black} />
                </TouchableOpacity>
                <TextInput
                  style={styles.searchInput}
                  placeholder={selectionType === "pickup" ? "Enter Pickup" : "Enter Destination"}
                  value={searchQuery}
                  onChangeText={handleSearchChange}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setIsFocused(false)}
                  placeholderTextColor="#9CA3AF"
                />
                {(searchQuery.length > 0 || searching) && (
                  <TouchableOpacity onPress={() => {setSearchQuery(""); setPredictions([]);}}>
                    {searching ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <Ionicons name="close-circle" size={20} color="#9BA3AF" />
                    )}
                  </TouchableOpacity>
                )}
              </View>

              {predictions.length > 0 && (
                <View style={styles.predictionsList}>
                  <ScrollView 
                    style={{ maxHeight: responsiveHeight(30) }} 
                    bounces={false}
                    keyboardShouldPersistTaps="handled"
                    nestedScrollEnabled={true}
                  >
                    {predictions.map((p, idx) => (
                      <TouchableOpacity 
                        key={p.place_id} 
                        style={[styles.predictionItem, idx === predictions.length - 1 && { borderBottomWidth: 0 }]}
                        onPress={() => handleSelectPrediction(p)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.predictionIconBox}>
                          <Ionicons name="location-sharp" size={18} color={COLORS.primary} />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.predictionMain} numberOfLines={1}>
                            {p.structured_formatting?.main_text || p.description.split(",")[0]}
                          </Text>
                          <Text style={styles.predictionSub} numberOfLines={1}>
                            {p.structured_formatting?.secondary_text || p.description}
                          </Text>
                        </View>
                        <Ionicons name="chevron-forward" size={14} color="#D1D5DB" />
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          )}


        </View>
      </View>

      {/* CONFIRM / SELECTION BUTTON */}
      <View
        style={{
          position: "absolute",
          bottom: responsiveHeight(6),
          left: responsiveWidth(4),
          right: responsiveWidth(4),
          zIndex: 50,
        }}
      >
        <TouchableOpacity
          onPress={isSelectionMode ? handleLocationConfirm : handleConfirmRide}
          disabled={loading || (isSelectionMode && isResolvingAddress)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={[
              styles.mainConfirmBtn,
              isSelectionMode && isResolvingAddress && { opacity: 0.6 }
            ]}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : isSelectionMode && isResolvingAddress ? (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.mainConfirmBtnText}>
                  {t('resolving_address', 'Resolving address...')}
                </Text>
              </View>
            ) : (
              <Text style={styles.mainConfirmBtnText}>
                {isSelectionMode 
                  ? (selectionType === "pickup" ? t("set_pickup") : t("set_destination"))
                  : t("confirm_ride")}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* PREFERENCE MODAL */}
      <Modal visible={prefModalVisible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setPrefModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalContent}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <View style={{ width: 40 }} />
              <Text style={[styles.modalTitle, { marginBottom: 0 }]}>{t("rider_preference")}</Text>
              <TouchableOpacity onPress={() => setGModalVisible(true)} style={{ width: 40, alignItems: "flex-end" }}>
                <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>

            <View style={styles.prefOptions}>
              {[
                { id: "male", label: "male_driver", icon: "account-tie" },
                { id: "female", label: "female_driver", icon: "account-tie-woman" },
              ].map((opt) => (
                <TouchableOpacity
                  key={opt.id}
                  style={[
                    styles.prefItem,
                    tempPref === opt.id && styles.prefItemActive,
                  ]}
                  onPress={() => setTempPref(opt.id)}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      tempPref === opt.id && styles.iconCircleActive,
                    ]}
                  >
                    <MaterialCommunityIcons
                      name={opt.icon}
                      size={40}
                      color={tempPref === opt.id ? COLORS.primary : "#374151"}
                    />
                  </View>
                  <Text
                    style={[
                      styles.prefLabel,
                      tempPref === opt.id && styles.prefLabelActive,
                    ]}
                  >
                    {t(opt.label)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              onPress={() => checkStatusAndSetPref(tempPref)}
              disabled={statusLoading}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                {statusLoading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Text style={styles.confirmBtnText}>{t("confirm_btn")}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* VERIFICATION MODAL */}
      <Modal visible={vModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { height: responsiveHeight(85) }]}>
            <View style={styles.modalIndicator} />
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <TouchableOpacity onPress={() => setVModalVisible(false)} style={{ width: 40, alignItems: "flex-start" }}>
                <Ionicons name="close" size={26} color={COLORS.black} />
              </TouchableOpacity>
              <Text style={[styles.modalTitle, { marginBottom: 0 }]}>{t("verification_title")}</Text>
              <TouchableOpacity onPress={() => setGModalVisible(true)} style={{ width: 40, alignItems: "flex-end" }}>
                <Ionicons name="information-circle-outline" size={24} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("first_name")}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t("first_name")}
                  value={vForm.firstName}
                  onChangeText={(text) => setVForm((prev) => ({ ...prev, firstName: text }))}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("last_name")}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t("last_name")}
                  value={vForm.lastName}
                  onChangeText={(text) => setVForm((prev) => ({ ...prev, lastName: text }))}
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("gender")}</Text>
                <View style={{ flexDirection: "row", gap: 10 }}>
                  {["Male", "Female", "Other"].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[
                        styles.prefItem,
                        { flex: 1, justifyContent: "center", paddingVertical: 12, height: 50 },
                        vForm.gender === g && styles.prefItemActive,
                      ]}
                      onPress={() => setVForm((prev) => ({ ...prev, gender: g }))}
                    >
                      <Text style={[
                        { 
                          fontSize: responsiveFontSize(1.6), 
                          fontFamily: FONTS.medium, 
                          color: "#374151", 
                          textAlign: "center" 
                        }, 
                        vForm.gender === g && styles.prefLabelActive
                      ]}>
                        {g === "Male" ? t("male") : g === "Female" ? t("female") : t("other")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("cnic_number")}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="42101-XXXXXXX-X"
                  value={vForm.cnicNumber}
                  onChangeText={(text) => setVForm((prev) => ({ ...prev, cnicNumber: text }))}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>{t("address")}</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder={t("address")}
                  value={vForm.address}
                  onChangeText={(text) => setVForm((prev) => ({ ...prev, address: text }))}
                  multiline
                />
              </View>

              <View style={styles.imageSelectors}>
                <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage("frontImage")}>
                  <Ionicons name="camera" size={24} color={COLORS.primary} />
                  <Text style={styles.imageBtnText}>{vForm.frontImage ? "Change Front" : t("cnic_front")}</Text>
                  {vForm.frontImage && <Image source={{ uri: vForm.frontImage }} style={styles.previewThumb} />}
                </TouchableOpacity>
                <TouchableOpacity style={styles.imageBtn} onPress={() => pickImage("backImage")}>
                  <Ionicons name="camera" size={24} color={COLORS.primary} />
                  <Text style={styles.imageBtnText}>{vForm.backImage ? "Change Back" : t("cnic_back")}</Text>
                  {vForm.backImage && <Image source={{ uri: vForm.backImage }} style={styles.previewThumb} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleVerifySubmit}
                disabled={verifying}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmBtn}
                >
                  {verifying ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.confirmBtnText}>{t("submit_verification")}</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setVModalVisible(false)} style={{ marginTop: 15 }}>
                <Text style={{ textAlign: "center", color: "#666", fontFamily: FONTS.medium }}>{t("cancel_btn")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>



      {/* VERIFICATION GUIDE MODAL (Why we ask) */}
      <Modal visible={gModalVisible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setGModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { paddingBottom: 15 }]}>
            <View style={styles.modalIndicator} />
            <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} style={{ alignSelf: "center", marginBottom: 15 }} />
            <Text style={styles.modalTitle}>{t("verification_guide_title")}</Text>
            <Text style={{
              textAlign: "center",
              fontSize: responsiveFontSize(1.8),
              color: "#4B5563",
              lineHeight: 24,
              fontFamily: FONTS.regular,
              marginBottom: 15,
              paddingHorizontal: 10
            }}>
              {t("verification_guide_desc")}
            </Text>
            <TouchableOpacity onPress={() => setGModalVisible(false)}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                <Text style={styles.confirmBtnText}>{t("ok_btn")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* WALLET PAYMENT ALERT MODAL */}
      <Modal
        transparent
        visible={walletAlertVisible}
        animationType="fade"
        onRequestClose={() => setWalletAlertVisible(false)}
      >
        <TouchableOpacity 
          style={styles.alertOverlay} 
          activeOpacity={1} 
          onPress={() => setWalletAlertVisible(false)}
        >
          <View style={styles.alertContainer}>
            <View style={styles.alertHeader}>
              <View style={{ 
                width: 70, 
                height: 70, 
                borderRadius: 35, 
                backgroundColor: COLORS.primary + '10', 
                justifyContent: 'center', 
                alignItems: 'center',
                alignSelf: 'center',
                marginBottom: 15
              }}>
                <Ionicons name="wallet-outline" size={40} color={COLORS.primary} />
              </View>
              <Text style={[styles.alertTitle, { textAlign: isRTL ? "right" : "left", alignSelf: 'center' }]}>
                {t("wallet_payment", "Wallet Payment")}
              </Text>
            </View>
            <View style={styles.alertContent}>
              <Text style={[styles.alertMessage, { textAlign: isRTL ? "right" : "left" }]}>
                {t("wallet_alert_msg", "You have selected Wallet as your payment method. Please ensure you have sufficient balance for the ride.")}
              </Text>
            </View>
            <TouchableOpacity 
              onPress={() => setWalletAlertVisible(false)} 
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.alertOkButton}
              >
                <Text style={styles.alertOkButtonText}>{t("ok_btn", "OK")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
      <Modal 
        visible={paymentModalVisible} 
        transparent 
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          style={styles.paymentModalOverlay}
          onPress={() => setPaymentModalVisible(false)}
        >
          <View style={styles.paymentModalContent}>
            <View style={styles.modalIndicator} />
            
            <Text style={styles.paymentModalTitle}>
              {t("payment_methods", "Select Payment Method")}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {PAYMENT_METHODS.map((method) => {
                const isActive = paymentMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    onPress={() => handlePaymentSelect(method.id)}
                    activeOpacity={0.7}
                    style={[
                      styles.paymentMethodItem,
                      isActive && styles.paymentMethodItemActive
                    ]}
                  >
                      <View
                        style={[
                          styles.paymentMethodIconBox,
                          isActive && styles.paymentMethodIconBoxActive
                        ]}
                      >
                        <Ionicons 
                          name={method.icon} 
                          size={24} 
                          color={isActive ? COLORS.primary : "#6B7280"} 
                        />
                      </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.paymentMethodLabel,
                          isActive && styles.paymentMethodLabelActive
                        ]}
                      >
                        {t(method.label) !== method.label
                          ? t(method.label)
                          : method.fallbackLabel}
                      </Text>
                      <Text style={styles.paymentMethodDesc}>
                        {t(method.desc) !== method.desc
                          ? t(method.desc)
                          : method.descFallback}
                      </Text>
                    </View>

                    <Ionicons 
                      name={isActive ? "checkmark-circle" : "ellipse-outline"} 
                      size={24} 
                      color={isActive ? COLORS.primary : "#D1D5DB"} 
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* BOTTOM SHEET */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        animateOnMount={true}
        enableDynamicSizing={false}
        enableContentPanningGesture={true}
        handleIndicatorStyle={{
          width: 60,
          height: 2,
          backgroundColor: "#E0E0E0",
        }}
        style={{ zIndex: 10 }}
      >
        <RidesSlider
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          pickup={pickup}
          destination={destination}
          distance={routeDetails?.distance}
          duration={routeDetails?.duration}
          priceMap={priceMap}
          priceLoading={priceLoading}
          genderPreference={genderPreference}
          onPreferencePress={() => {
            setTempPref(genderPreference);
            setPrefModalVisible(true);
          }}
          onEditPickup={() => startSelection("pickup")}
          onEditDestination={() => startSelection("destination")}
          onPaymentPress={() => setPaymentModalVisible(true)}
          activePayment={activePayment}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  mainConfirmBtn: {
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  mainConfirmBtnText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: responsiveHeight(4),
    borderTopRightRadius: responsiveHeight(4),
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: responsiveHeight(5),
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 10,
  },
  modalIndicator: {
    width: 32,
    height: 4,
    backgroundColor: "#E5E7EB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: "#111827",
    textAlign: "center",
    marginBottom: 20,
  },
  prefOptions: {
    gap: 12,
    marginBottom: 24,
  },
  prefItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
  },
  prefItemActive: {
    backgroundColor: "rgba(255, 92, 0, 0.04)",
    borderColor: COLORS.primary,
  },
  iconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  iconCircleActive: {
    backgroundColor: "#FFF7ED",
    borderColor: COLORS.primary,
  },
  prefLabel: {
    fontSize: responsiveFontSize(1.9),
    fontFamily: FONTS.medium,
    color: "#374151",
    width: responsiveWidth(50),
  },
  prefLabelActive: {
    color: "#111827",
    fontFamily: FONTS.semiBold,
  
  },
  confirmBtn: {
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  confirmBtnText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    color: "#374151",
    marginBottom: 5,
    textAlign: "left",
  },
  textInput: {
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.8),
    textAlign: "left",
    writingDirection: "ltr",
  },
  imageSelectors: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 20,
    gap: 10,
  },
  imageBtn: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
  },
  imageBtnText: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.3),
    color: COLORS.primary,
    marginTop: 5,
    textAlign: "center",
  },
  previewThumb: {
    width: 40,
    height: 40,
    borderRadius: 8,
    marginTop: 8,
  },
  submitBtn: {
    marginTop: 10,
  },
  alertOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  alertContainer: {
    width: responsiveWidth(85),
    backgroundColor: "#fff",
    borderRadius: 22,
    padding: 25,
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  alertHeader: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 12,
  },
  alertTitle: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.2),
    color: COLORS.primary,
  },
  alertContent: {
    marginBottom: 25,
  },
  alertMessage: {
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.8),
    color: "#4B5563",
    lineHeight: 24,
  },
  alertOkButton: {
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  alertOkButtonText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2),
  },

  paymentModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  paymentModalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingTop: 12,
    paddingBottom: responsiveHeight(5),
    paddingHorizontal: responsiveWidth(5),
    maxHeight: responsiveHeight(60),
    elevation: 20,
  },
  paymentModalTitle: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.2),
    color: '#111827',
    marginBottom: 20,
    textAlign: 'center',
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
  },
  paymentMethodItemActive: {
    backgroundColor: "#FFF7ED",
    borderColor: COLORS.primary,
  },
  paymentMethodIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  paymentMethodIconBoxActive: {
    backgroundColor: "#FFE4CC",
    borderColor: COLORS.primary,
  },
  paymentMethodLabel: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.9),
    color: "#111827",
  },
  paymentMethodLabelActive: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  paymentMethodDesc: {
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.4),
    color: "#6B7280",
    marginTop: 2,
  },
  
  // Selection Mode Styles
  floatingSearchContainer: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    zIndex: 100,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    borderRadius: 18,
    paddingHorizontal: 15,
    height: 58,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    borderWidth: 1,
    borderColor: '#F3F4F6'
  },
  searchInput: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.8),
    color: '#1F2937',
    marginLeft: responsiveWidth(2)
  },
  predictionsList: {
    backgroundColor: '#FFF',
    borderRadius: 20,
    marginTop: 12,
    overflow: 'hidden',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F9FAFB',
  },
  predictionIconBox: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 92, 0, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  predictionMain: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.7),
    color: '#111827',
  },
  predictionSub: {
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.3),
    color: '#9CA3AF',
    marginTop: 2,
  },
  selectionBackBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginLeft: responsiveWidth(-2),
    
  },
});

export default ConfirmRide;
