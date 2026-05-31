import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Dimensions,
  Modal,
  Image,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import * as ExpoLocation from "expo-location";
import driverHireService from "../api/driverHireService";
import * as Haptics from "expo-haptics";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useAlert } from "../context/AlertContext";
import authService from "../api/authService";
import * as ImagePicker from "expo-image-picker";
import storage from "../utils/storage";
import { rides } from "../data/data.jsx";

const { width } = Dimensions.get("window");
import BackBtn from "../components/BackBtn";
// Lowercase DURATIONS will be replaced by dynamic state if settings load, otherwise default to these
const DEFAULT_DURATIONS = [4, 8, 12, 24];

const PAYMENT_METHODS = [
  {
    id: "Cash",
    label: "cash",
    fallbackLabel: "Cash",
    icon: "cash-outline",
    desc: "pay_with_cash",
    descFallback: "Pay after your trip",
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

const HireDriverScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const { showAlert, showToast } = useAlert();

  // Location state
  const [pickup, setPickup] = useState("");
  const [pickupData, setPickupData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(() =>
    Math.random().toString(36).substring(2, 15)
  );
  const debounceTimeout = useRef(null);

  // Booking state
  const [duration, setDuration] = useState(4);
  const [gender, setGender] = useState("Male");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [driverRate, setDriverRate] = useState(0); // Fetch dynamically
  const [reason, setReason] = useState("");
  const [settings, setSettings] = useState(null);
  const [fareAdjustment, setFareAdjustment] = useState(0); // in PKR
  const [selectedVehicle, setSelectedVehicle] = useState("Car");
  const [allowedVehicles, setAllowedVehicles] = useState([]);
  const [durations, setDurations] = useState(DEFAULT_DURATIONS); // dynamic durations

  // Verification state
  const [customerStatus, setCustomerStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [vModalVisible, setVModalVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
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

  // Pre-fill verification form from storage
  useEffect(() => {
    (async () => {
      let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status === "granted") {
        setGeoLoading(true);
        const loc = await ExpoLocation.getCurrentPositionAsync({});
        await handleGeocode(loc.coords);
      }
      // Pre-fill name/gender
      const name = await storage.getItem("customerName");
      const savedGender = await storage.getItem("customerGender");
      if (name || savedGender) {
        setVForm((prev) => ({
          ...prev,
          firstName: name ? name.split(" ")[0] : prev.firstName,
          lastName:
            name && name.split(" ").length > 1
              ? name.split(" ").slice(1).join(" ")
              : prev.lastName,
          gender:
            savedGender === "female"
              ? "Female"
              : savedGender === "male"
              ? "Male"
              : prev.gender,
        }));
      }
    })();
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await driverHireService.getSettings();
      if (response.succeeded) {
        setSettings(response.data);
        setDriverRate(response.data.baseRatePerHour);
        const vehicles = response.data.allowedVehicleTypes
          .split(",")
          .map((v) => v.trim());
        setAllowedVehicles(vehicles);
        if (vehicles.length > 0 && !vehicles.includes(selectedVehicle)) {
          setSelectedVehicle(vehicles[0]);
        }

        const durList = response.data.allowedDurations
          .split(",")
          .map((d) => parseInt(d.trim()))
          .filter((d) => !isNaN(d));
        if (durList.length > 0) {
          setDurations(durList);
          if (!durList.includes(duration)) setDuration(durList[0]);
        }
      }
    } catch (error) {
      console.warn("Error fetching Hire settings:", error);
    }
  };

  const handleGeocode = async (coords) => {
    try {
      const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${coords.latitude},${coords.longitude}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "OK") {
        const result = json.results[0];
        setPickup(result.formatted_address);
        setPickupData({
          address: result.formatted_address,
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
      }
    } catch (e) {
      console.warn(e);
    } finally {
      setGeoLoading(false);
    }
  };

  const handlePickupChange = (text) => {
    setPickup(text);
    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => fetchPredictions(text), 500);
  };

  const fetchPredictions = async (input) => {
    if (!input.trim()) {
      setPredictions([]);
      return;
    }
    setSearchLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${GOOGLE_MAPS_API_KEY}&sessiontoken=${sessionToken}&components=country:pk`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "OK") setPredictions(json.predictions);
    } finally {
      setSearchLoading(false);
    }
  };

  const selectPrediction = async (item) => {
    setPredictions([]);
    setSearchLoading(true);
    try {
      const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${item.place_id}&key=${GOOGLE_MAPS_API_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.status === "OK") {
        const { location } = json.result.geometry;
        setPickup(json.result.formatted_address);
        setPickupData({
          address: json.result.formatted_address,
          latitude: location.lat,
          longitude: location.lng,
        });
        setSessionToken(Math.random().toString(36).substring(2, 15));
      }
    } finally {
      setSearchLoading(false);
    }
  };

  // --- Gender / Verification Logic (mirrors ConfirmRideScreen) ---
  const checkStatusAndSetGender = async (selectedGender) => {
    if (selectedGender !== "Female") {
      setGender(selectedGender);
      return;
    }
    try {
      setStatusLoading(true);
      const userId = await storage.getItem("userId");
      const response = await authService.getUserProfile(userId);
      if (response.succeeded) {
        const status = response.data.customerProfile?.customerStatus;
        setCustomerStatus(status);
        if (status === 2 || status === "Approved") {
          setGender("Female");
        } else if (status === 1 || status === "Pending") {
          showAlert({
            title: t("pending_verification_title"),
            message: t("pending_verification_msg"),
            type: "info",
          });
        } else {
          showAlert({
            title: t("verification_required_title"),
            message: t("verification_required_msg"),
            type: "info",
            okText: t("continue_btn"),
            cancelText: t("cancel_btn"),
            onOk: () => setVModalVisible(true),
            onCancel: () => {},
            icon: (
              <Ionicons
                name="shield-checkmark-outline"
                size={60}
                color={COLORS.primary}
              />
            ),
          });
        }
      }
    } catch (error) {
      showAlert({
        title: t("error"),
        message: error.message || t("something_went_wrong"),
        type: "error",
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
      setVForm((prev) => ({ ...prev, [field]: result.assets[0].uri }));
    }
  };

  const handleVerifySubmit = async () => {
    if (
      !vForm.firstName ||
      !vForm.lastName ||
      !vForm.cnicNumber ||
      !vForm.address ||
      !vForm.frontImage ||
      !vForm.backImage
    ) {
      showAlert({
        title: t("error"),
        message: "Please fill all fields and provide images.",
        type: "error",
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

      const frontName = vForm.frontImage.split("/").pop();
      formData.append("CnicFrontImage", {
        uri: vForm.frontImage,
        name: frontName,
        type: "image/jpeg",
      });
      const backName = vForm.backImage.split("/").pop();
      formData.append("CnicBackImage", {
        uri: vForm.backImage,
        name: backName,
        type: "image/jpeg",
      });

      const response = await authService.submitCustomerVerification(formData);
      const isSuccess =
        response.succeeded === true ||
        response.success === true ||
        (response.message &&
          response.message.toLowerCase().includes("success"));

      if (isSuccess) {
        showToast(response.message || t("verification_success_msg"), "success");
        setVModalVisible(false);
        setCustomerStatus(1);
      } else {
        showAlert({
          title: t("error"),
          message: response.message || t("something_went_wrong"),
          type: "error",
        });
      }
    } catch (error) {
      showAlert({
        title: t("error"),
        message: error.message || t("something_went_wrong"),
        type: "error",
      });
    } finally {
      setVerifying(false);
    }
  };

  // --- Book Now ---
  const handleRequest = async () => {
    if (!pickupData) {
      showAlert({
        title: t("error"),
        message: t("please_select_pickup", "Please select a pickup location."),
        type: "error",
      });
      return;
    }

    if (
      gender === "Female" &&
      customerStatus !== 2 &&
      customerStatus !== "Approved"
    ) {
      showAlert({
        title: t("verification_required_title"),
        message: t("verification_required_msg"),
        type: "info",
      });
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setRequesting(true);

    const totalPrice = duration * driverRate;

    try {
      const payload = {
        startTime: startTime.toISOString(),
        durationHours: duration,
        pickupAddress: pickupData.address,
        pickupLat: pickupData.latitude,
        pickupLon: pickupData.longitude,
        vehicleTypePreference: selectedVehicle,
        genderPreference: gender,
        reason: reason,
        totalEstimatedFare: totalPrice + fareAdjustment,
        paymentMethod: paymentMethod,
      };

      const response = await driverHireService.requestDriver(payload);

      if (response.succeeded) {
        navigation.navigate("SearchingDirection", {
          requestId: response.requestId,
          serviceType: "Hire",
          genderPreference: gender,
          pickup: { address: pickupData.address, ...pickupData },
        });
      } else {
        const msg = response.message || "";
        showAlert({
          title: t("error"),
          message: msg.includes("Insufficient wallet balance")
            ? t(
                "insufficient_balance_msg",
                msg
              )
            : msg.includes("Female driver requests")
            ? t(
                "female_only_error",
                "Female driver requests are only available for verified female customers."
              )
            : msg || t("ride_request_failed", "Request failed. Please try again."),
          type: "error",
          icon:
            paymentMethod === "Wallet" ? (
              <Ionicons
                name="wallet-outline"
                size={60}
                color={COLORS.primary}
              />
            ) : (
              <Ionicons
                name="alert-circle-outline"
                size={60}
                color={COLORS.primary}
              />
            ),
        });
      }
    } catch (err) {
      showAlert({
        title: t("error"),
        message: err.message || t("something_went_wrong"),
        type: "error",
        icon: (
          <Ionicons
            name="alert-circle-outline"
            size={60}
            color={COLORS.primary}
          />
        ),
      });
    } finally {
      setRequesting(false);
    }
  };

  const onTimeChange = (event, selectedDate) => {
    setShowTimePicker(false);
    if (selectedDate) setStartTime(selectedDate);
  };

  const totalPrice = duration * driverRate;
  const finalTotal = totalPrice + fareAdjustment;

  // Validate adjustment when price base changes
  useEffect(() => {
    if (!settings) return;
    const maxInc = (totalPrice * settings.maxFareIncreasePercentage) / 100;
    const maxDec = (totalPrice * settings.maxFareDecreasePercentage) / 100;
    
    if (fareAdjustment > maxInc) setFareAdjustment(Math.floor(maxInc));
    else if (fareAdjustment < -maxDec) setFareAdjustment(-Math.floor(maxDec));
  }, [totalPrice, settings]);

  const activePayment =
    PAYMENT_METHODS.find((m) => m.id === paymentMethod) || PAYMENT_METHODS[0];

  const handleAdjustFare = (amount) => {
    // If settings haven't loaded yet, use some safe defaults to allow interaction
    const maxIncPerc = settings?.maxFareIncreasePercentage ?? 50;
    const maxDecPerc = settings?.maxFareDecreasePercentage ?? 20;

    const maxInc = (totalPrice * maxIncPerc) / 100;
    const maxDec = (totalPrice * maxDecPerc) / 100;

    const newAdjustment = fareAdjustment + amount;
    
    // Boundary check
    if (newAdjustment > maxInc) {
      setFareAdjustment(Math.floor(maxInc));
      showToast(t("max_increase_reached", "Maximum increase reached"), "info");
      return;
    }
    if (newAdjustment < -maxDec) {
      setFareAdjustment(-Math.floor(maxDec));
      showToast(t("max_decrease_reached", "Maximum discount reached"), "info");
      return;
    }

    setFareAdjustment(newAdjustment);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#F8F9FF", "#E9EEFF"]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={{ flex: 1 }}>
        {/* Header - Unified with Ride Module */}
        <BackBtn />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header Title Section */}
          <View style={{ paddingVertical: 10 }}>
            <Text style={styles.promoTitle}>
              {t("hire_driver_title", "Hire a Professional Driver")}
            </Text>
            <Text style={styles.promoSubtitle}>
              {t("hire_driver_desc", "Book a private driver for your own vehicle and enjoy the ride.")}
            </Text>
          </View>

          {/* Section 1: Pickup */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("pickup_location", "Pickup Location")}
            </Text>
            <View style={styles.inputWrapper}>
              <Ionicons
                name="location"
                size={20}
                color={COLORS.primary}
                style={styles.inputIcon}
              />
              <TextInput
                value={pickup}
                onChangeText={handlePickupChange}
                placeholder={t(
                  "enter_pickup",
                  "Where should the driver come?"
                )}
                style={styles.input}
                placeholderTextColor="#999"
              />
              {(geoLoading || searchLoading) && (
                <ActivityIndicator size="small" color={COLORS.primary} />
              )}
            </View>
            {predictions.length > 0 && (
              <View style={styles.dropdown}>
                {predictions.map((p) => (
                  <TouchableOpacity
                    key={p.place_id}
                    style={styles.predictionItem}
                    onPress={() => selectPrediction(p)}
                  >
                    <Ionicons
                      name="time-outline"
                      size={16}
                      color="#888"
                      style={{ marginRight: 8 }}
                    />
                    <Text numberOfLines={1} style={styles.predictionText}>
                      {p.description}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>

          {/* Section: Vehicle Type */}
          {allowedVehicles.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>
                {t("vehicle_type", "What vehicle do you have?")}
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {allowedVehicles.map((v) => {
                  const rideInfo = rides.find(
                    (r) => r.label.toLowerCase() === v.toLowerCase()
                  ) || rides.find((r) => r.id === "car");

                  return (
                    <TouchableOpacity
                      key={v}
                      style={[
                        styles.vehicleCard,
                        selectedVehicle === v && styles.activeVehicleCard,
                      ]}
                      onPress={() => setSelectedVehicle(v)}
                    >
                      <Image
                        source={rideInfo.image}
                        style={[
                          styles.vehicleImage,
                          selectedVehicle === v && { tintColor: COLORS.white },
                        ]}
                        resizeMode="contain"
                      />
                      <Text
                        style={[
                          styles.vehicleText,
                          selectedVehicle === v && { color: COLORS.white },
                        ]}
                      >
                        {v}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          )}

          {/* Section: Reason for Hire */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("reason_for_hire", "Reason for hiring a driver")}
            </Text>
            <View style={[styles.inputWrapper, { alignItems: "flex-start" }]}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={20}
                color={COLORS.primary}
                style={[styles.inputIcon, { marginTop: 4 }]}
              />
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder={t(
                  "enter_reason",
                  "e.g. Travel to another city, Party, etc."
                )}
                style={[styles.input, { height: 60, textAlignVertical: "top" }]}
                placeholderTextColor="#999"
                multiline
              />
            </View>
          </View>

          {/* Section 2: Duration */}
          <View style={styles.section}>
            <View style={styles.rowBetween}>
              <Text style={styles.sectionLabel}>
                {t("booking_duration", "Booking Duration")}
              </Text>
              <Text style={styles.durationValue}>
                {duration} {t("hours", "Hours")}
              </Text>
            </View>
            <View style={styles.durationGrid}>
              {durations.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.durationCard,
                    duration === d && styles.activeCard,
                  ]}
                  onPress={() => {
                    setDuration(d);
                    setFareAdjustment(0); // Reset adjustment when duration changes
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.durationText,
                      duration === d && styles.activeText,
                    ]}
                  >
                    {d}h
                  </Text>
                  <Text
                    style={[
                      styles.durationSubText,
                      duration === d && styles.activeSubText,
                    ]}
                    numberOfLines={1}
                  >
                    {d >= 24
                      ? `${Math.floor(d / 24)}d ${d % 24 > 0 ? (d % 24) + 'h' : ''}`
                      : `${d} ${t("hrs", "hrs")}`}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Section 3: Time */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("start_time", "When to start?")}
            </Text>
            <TouchableOpacity
              style={styles.timeCard}
              onPress={() => setShowTimePicker(true)}
            >
              <View style={styles.timeIconBox}>
                <Ionicons name="time" size={24} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.timeLabel}>
                  {t("starting_at", "Starting At")}
                </Text>
                <Text style={styles.timeValue}>
                  {startTime.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <Ionicons name="calendar-outline" size={20} color="#888" />
            </TouchableOpacity>
          </View>

          {/* Section 4: Driver Preference */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("driver_preferences", "Driver Preferences")}
            </Text>
            <View style={styles.preferenceRow}>
              {[
                { id: "Male", label: t("male", "Male"), icon: "account-tie" },
                { id: "Female", label: t("female", "Female"), icon: "account-tie-woman" },
              ].map((p) => (
                <TouchableOpacity
                  key={p.id}
                  style={[
                    styles.prefItem,
                    gender === p.id && styles.prefItemActive,
                  ]}
                  onPress={() => checkStatusAndSetGender(p.id)}
                  disabled={statusLoading && p.id === "Female"}
                >
                  <View
                    style={[
                      styles.iconCircle,
                      gender === p.id && styles.iconCircleActive,
                    ]}
                  >
                    {statusLoading && p.id === "Female" ? (
                      <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                      <MaterialCommunityIcons
                        name={p.icon}
                        size={32}
                        color={gender === p.id ? COLORS.primary : "#374151"}
                      />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.prefLabel,
                      gender === p.id && styles.prefLabelActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                  {p.id === "Female" && (
                     <View style={styles.verifiedBadgeContainer}>
                        <Ionicons
                          name="shield-checkmark"
                          size={10}
                          color={COLORS.white}
                        />
                     </View>
                  )}
                </TouchableOpacity>
              ))}
            </View>
            {gender === "Female" &&
              customerStatus !== 2 &&
              customerStatus !== "Approved" && (
                <View style={styles.verificationHint}>
                  <Ionicons
                    name="information-circle-outline"
                    size={14}
                    color="#F59E0B"
                  />
                  <Text style={styles.verificationHintText}>
                    {t(
                      "verification_required_hint",
                      "Verification required for female-to-female matching"
                    )}
                  </Text>
                </View>
              )}
          </View>

          {/* Section 5: Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("payment_method", "Payment Method")}
            </Text>
            <TouchableOpacity
              style={styles.paymentSelector}
              onPress={() => setPaymentModalVisible(true)}
            >
              <View style={styles.paymentLeft}>
                <View style={styles.paymentIconBox}>
                  <Ionicons
                    name={activePayment.icon}
                    size={22}
                    color={COLORS.primary}
                  />
                </View>
                <View style={{ marginLeft: 12 }}>
                  <Text style={styles.paymentTitle}>
                    {t(activePayment.label, activePayment.fallbackLabel)}
                  </Text>
                  <Text style={styles.paymentDesc}>
                    {t(activePayment.desc, activePayment.descFallback)}
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#999" />
            </TouchableOpacity>
          </View>

          {/* Pricing Summary */}
          <View style={styles.summaryCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.summaryLabel}>
                {t("base_rate", "Base Rate")}
              </Text>
              <Text style={styles.summaryValue}>{driverRate} PKR / hr</Text>
            </View>
            <View style={styles.rowBetween}>
              <Text style={styles.summaryLabel}>
                {t("duration_total", "Duration")}
              </Text>
              <Text style={styles.summaryValue}>{duration} hrs</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: COLORS.black, fontFamily: FONTS.bold },
                ]}
              >
                {t("base_total", "Base Total")}
              </Text>
              <Text style={styles.summaryValue}>{totalPrice} PKR</Text>
            </View>

            {/* Fare Adjustment Section */}
            <View style={styles.adjustmentSection}>
              <View style={styles.rowBetween}>
                <View>
                  <Text style={[styles.summaryLabel, { color: COLORS.primary, fontFamily: FONTS.semiBold }]}>
                    {t("adjust_fare", "Adjust Fare")}
                  </Text>
                  <Text style={[styles.summaryLabel, { fontSize: 11, marginTop: 2 }]}>
                    {fareAdjustment > 0 
                      ? t("adding_tip", "Adding extra") 
                      : fareAdjustment < 0 
                        ? t("requesting_discount", "Requesting discount")
                        : t("base_price", "Same as base price")}
                  </Text>
                </View>
                <View style={styles.adjustmentControls}>
                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() => handleAdjustFare(-10)}
                  >
                    <Ionicons name="remove" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <Text style={styles.adjustmentValue}>{fareAdjustment}</Text>
                  <TouchableOpacity
                    style={styles.adjustBtn}
                    onPress={() => handleAdjustFare(10)}
                  >
                    <Ionicons name="add" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.divider} />
            <View style={styles.rowBetween}>
              <View>
                <Text
                  style={[
                    styles.summaryLabel,
                    { color: COLORS.black, fontFamily: FONTS.bold },
                  ]}
                >
                  {t("estimated_total", "Estimated Total")}
                </Text>
                <Text style={{ fontSize: 10, color: "#888" }}>
                  ({totalPrice} {fareAdjustment >= 0 ? "+" : ""} {fareAdjustment} adjustment)
                </Text>
              </View>
              <Text style={styles.totalAmount}>{finalTotal} PKR</Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>

      {/* Sticky Footer */}
      <BlurView intensity={80} style={styles.footer}>
        <View style={styles.footerPrice}>
          <Text style={styles.footerLabel}>
            {t("total_to_pay", "Total to pay")}
          </Text>
          <Text style={styles.footerAmount}>{finalTotal} PKR</Text>
        </View>
        <TouchableOpacity
          style={styles.requestBtn}
          onPress={handleRequest}
          disabled={requesting}
        >
          {requesting ? (
            <ActivityIndicator color={COLORS.white} />
          ) : (
            <>
              <Text style={styles.requestBtnText}>
                {t("book_now", "Book Now")}
              </Text>
              <Ionicons
                name="arrow-forward"
                size={20}
                color={COLORS.white}
                style={{ marginLeft: 8 }}
              />
            </>
          )}
        </TouchableOpacity>
      </BlurView>

      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={false}
          display="spinner"
          onChange={onTimeChange}
        />
      )}

      {/* Payment Method Modal */}
      <Modal
        visible={paymentModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPaymentModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          style={styles.modalOverlay}
          onPress={() => setPaymentModalVisible(false)}
        >
          <TouchableOpacity activeOpacity={1} style={styles.modalSheet}>
            <View style={styles.modalIndicator} />
            <Text style={styles.modalTitle}>
              {t("select_payment", "Select Payment Method")}
            </Text>
            {PAYMENT_METHODS.map((method) => (
              <TouchableOpacity
                key={method.id}
                style={[
                  styles.paymentMethodItem,
                  paymentMethod === method.id && styles.paymentMethodItemActive,
                ]}
                onPress={() => {
                  setPaymentMethod(method.id);
                  setPaymentModalVisible(false);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }}
              >
                <View style={styles.methodIconBox}>
                  <Ionicons
                    name={method.icon}
                    size={24}
                    color={
                      paymentMethod === method.id ? COLORS.white : COLORS.primary
                    }
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 14 }}>
                  <Text
                    style={[
                      styles.methodLabel,
                      paymentMethod === method.id && { color: COLORS.white },
                    ]}
                  >
                    {t(method.label, method.fallbackLabel)}
                  </Text>
                  <Text
                    style={[
                      styles.methodDesc,
                      paymentMethod === method.id && {
                        color: "rgba(255,255,255,0.75)",
                      },
                    ]}
                  >
                    {t(method.desc, method.descFallback)}
                  </Text>
                </View>
                {paymentMethod === method.id && (
                  <Ionicons name="checkmark-circle" size={22} color={COLORS.white} />
                )}
              </TouchableOpacity>
            ))}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {/* Verification Modal */}
      <Modal visible={vModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { height: responsiveHeight(85) }]}>
            <View style={styles.modalIndicator} />
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setVModalVisible(false)}>
                <Ionicons name="close" size={26} color={COLORS.black} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                {t("verification_title", "Verify Your Account")}
              </Text>
              <View style={{ width: 26 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {[
                { field: "firstName", label: t("first_name", "First Name") },
                { field: "lastName", label: t("last_name", "Last Name") },
                { field: "cnicNumber", label: t("cnic_number", "CNIC Number") },
                { field: "address", label: t("address", "Address") },
              ].map(({ field, label }) => (
                <View key={field} style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>{label}</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder={label}
                    value={vForm[field]}
                    onChangeText={(text) =>
                      setVForm((prev) => ({ ...prev, [field]: text }))
                    }
                    keyboardType={field === "cnicNumber" ? "numeric" : "default"}
                  />
                </View>
              ))}

              <Text style={styles.inputLabel}>
                {t("cnic_front", "CNIC Front")}
              </Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => pickImage("frontImage")}
              >
                {vForm.frontImage ? (
                  <Image
                    source={{ uri: vForm.frontImage }}
                    style={styles.pickedImage}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="camera-outline"
                      size={28}
                      color={COLORS.primary}
                    />
                    <Text style={styles.imagePickerText}>
                      {t("upload_image", "Upload Image")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <Text style={[styles.inputLabel, { marginTop: 12 }]}>
                {t("cnic_back", "CNIC Back")}
              </Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={() => pickImage("backImage")}
              >
                {vForm.backImage ? (
                  <Image
                    source={{ uri: vForm.backImage }}
                    style={styles.pickedImage}
                  />
                ) : (
                  <>
                    <Ionicons
                      name="camera-outline"
                      size={28}
                      color={COLORS.primary}
                    />
                    <Text style={styles.imagePickerText}>
                      {t("upload_image", "Upload Image")}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.verifyBtn}
                onPress={handleVerifySubmit}
                disabled={verifying}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary || COLORS.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.verifyBtnGradient}
                >
                  {verifying ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={styles.verifyBtnText}>
                      {t("submit_verification", "Submit for Verification")}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

  const styles = StyleSheet.create({
  container: { flex: 1 },
  promoTitle: {
    fontSize: responsiveFontSize(2.6),
    fontFamily: FONTS.extraBold,
    color: COLORS.black,
    marginTop: responsiveHeight(1),
  },
  promoSubtitle: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.regular,
    color: "#666",
    marginTop: 4,
    marginBottom: responsiveHeight(1),
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(4),
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(16),
  },
  section: { marginBottom: responsiveHeight(2.5) },
  sectionLabel: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.semiBold,
    color: "#333",
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E5F2",
    elevation: 1,
  },
  inputIcon: { marginRight: 10 },
  input: {
    flex: 1,
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.regular,
    color: COLORS.black,
    paddingVertical: 0,
  },
  dropdown: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    marginTop: 5,
    borderWidth: 1,
    borderColor: "#E0E5F2",
    maxHeight: 200,
    overflow: "hidden",
    elevation: 3,
  },
  predictionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "#eee",
  },
  predictionText: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.regular,
    color: "#555",
    flex: 1,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  durationValue: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 10,
    justifyContent: "flex-start",
  },
  durationCard: {
    width: (width - 60) / 4,
    minWidth: 70,
    height: 75,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  activeCard: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  durationText: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  durationSubText: {
    fontSize: responsiveFontSize(1.2),
    fontFamily: FONTS.regular,
    color: "#888",
    marginTop: 3,
  },
  activeText: { color: COLORS.white },
  activeSubText: { color: "rgba(255,255,255,0.7)" },
  timeCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E0E5F2",
  },
  timeIconBox: {
    width: 46,
    height: 46,
    borderRadius: 13,
    backgroundColor: "rgba(25, 118, 210, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  timeLabel: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "#888",
  },
  timeValue: {
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginTop: 2,
  },
  preferenceRow: {
    flexDirection: "row",
    marginTop: 12,
  },
  prefItem: {
    flex: 1,
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 20,
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    marginHorizontal: 6,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  prefItemActive: {
    borderColor: COLORS.primary,
    backgroundColor: "rgba(25, 118, 210, 0.03)",
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircleActive: {
    backgroundColor: "rgba(25, 118, 210, 0.1)",
  },
  prefLabel: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: FONTS.semiBold,
    color: "#666",
    marginLeft: 0,
  },
  prefLabelActive: {
    color: COLORS.primary,
  },
  verifiedBadgeContainer: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  activePref: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  verificationHint: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    paddingHorizontal: 4,
  },
  verificationHintText: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "#F59E0B",
    marginLeft: 5,
  },
  paymentSelector: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E5F2",
    padding: 14,
  },
  paymentLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  paymentIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(25, 118, 210, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  paymentTitle: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  paymentDesc: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "#888",
    marginTop: 2,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    padding: 18,
    borderRadius: 20,
    marginTop: 8,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  adjustmentSection: {
    marginTop: 15,
    backgroundColor: "rgba(25, 118, 210, 0.05)",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: COLORS.primary,
  },
  summaryLabel: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.regular,
    color: "#666",
  },
  summaryValue: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  divider: { height: 1, backgroundColor: "#E0E5F2", marginVertical: 12 },
  totalAmount: {
    fontSize: responsiveFontSize(2.4),
    fontFamily: FONTS.extraBold,
    color: COLORS.primary,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(6),
    paddingBottom: responsiveHeight(4),
    paddingTop: 18,
    backgroundColor: "rgba(255,255,255,0.85)",
  },
  footerPrice: { flex: 1 },
  footerLabel: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "#666",
  },
  footerAmount: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  requestBtn: {
    backgroundColor: COLORS.primary,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 16,
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
  },
  requestBtnText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalIndicator: {
    width: 40,
    height: 4,
    backgroundColor: "#ddd",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.1),
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 16,
    textAlign: "center",
  },
  paymentMethodItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#E0E5F2",
    marginBottom: 12,
    backgroundColor: COLORS.white,
  },
  paymentMethodItemActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  methodIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.05)",
    justifyContent: "center",
    alignItems: "center",
  },
  methodLabel: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  methodDesc: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "#888",
    marginTop: 2,
  },
  inputGroup: { marginBottom: 14 },
  inputLabel: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.semiBold,
    color: "#444",
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#E0E5F2",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.regular,
    color: COLORS.black,
    backgroundColor: "#FAFAFA",
  },
  imagePicker: {
    height: 110,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: "#E0E5F2",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFAFA",
    marginBottom: 8,
  },
  pickedImage: { width: "100%", height: "100%", borderRadius: 14 },
  imagePickerText: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: FONTS.regular,
    color: COLORS.primary,
    marginTop: 6,
  },
  verifyBtn: { marginTop: 20, borderRadius: 16, overflow: "hidden" },
  verifyBtnGradient: { paddingVertical: 15, alignItems: "center" },
  verifyBtnText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(1.9),
    fontFamily: FONTS.bold,
  },
  adjustmentControls: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E5F2",
    padding: 4,
  },
  adjustBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "rgba(25, 118, 210, 0.08)",
    justifyContent: "center",
    alignItems: "center",
  },
  adjustmentValue: {
    width: 50,
    textAlign: "center",
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.6),
    color: COLORS.primary,
  },
  vehicleCard: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E5F2",
    marginRight: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  activeVehicleCard: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  vehicleText: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.semiBold,
    color: "#444",
    marginLeft: 8,
  },
  vehicleImage: {
    width: 32,
    height: 32,
  },
});

export default HireDriverScreen;
