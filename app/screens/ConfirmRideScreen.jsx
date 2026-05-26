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
    setActiveRide,
  } = useRide();

  const pickup = route.params?.pickup || ctxPickup;
  const destination = route.params?.destination || ctxDestination;

  // Sync route params to context on mount
  useEffect(() => {
    if (
      route.params?.pickup &&
      JSON.stringify(route.params.pickup) !== JSON.stringify(ctxPickup)
    ) {
      setPickup(route.params.pickup);
    }
    if (
      route.params?.destination &&
      JSON.stringify(route.params.destination) !==
        JSON.stringify(ctxDestination)
    ) {
      setDestination(route.params.destination);
    }
  }, [
    route.params?.pickup,
    route.params?.destination,
    setPickup,
    setDestination,
    ctxPickup,
    ctxDestination,
  ]);

  const { t } = useTranslation();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["55%", "56%"], []);
  const [selectedService, setSelectedService] = useState("bike");
  const [loading, setLoading] = useState(false);
  const [genderPreference, setGenderPreference] = useState("any"); // 'any', 'male', 'female'
  const [prefModalVisible, setPrefModalVisible] = useState(false);

  // ── Live pricing state ────────────────────────────────────────────────────
  // Map of vehicleTypeSlug → EstimateDto
  // e.g. { bike: { estimatedFare: 192, currency: 'PKR', surgeFactor: 1.0, ... } }
  const [priceMap, setPriceMap] = useState({});
  const [priceLoading, setPriceLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [customerStatus, setCustomerStatus] = useState(null); // 0: NotSubmitted, 1: Pending, 2: Approved
  const [vModalVisible, setVModalVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [tempPref, setTempPref] = useState("any");
  const [gModalVisible, setGModalVisible] = useState(false);
  const [waveDrivers, setWaveDrivers] = useState([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectionType, setSelectionType] = useState("pickup");

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
      await customerHub.start();

      // Poll every 5 seconds for nearby drivers
      intervalId = setInterval(async () => {
        if (isActive && pickup?.latitude && pickup?.longitude) {
          const drivers = await customerHub.getNearbyDrivers(selectedService, pickup.latitude, pickup.longitude);
          if (drivers && drivers.length >= 0) {
            setWaveDrivers(drivers);
          }
        }
      }, 5000);
      
      // Do an immediate fetch as well
      if (isActive && pickup?.latitude && pickup?.longitude) {
        const drivers = await customerHub.getNearbyDrivers(selectedService, pickup.latitude, pickup.longitude);
        if (drivers && drivers.length >= 0) {
          setWaveDrivers(drivers);
        }
      }
    };

    setupHubAndPoll();

    const onWaveDrivers = (payload) => {
      if (payload && payload.drivers) {
        setWaveDrivers(payload.drivers);
      }
    };

    customerHub.on("wave_drivers", onWaveDrivers);
    
    return () => {
      isActive = false;
      if (intervalId) clearInterval(intervalId);
      customerHub.off("wave_drivers", onWaveDrivers);
    };
  }, [pickup, selectedService]);

  // ── Called by MapViewDirections when route is computed ────────────────────
  const handleRouteReady = useCallback(
    async (result) => {
      // result.distance = km, result.duration = minutes
      setRouteDetails(result);

      if (!pickup || !destination) return;

      setPriceLoading(true);
      try {
        const response = await pricingService.getEstimates({
          pickupLat: pickup.latitude,
          pickupLon: pickup.longitude,
          dropoffLat: destination.latitude,
          dropoffLon: destination.longitude,
          // Pass Google-derived hints for better accuracy
          estimatedDistanceKm: result.distance,
          estimatedDurationMinutes: result.duration,
        });

        if (response.succeeded && Array.isArray(response.data)) {
          // Build a slug → estimate map for O(1) lookups in RidesSlider
          const map = {};
          response.data.forEach((item) => {
            map[item.vehicleTypeSlug] = item;
          });
          setPriceMap(map);
        }
      } catch (err) {
        // Fail silently — cards will still show static fallback prices
        console.warn("[ConfirmRide] Pricing fetch failed:", err?.message);
      } finally {
        setPriceLoading(false);
      }
    },
    [pickup, destination, setRouteDetails],
  );

  // ── Confirm ride ──────────────────────────────────────────────────────────
  const handleConfirmRide = async () => {
    if (!pickup || !destination || loading) return;

    // Final guard for women preference
    if (genderPreference === "female" && (customerStatus !== 2 && customerStatus !== "Approved")) {
      Alert.alert(t("verification_required_title"), t("verification_required_msg"));
      return;
    }

    setLoading(true);
    try {
      // Connect the SignalR hub on-demand (no-op if already connected)
      // Must happen BEFORE requestRide so the server can push events immediately
      await customerHub.start();

      const liveEstimate = priceMap[selectedService];
      const requestData = {
        pickup: { lat: pickup.latitude, lon: pickup.longitude },
        dropoff: { lat: destination.latitude, lon: destination.longitude },
        vehicleType: selectedService,
        genderPreference: genderPreference,
        minRating: 0,
        estimatedFare: liveEstimate?.estimatedFare || 0,
        estimatedDistance: liveEstimate?.distance || 0,
        estimatedDuration: liveEstimate?.estimatedDuration || 0,
      };

      const response = await rideService.requestRide(requestData);

      if (response.succeeded) {
        const rideId = response.data.rideId;
        const status = response.data.status;

        if (!rideId || rideId === "00000000-0000-0000-0000-000000000000") {
          Alert.alert(t("error"), t("could_not_create_ride") || "Could not create ride. Please try again.");
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
        Alert.alert(t("error"), response.message || t("ride_request_failed"));
      }
    } catch (error) {
      Alert.alert(t("error"), error.message || t("something_went_wrong"));
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
    const data = await reverseGeocode(coords);
    if (data) {
      setPickup(data);
    }
  };

  const handleDestinationDragEnd = async (coords) => {
    const data = await reverseGeocode(coords);
    if (data) {
      setDestination(data);
    }
  };

  const handleLocationConfirm = () => {
    setIsSelectionMode(false);
    bottomSheetRef.current?.snapToIndex(0);
  };

  const startSelection = (type) => {
    setSelectionType(type);
    setIsSelectionMode(true);
    bottomSheetRef.current?.close();
  };

  const checkStatusAndSetPref = async (newPref) => {
    if (newPref !== "female") {
      setGenderPreference(newPref);
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
          Alert.alert(t("pending_verification_title"), t("pending_verification_msg"));
        } else {
          // status 0 or NotSubmitted
          Alert.alert(
            t("verification_required_title"),
            t("verification_required_msg"),
            [
              { text: t("cancel_btn"), style: "cancel" },
              { text: t("continue_btn"), onPress: () => setVModalVisible(true) },
            ]
          );
        }
      }
    } catch (error) {
      Alert.alert(t("error"), error.message || t("something_went_wrong"));
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
      Alert.alert(t("error"), "Please fill all fields and provide images.");
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
        Alert.alert(t("success", "Success"), response.message || t("verification_success_msg"));
        setVModalVisible(false);
        setCustomerStatus(1); // Set to pending locally
      } else {
        Alert.alert(t("error"), response.message || t("something_went_wrong"));
      }
    } catch (error) {
      Alert.alert(t("error"), error.message || t("something_went_wrong"));
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

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* MAIN CONTENT */}
      <View style={{ flex: 1 }}>
        <View style={{ left: responsiveWidth(1.5) }}>
          <BackBtn />
        </View>

        <View
          style={{
            height: responsiveHeight(60),
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
            onEditPickup={handleEditPickup}
            onEditDestination={handleEditDestination}
            waveDrivers={waveDrivers}
            selectedCategory={selectedService}
            isSelectionMode={isSelectionMode}
            selectionType={selectionType}
            onLocationSelected={async (region) => {
              const data = await reverseGeocode(region);
              if (data) {
                if (selectionType === "pickup") setPickup(data);
                else setDestination(data);
              }
            }}
          />
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
          disabled={loading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.mainConfirmBtn}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
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
                { id: "any", label: "no_preference", icon: "account" },
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
                        { flex: 1, justifyContent: "center", paddingVertical: 10 },
                        vForm.gender === g && styles.prefItemActive,
                      ]}
                      onPress={() => setVForm((prev) => ({ ...prev, gender: g }))}
                    >
                      <Text style={[styles.prefLabel, vForm.gender === g && styles.prefLabelActive]}>
                        {g}
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

      {/* VERIFICATION GUIDE MODAL */}
      <Modal visible={gModalVisible} transparent animationType="fade">
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setGModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={[styles.modalContent, { paddingBottom: 30 }]}>
            <View style={styles.modalIndicator} />
            <Ionicons name="shield-checkmark" size={60} color={COLORS.primary} style={{ alignSelf: "center", marginBottom: 15 }} />
            <Text style={styles.modalTitle}>{t("verification_guide_title")}</Text>
            <Text style={{
              textAlign: "center",
              fontSize: responsiveFontSize(1.8),
              color: "#4B5563",
              lineHeight: 24,
              fontFamily: FONTS.regular,
              marginBottom: 30,
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
                <Text style={styles.confirmBtnText}>{t("ok_btn", "Got it!")}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </TouchableOpacity>
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
          onEditPickup={handleEditPickup}
          onEditDestination={handleEditDestination}
          waveDrivers={waveDrivers}
          onPickupPress={() => startSelection("pickup")}
          onDestinationPress={() => startSelection("destination")}
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
    paddingBottom: responsiveHeight(2),
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
});

export default ConfirmRide;
