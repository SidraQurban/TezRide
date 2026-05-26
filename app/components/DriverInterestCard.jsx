import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image, Animated, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants/theme";
import { useTranslation } from "react-i18next";
import { LinearGradient } from "expo-linear-gradient";

const DriverInterestCard = ({ driver, onAccept, onDecline, duration = 15000 }) => {
  const { t } = useTranslation();
  const [progress] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(responsiveWidth(100)));

  useEffect(() => {
    // Slide in from right
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();

    // Progress bar animation (fills from 0 to 1)
    Animated.timing(progress, {
      toValue: 1,
      duration: duration,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        onDecline(driver.driverId);
      }
    });
  }, []);

  return (
    <Animated.View
      style={[
        styles.card,
        {
          transform: [{ translateX: slideAnim }],
        },
      ]}
    >
      {/* Top Info Section */}
      <View style={styles.topInfo}>
        <View style={styles.infoLeft}>
          <Text numberOfLines={1} style={styles.driverName}>
            {driver.driverName || t("driver")}
          </Text>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={16} color="#FF9500" />
            <Text style={styles.ratingText}>
              {driver.rating ? driver.rating.toFixed(1) : "5.0"}
              <Text style={styles.tripsText}>
                {" "}
                ({driver.tripsCount || 0} {t("trips")})
              </Text>
            </Text>
          </View>
        </View>

        <View style={styles.infoRight}>
          <Text style={styles.priceText}>
            {t("rs")}. {driver.price || "---"}
          </Text>
          <Text style={styles.etaText}>
            {driver.eta || "---"} {t("mins")}
          </Text>
        </View>
      </View>

      {/* Progress Divider (The Orange Line) */}
      <View style={styles.progressContainer}>
        <Animated.View
          style={[
            styles.progressBar,
            {
              width: progress.interpolate({
                inputRange: [0, 1],
                outputRange: ["0%", "100%"],
              }),
            },
          ]}
        />
      </View>

      {/* Action Buttons Row */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          onPress={() => onDecline(driver.driverId)}
          style={styles.declineBtn}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={28} color="#991B1B" />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onAccept(driver.driverId)}
          style={styles.acceptBtnContainer}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.acceptBtnGradient}
          >
            <Ionicons name="checkmark" size={28} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    alignSelf: "stretch",
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
    marginBottom: responsiveHeight(1.5),
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: "#F0F0F0",
  },
  topInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  infoLeft: {
    flex: 1,
  },
  driverName: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(2),
    color: "#1F2937",
    marginBottom: 4,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.semiBold,
    color: "#4B5563",
    marginLeft: 4,
  },
  tripsText: {
    fontFamily: FONTS.regular,
    color: "#9CA3AF",
  },
  infoRight: {
    alignItems: "flex-end",
  },
  priceText: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2),
    color: "#111827",
    marginBottom: 4,
  },
  etaText: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    color: "#6B7280",
  },
  progressContainer: {
    height: 4,
    backgroundColor: "#F3F4F6",
    borderRadius: 2,
    marginVertical: 12,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FF9500", // Orange progress line
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  declineBtn: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#FECACA",
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
  },
  acceptBtnContainer: {
    flex: 1,
    height: 52,
    borderRadius: 12,
    overflow: "hidden",
  },
  acceptBtnGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DriverInterestCard;
