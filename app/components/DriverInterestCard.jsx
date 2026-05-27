import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet } from "react-native";
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
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7,
    }).start();

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
      {/* Top Row: Name & Price */}
      <View style={styles.row}>
        <Text numberOfLines={1} style={styles.driverName}>
          {driver.driverName || t("driver")}
        </Text>
        <Text style={styles.priceText}>
          {t("currency")} {driver.price || "---"}
        </Text>
      </View>

      {/* Second Row: Rating & ETA */}
      <View style={[styles.row, { marginTop: 2 }]}>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={14} color="#FFD700" />
          <Text style={styles.ratingText}>
            {driver.rating ? driver.rating.toFixed(1) : "5.0"}
            <Text style={styles.tripsText}> ({driver.tripsCount || 0} {t("trips")})</Text>
          </Text>
        </View>
        <Text style={styles.etaText}>
          {driver.eta || "---"} {t("mins")}
        </Text>
      </View>

      {/* Progress Bar (Separator) */}
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
          <Ionicons name="close" size={22} color="#991B1B" />
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
            <Ionicons name="checkmark" size={22} color="#FFF" />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    marginBottom: 8,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    width: '100%',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  driverName: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.8),
    color: "#000",
    flex: 1,
  },
  priceText: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.8),
    color: "#000",
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.medium,
    color: "#6B7280",
    marginLeft: 4,
  },
  tripsText: {
    fontFamily: FONTS.regular,
    color: "#9CA3AF",
  },
  etaText: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.4),
    color: "#9CA3AF",
  },
  progressContainer: {
    height: 3,
    backgroundColor: "#F3F4F6",
    width: '100%',
    marginTop: 8,
    marginBottom: 8,
    borderRadius: 1.5,
    overflow: 'hidden'
  },
  progressBar: {
    height: "100%",
    backgroundColor: "#FFB000", // Orange from the image
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  declineBtn: {
    flex: 1,
    height: 40,
    borderRadius: 8,
    backgroundColor: "#FFF",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#991B1B",
  },
  acceptBtnContainer: {
    flex: 1.2,
    height: 40,
    borderRadius: 8,
    overflow: "hidden",
  },
  acceptBtnGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default DriverInterestCard;
