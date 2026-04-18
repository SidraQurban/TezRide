import React from "react";
import { View, Text, TouchableOpacity, Modal, Linking, TouchableWithoutFeedback } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import * as ExpoLocation from "expo-location";

const LocationModal = ({ visible, onClose }) => {
  const { t } = useTranslation();

  const handleEnableLocation = async () => {
    try {
      // Step 1: Request app-level location permission
      const { status, canAskAgain } = await ExpoLocation.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (!canAskAgain) {
          // Permanently denied ("Don't ask again" was checked) — must open Settings
          Linking.openSettings();
        }
        // First-time denial — just close the modal, let the user continue
        onClose();
        return;
      }

      // Step 2: Check if the device GPS/Location Services is ON
      const isGpsEnabled = await ExpoLocation.hasServicesEnabledAsync();

      if (!isGpsEnabled) {
        // Shows the native Android "Turn on Location?" system dialog
        await ExpoLocation.enableNetworkProviderAsync();
      }

      // Both permission and GPS are handled — close the modal
      onClose();
    } catch (e) {
      // Fallback: just close the modal so the app doesn't get stuck
      onClose();
    }
  };

  return (
    <View>
      <Modal transparent animationType="fade" visible={visible} onRequestClose={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.4)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <TouchableWithoutFeedback>
            <View
              style={{
                width: "85%",
                backgroundColor: COLORS.white,
                borderRadius: 20,
                padding: 24,
                alignItems: "center",

                shadowColor: COLORS.black,
                shadowOpacity: 0.1,
                shadowRadius: 10,
                shadowOffset: { width: 0, height: 5 },
                elevation: 5,
              }}
            >
              {/* ICON AREA */}
              <View
                style={{
                  marginBottom: 20,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* BIG CIRCLE */}
                <View
                  style={{
                    width: 120,
                    height: 120,
                    borderRadius: 60,
                    backgroundColor: COLORS.secondary,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="location" size={45} color={COLORS.black} />
                </View>

                {/* ===== PERFECT CIRCULAR DOTS ===== */}
                {[...Array(10)].map((_, i) => {
                  const radius = 80;
                  const angle = (i * 360) / 10;
                  const rad = (angle * Math.PI) / 180;

                  const x = radius * Math.cos(rad);
                  const y = radius * Math.sin(rad);

                  const sizes = [14, 7, 10, 0, 7, 10, 6, 8, 0, 8];

                  return (
                    <View
                      key={i}
                      style={{
                        position: "absolute",
                        top: 60 + y,
                        left: 60 + x,
                        width: sizes[i],
                        height: sizes[i],
                        borderRadius: sizes[i] / 2,
                        backgroundColor: COLORS.primary,
                        opacity: 0.6 + (i % 3) * 0.15,
                      }}
                    />
                  );
                })}
              </View>

              {/* TITLE */}
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  fontFamily: FONTS.bold,
                  marginBottom: 6,
                  marginTop: responsiveHeight(2),
                }}
              >
                {t("enable_location_title")}
              </Text>

              {/* DESCRIPTION */}
              <Text
                style={{
                  fontSize: responsiveFontSize(1.5),
                  color: "#777",
                  textAlign: "center",
                  marginBottom: 22,
                  fontFamily: FONTS.regular,
                  lineHeight: 20,
                }}
              >
                {t("enable_location_desc")}
              </Text>

              {/* ENABLE BUTTON */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={handleEnableLocation}
                style={{ width: "100%", marginBottom: 10 }}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    width: "100%",
                    paddingVertical: 13,
                    borderRadius: 30,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text
                    style={{
                      color: "#fff",
                      fontFamily: FONTS.semiBold,
                      fontSize: responsiveFontSize(1.6),
                    }}
                  >
                    {t("enable_location_btn")}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* CANCEL BUTTON */}
              <TouchableOpacity
                onPress={onClose}
                style={{
                  width: "100%",
                  backgroundColor: COLORS.serviceBg,
                  paddingVertical: 13,
                  borderRadius: 30,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    color: "#000",
                    fontFamily: FONTS.semiBold,
                    fontSize: responsiveFontSize(1.6),
                  }}
                >
                  {t("dont_allow")}
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

export default LocationModal;
