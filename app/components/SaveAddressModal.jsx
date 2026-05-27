import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";
import preferenceService from "../api/preferenceService";

const CATEGORIES = [
  { id: "home", label: "Home", icon: "home" },
  { id: "work", label: "Work", icon: "briefcase" },
  { id: "shop", label: "Shop", icon: "storefront" },
  { id: "education", label: "Education", icon: "school" },
  { id: "other", label: "Other", icon: "location" },
];

const SaveAddressModal = ({ visible, onClose, address }) => {
  const { t } = useTranslation();
  const [selectedCategory, setSelectedCategory] = useState("home");
  const [houseNo, setHouseNo] = useState("");
  const [street, setStreet] = useState("");
  const [landmark, setLandmark] = useState("");
  const [editableAddress, setEditableAddress] = useState("");

  const [loading, setLoading] = useState(false);

  // Sync prop to local state when modal becomes visible
  React.useEffect(() => {
    if (visible) {
      setEditableAddress(address || "");
    }
  }, [visible, address]);

  const handleSave = async () => {
    if (!editableAddress) {
      alert(t("enter_address_error") || "Please enter an address");
      return;
    }
    
    setLoading(true);
    try {
      const fullDetail = {
        address: editableAddress,
        houseNo,
        street,
        landmark,
        type: selectedCategory
      };

      // Map common categories to clean keys
      const key = selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1);
      
      await preferenceService.savePreference(
        key, 
        JSON.stringify(fullDetail), 
        'Location',
        CATEGORIES.find(c => c.id === selectedCategory)?.icon
      );
      
      onClose();
    } catch (error) {
      console.error("Failed to save address preference:", error);
      alert(t("save_failed") || "Failed to save address. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      transparent
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPress={onClose}
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.4)",
          justifyContent: "flex-end",
        }}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View
              style={{
                backgroundColor: COLORS.white,
                borderTopLeftRadius: 24,
                borderTopRightRadius: 24,
                paddingHorizontal: responsiveWidth(5),
                paddingTop: responsiveHeight(2),
                paddingBottom: responsiveHeight(4),
                width: "100%",
              }}
            >
              {/* Drag Handle */}
              <View
                style={{
                  width: 40,
                  height: 4,
                  backgroundColor: "#E0E0E0",
                  borderRadius: 2,
                  alignSelf: "center",
                  marginBottom: responsiveHeight(2),
                }}
              />

              <Text
                style={{
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.black,
                  marginBottom: responsiveHeight(2),
                }}
              >
                {t("save_address") || "Save Address"}
              </Text>

              {/* Address Input Section */}
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginBottom: responsiveHeight(3),
                  backgroundColor: '#F8F9FA',
                  borderRadius: 16,
                  paddingHorizontal: 12,
                  paddingVertical: 4,
                  borderWidth: 1,
                  borderColor: '#E9ECEF'
                }}
              >
                <Ionicons name="location" size={24} color={COLORS.primary} />
                <TextInput
                  value={editableAddress}
                  onChangeText={setEditableAddress}
                  placeholder={t("enter_address_placeholder") || "Enter address manually"}
                  multiline
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    fontSize: responsiveFontSize(1.6),
                    fontFamily: FONTS.regular,
                    color: COLORS.black,
                    minHeight: 50,
                    paddingTop: 8,
                    paddingBottom: 8,
                  }}
                />
                {address && editableAddress !== address && (
                  <TouchableOpacity 
                    onPress={() => setEditableAddress(address)}
                    style={{ padding: 4 }}
                  >
                    <MaterialCommunityIcons name="map-marker-radius" size={24} color={COLORS.primary} />
                  </TouchableOpacity>
                )}
              </View>

              {/* Inputs */}
              <View
                style={{
                  flexDirection: "row",
                  justifyContent: "space-between",
                  marginBottom: responsiveHeight(2),
                }}
              >
                <TextInput
                  placeholder={t("house_flat_no") || "House/Flat No"}
                  value={houseNo}
                  onChangeText={setHouseNo}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#E5E5E5",
                    borderRadius: 30,
                    paddingHorizontal: 15,
                    paddingVertical: Platform.OS === "ios" ? 12 : 8,
                    marginRight: 10,
                    fontFamily: FONTS.regular,
                    fontSize: responsiveFontSize(1.5),
                    color: COLORS.black,
                  }}
                  placeholderTextColor="#999"
                />
                <TextInput
                  placeholder={t("building_street") || "Building/Street"}
                  value={street}
                  onChangeText={setStreet}
                  style={{
                    flex: 1,
                    borderWidth: 1,
                    borderColor: "#E5E5E5",
                    borderRadius: 30,
                    paddingHorizontal: 15,
                    paddingVertical: Platform.OS === "ios" ? 12 : 8,
                    fontFamily: FONTS.regular,
                    fontSize: responsiveFontSize(1.5),
                    color: COLORS.black,
                  }}
                  placeholderTextColor="#999"
                />
              </View>

              <TextInput
                placeholder={
                  t("nearby_landmark") || "Nearby Landmark (Optional)"
                }
                value={landmark}
                onChangeText={setLandmark}
                style={{
                  borderWidth: 1,
                  borderColor: "#E5E5E5",
                  borderRadius: 30,
                  paddingHorizontal: 15,
                  paddingVertical: Platform.OS === "ios" ? 12 : 8,
                  marginBottom: responsiveHeight(3),
                  fontFamily: FONTS.regular,
                  fontSize: responsiveFontSize(1.5),
                  color: COLORS.black,
                }}
                placeholderTextColor="#999"
              />

              {/* Categories */}
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: responsiveHeight(3) }}
              >
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelectedCategory(cat.id)}
                      style={{
                        backgroundColor: isSelected ? COLORS.active : "#EDEDED",
                        borderWidth: isSelected ? 1.5 : 0,
                        borderColor: isSelected
                          ? COLORS.primary
                          : "transparent",
                        borderRadius: 12,
                        paddingVertical: 12,
                        paddingHorizontal: 16,
                        marginRight: 10,
                        alignItems: "center",
                        justifyContent: "center",
                        minWidth: responsiveWidth(20),
                      }}
                    >
                      <Ionicons
                        name={cat.icon}
                        size={24}
                        color={COLORS.black}
                        style={{ marginBottom: 4 }}
                      />
                      <Text
                        style={{
                          fontFamily: FONTS.medium,
                          fontSize: responsiveFontSize(1.4),
                          color: COLORS.black,
                        }}
                      >
                        {t(cat.id) || cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Save Button */}
              <TouchableOpacity
                onPress={handleSave}
                disabled={loading}
                style={{
                  width: "100%",
                  opacity: loading ? 0.7 : 1
                }}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    borderRadius: 30,
                    paddingVertical: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  {loading ? (
                    <ActivityIndicator color={COLORS.white} />
                  ) : (
                    <Text style={{ color: COLORS.white, fontFamily: FONTS.bold, fontSize: responsiveFontSize(2) }}>
                       {t("save") || "Save"}
                    </Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
};

export default SaveAddressModal;
