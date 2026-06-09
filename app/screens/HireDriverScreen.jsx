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
import CurrentLocation from "../components/CurrentLocation";
import MapLocationPickerModal from "../components/MapLocationPickerModal";
// Lowercase DURATIONS will be replaced by dynamic state if settings load, otherwise default to these
const DEFAULT_DURATIONS = [2, 4, 6];

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
  const { t, i18n } = useTranslation();
  const { showAlert, showToast } = useAlert();

  // Location state
  const [pickup, setPickup] = useState("");
  const [pickupData, setPickupData] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [geoLoading, setGeoLoading] = useState(false);
  const [sessionToken, setSessionToken] = useState(() =>
    Math.random().toString(36).substring(2, 15),
  );
  const debounceTimeout = useRef(null);

  // Booking state
  const [duration, setDuration] = useState(2);
  const [gender, setGender] = useState("Male");
  const [paymentMethod, setPaymentMethod] = useState("Cash");
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [startTime, setStartTime] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const [driverRate, setDriverRate] = useState(450); // Default base rate as requested
  const [reason, setReason] = useState("");
  const [settings, setSettings] = useState(null);
  const [fareAdjustment, setFareAdjustment] = useState(0); // in PKR
  const [selectedVehicle, setSelectedVehicle] = useState("Car");
  const [allowedVehicles, setAllowedVehicles] = useState([]);
  const [durations, setDurations] = useState(DEFAULT_DURATIONS); // dynamic durations
  const [vehicleModel, setVehicleModel] = useState("Sedan Car (Toyota Corolla)");
  const [vehiclePlate, setVehiclePlate] = useState("BR5-23930");

  // Verification state
  const [customerStatus, setCustomerStatus] = useState(null);
  const [statusLoading, setStatusLoading] = useState(false);
  const [vModalVisible, setVModalVisible] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
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
  const [customDurationModalVisible, setCustomDurationModalVisible] = useState(false);
  const [customDurationInput, setCustomDurationInput] = useState("");

  // Pre-fill verification form  storage
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

        // We keep durations restricted to 2h, 4h, 6h for clean UI as per request
        setDurations([2, 4, 6]);
        if (![2, 4, 6].includes(duration)) setDuration(2);
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

  const handleUseCurrentLocation = async () => {
    setSearchLoading(true);
    try {
      let { status } = await ExpoLocation.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setSearchLoading(false);
        return;
      }
      let location = await ExpoLocation.getCurrentPositionAsync({
        accuracy: ExpoLocation.Accuracy.BestForNavigation,
      });
      handleGeocode(location.coords);
    } catch (error) {
      console.error("Geocoding Error:", error);
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
        okText: t("ok_btn", "OK"),
        cancelText: t("cancel_btn", "Cancel"),
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
            ? t("insufficient_balance_msg")
            : msg.includes("Female driver requests")
              ? t(
                  "female_only_error",
                  "Female driver requests are only available for verified female customers.",
                )
              : msg ||
                t("ride_request_failed", "Request failed. Please try again."),
          type: "error",
          okText: t("ok_btn", "OK"),
          cancelText: t("cancel_btn", "Cancel"),
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
      <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background, paddingHorizontal: responsiveWidth(4) }}>
        {/* Header - Unified with Ride Module */}
        <BackBtn />

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.bannerContainer}>
            <Image
            source={
              i18n.language === 'ur'
                ? require("../../assets/hiredriverUr.png")
                : require("../../assets/hiredriver.png")
            }
            style={styles.bannerImage}
            resizeMode="cover"
          />
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
                placeholder={t("enter_pickup", "Where should the driver come?")}
                style={styles.input}
                placeholderTextColor="#999"
              />
              {/* Clear button — visible when there is text */}
              {pickup.length > 0 && !geoLoading && !searchLoading && (
                <TouchableOpacity
                  onPress={() => {
                    setPickup("");
                    setPickupData(null);
                    setPredictions([]);
                    if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
                  }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={20} color="#9CA3AF" />
                </TouchableOpacity>
              )}
              {(geoLoading || searchLoading) && (
                <ActivityIndicator size="small" color={COLORS.primary} />
              )}
            </View>

            <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginTop: 5 }}>
              <CurrentLocation onPress={handleUseCurrentLocation} />
              <TouchableOpacity
                onPress={() => setShowMapPicker(true)}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#F3F4F6",
                  paddingHorizontal: 12,
                  paddingVertical: 8,
                  borderRadius: 20,
                }}
              >
                <Ionicons name="map-outline" size={18} color={COLORS.primary} style={{ marginRight: 4 }} />
                <Text style={{ fontFamily: FONTS.medium, fontSize: responsiveFontSize(1.4), color: COLORS.primary }}>
                  {t("select_on_map")}
                </Text>
              </TouchableOpacity>
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

          {/* Section: Vehicle Info Card */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>
              {t("vehicle_you_have_label", "Vehicle You Have")}
            </Text>
            <View style={styles.vehicleInputCard}>
              <View style={styles.vehicleIconCircle}>
                <Image
                  source={require("../../assets/car.png")}
                  style={styles.vehicleIconSmall}
                  resizeMode="contain"
                />
              </View>
              <View style={styles.vehicleInfoBox}>
                {/* Editable model row */}
                <View style={styles.vehicleEditRow}>
                  <TextInput
                    style={styles.vehicleCardInput}
                    value={vehicleModel}
                    onChangeText={setVehicleModel}
                    placeholder={t("car_model_placeholder", "e.g. Sedan Car (Toyota Corolla)")}
                    placeholderTextColor="#bbb"
                    textAlign="left"
                  />
                  <Ionicons name="pencil" size={14} color={COLORS.primary} style={{ marginLeft: 4 }} />
                </View>
                {/* Editable plate row */}
                <View style={[styles.vehicleEditRow, { marginTop: 6 }]}>
                  <TextInput
                    style={styles.vehicleCardPlate}
                    value={vehiclePlate}
                    onChangeText={setVehiclePlate}
                    placeholder={t("lic_placeholder", "Lic: BR5-23930")}
                    placeholderTextColor="#bbb"
                    textAlign="left"
                  />
                  <Ionicons name="pencil" size={12} color="#aaa" style={{ marginLeft: 4 }} />
                </View>
              </View>
            </View>
          </View>

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
                  "e.g. Travel to another city, Party, etc.",
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
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.durationRow}>
              {durations.map((d) => (
                <TouchableOpacity
                  key={d}
                  style={[
                    styles.durationCard,
                    duration === d && styles.activeCard,
                  ]}
                  onPress={() => {
                    setDuration(d);
                    setFareAdjustment(0);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                >
                  <Text
                    style={[
                      styles.durationText,
                      duration === d && styles.activeText,
                    ]}
                  >
                    {i18n.language === 'ur'
                      ? `${d === 2 ? '۲' : d === 4 ? '۴' : d === 6 ? '۶' : d} ${t('hours', 'گھنٹے')}`
                      : `${d} ${t('hours', 'Hours')}`}
                  </Text>
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                style={[
                  styles.durationCard,
                  !durations.includes(duration) && styles.activeCard,
                ]}
                onPress={() => {
                  setCustomDurationModalVisible(true);
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                }}
              >
                <Ionicons 
                  name="add-circle-outline" 
                  size={24} 
                  color={!durations.includes(duration) ? COLORS.white : COLORS.primary} 
                />
                <Text
                  style={[
                    styles.durationSubText,
                    !durations.includes(duration) && styles.activeSubText,
                    { marginTop: 2 }
                  ]}
                >
                  {t('custom', i18n.language === 'ur' ? 'اپنی مرضی' : 'Custom')}
                </Text>
              </TouchableOpacity>
            </ScrollView>
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
                {
                  id: "Female",
                  label: t("female", "Female"),
                  icon: "account-tie-woman",
                },
              ].map((p) => (
                <TouchableOpacity
                  key={p.id}
                  activeOpacity={0.8}
                  style={[
                    styles.prefItem,
                    gender === p.id && styles.prefItemActive,
                  ]}
                  onPress={() => checkStatusAndSetGender(p.id)}
                  disabled={statusLoading && p.id === "Female"}
                >
                  <LinearGradient
                    colors={gender === p.id ? [COLORS.primary, COLORS.secondary] : [COLORS.white, COLORS.white]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.prefGradient}
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
                          size={36}
                          color={gender === p.id ? COLORS.white : "#374151"}
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
                    
                    {gender === p.id && (
                      <View style={styles.checkBadge}>
                        <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                      </View>
                    )}

                    {p.id === "Female" && gender !== "Female" && (
                      <View style={styles.verifiedBadgeContainer}>
                        <Ionicons
                          name="shield-checkmark"
                          size={10}
                          color={COLORS.white}
                        />
                      </View>
                    )}
                  </LinearGradient>
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
                      "Verification required for female-to-female matching",
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
              <Text style={styles.summaryValue}>{driverRate} {t("currency")} {t("per_hour")}</Text>
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
              <Text style={styles.summaryValue}>{totalPrice} {t("currency")}</Text>
            </View>

            {/* Fare Adjustment Section */}
            <View style={styles.adjustmentSection}>
              <View style={styles.rowBetween}>
                <View>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { color: COLORS.primary, fontFamily: FONTS.semiBold },
                    ]}
                  >
                    {t("adjust_fare", "Adjust Fare")}
                  </Text>
                  <Text
                    style={[
                      styles.summaryLabel,
                      { fontSize: 11, marginTop: 2 },
                    ]}
                  >
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
                  ({totalPrice} {fareAdjustment >= 0 ? "+" : ""}{" "}
                  {fareAdjustment} adjustment)
                </Text>
              </View>
              <Text style={styles.totalAmount}>{finalTotal} {t("currency")}</Text>
            </View>

            <TouchableOpacity
              style={[styles.requestBtn, { marginTop: 24, overflow: "hidden" }]}
              onPress={handleRequest}
              disabled={requesting}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary || COLORS.primary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.requestBtnGradient}
              >
                {requesting ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <>
                    <Text style={styles.requestBtnText}>
                      {t("hire_driver", "Hire Driver")}
                    </Text>
                  
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>

      <MapLocationPickerModal
        visible={showMapPicker}
        isPickupOnly={true}
        onClose={() => setShowMapPicker(false)}
        onSelect={({ pickup: pickedPickup }) => {
          setShowMapPicker(false);
          setPickup(pickedPickup.name || pickedPickup.address);
          setPickupData(pickedPickup);
        }}
      />

      {/* Custom Duration Modal */}
      <Modal
        visible={customDurationModalVisible}
        transparent
        animationType="fade"
      >
        <View style={styles.modalOverlayCenter}>
          <View style={styles.modalSheetSmall}>
            <Text style={styles.modalTitle}>{t("custom_duration", "Enter Hours")}</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              placeholder={t("hours_placeholder", "e.g. 5")}
              value={customDurationInput}
              onChangeText={setCustomDurationInput}
              autoFocus
            />
            <View style={[styles.modalActions, { marginTop: 20 }]}>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: "#F3F4F6" }]} 
                onPress={() => setCustomDurationModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: "#333" }]}>{t("cancel", "Cancel")}</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalBtn, { backgroundColor: COLORS.primary }]} 
                onPress={() => {
                  const hrs = parseInt(customDurationInput);
                  if (hrs > 0) {
                    setDuration(hrs);
                    setFareAdjustment(0);
                    setCustomDurationModalVisible(false);
                    setCustomDurationInput("");
                  }
                }}
              >
                <Text style={styles.modalBtnText}>{t("confirm", "Confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Time Picker */}
      {showTimePicker && (
        <DateTimePicker
          value={startTime}
          mode="time"
          is24Hour={false}
          display="default"
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
            <ScrollView showsVerticalScrollIndicator={false}>
              {PAYMENT_METHODS.map((method) => {
                const isActive = paymentMethod === method.id;
                return (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethodItem,
                      isActive && styles.paymentMethodItemActive,
                    ]}
                    onPress={() => {
                      setPaymentMethod(method.id);
                      setPaymentModalVisible(false);
                      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    }}
                  >
                    <View style={[
                      styles.methodIconBox,
                      isActive && styles.methodIconBoxActive
                    ]}>
                      <Ionicons
                        name={method.icon}
                        size={24}
                        color={isActive ? COLORS.primary : "#6B7280"}
                      />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[
                        styles.methodLabel,
                        isActive && styles.methodLabelActive
                      ]}>
                        {t(method.label) !== method.label ? t(method.label) : method.fallbackLabel}
                      </Text>
                      <Text style={styles.methodDesc}>
                        {t(method.desc) !== method.desc ? t(method.desc) : method.descFallback}
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
                    keyboardType={
                      field === "cnicNumber" ? "numeric" : "default"
                    }
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
  container: { flex: 1, backgroundColor: COLORS.background, direction: 'ltr' },
  bannerContainer: {

    height: responsiveHeight(25),
    backgroundColor: COLORS.backgroundimg,
    justifyContent: "center",
    overflow: "hidden",
    marginBottom: responsiveHeight(2),
  },
  bannerImage: {
    width: responsiveWidth(95),
    height: responsiveHeight(25),
    borderRadius: responsiveHeight(0),
    resizeMode: "contain",
    alignSelf: "center",
  borderRadius:responsiveHeight(2.5)

  },
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
    paddingTop: responsiveHeight(1),
    paddingBottom: responsiveHeight(16),
  },
  section: { marginBottom: responsiveHeight(2.5) },
  sectionLabel: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.bold,
    color: COLORS.black,
    marginBottom: 10,
    textAlign: 'left',
    writingDirection: 'ltr',
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
    textAlign: 'left',
    writingDirection: 'ltr',
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
    fontSize: responsiveFontSize(1.5),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    paddingVertical: 0,
  },
  durationGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 10,
    justifyContent: "flex-start",
  },
  durationRow: {
    marginTop: 1,
    paddingVertical: 8,
  },
  durationCard: {
    width: responsiveWidth(20),
    height: responsiveHeight(7),
    backgroundColor: COLORS.white,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#F3F4F6",
    marginRight: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  activeCard: { 
    backgroundColor: COLORS.active, 
    borderColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.25,
  },
  durationText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  durationSubText: {
    fontSize: responsiveFontSize(1.2),
    fontFamily: FONTS.regular,
    color: COLORS.icon,
    marginTop: 3,
  },
  activeText: { color: COLORS.black },
  activeSubText: {  color: COLORS.icon, },
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
    backgroundColor: COLORS.active,
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
    marginTop: 8,
  },
  prefItem: {
    flex: 1,
    height: 110,
    borderRadius: 20,
    overflow: "hidden",
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
  },
  prefGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  prefItemActive: {
    borderColor: COLORS.primary,
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F8FAFC",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  iconCircleActive: {
    backgroundColor: "rgba(255, 255, 255, 0.25)",
  },
  checkBadge: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  prefLabel: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.semiBold,
    color: "#666",
    marginLeft: 0,
  },
  prefLabelActive: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
  },
  modalSheetSmall: {
    backgroundColor: COLORS.white,
    width: "85%",
    borderRadius: 24,
    padding: 24,
    alignSelf: "center",
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  modalBtn: {
    flex: 1,
    height: 50,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  modalBtnText: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.7),
    color: COLORS.white,
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
    backgroundColor: COLORS.active,
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
    backgroundColor: COLORS.active,
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
  requestBtn: {
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    width: "100%",
  },
  requestBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    width: "100%",
  },
  requestBtnText: {
    color: COLORS.white,
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalOverlayCenter: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
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
  methodIconBox: {
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
  methodIconBoxActive: {
    backgroundColor: "#FFE4CC",
    borderColor: COLORS.primary,
  },
  methodLabel: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.9),
    color: "#111827",
  },
  methodLabelActive: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  methodDesc: {
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.4),
    color: "#6B7280",
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
    backgroundColor: COLORS.active,
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
  vehicleInputCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  vehicleIconCircle: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: COLORS.active,
    justifyContent: "center",
    alignItems: "center",
  },
  vehicleIconSmall: {
    width: 44,
    height: 44,
  },
  vehicleInfoBox: {
    flex: 1,
    marginLeft: 16,
  },
  vehicleEditRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingBottom: 2,
  },
  vehicleCardInput: {
    flex: 1,
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.medium,
    color: COLORS.black,
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
  vehicleCardPlate: {
    flex: 1,
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: '#666',
    padding: 0,
    textAlign: 'left',
    writingDirection: 'ltr',
  },
});

export default HireDriverScreen;
