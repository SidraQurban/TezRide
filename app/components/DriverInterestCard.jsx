import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Animated, StyleSheet, Image } from "react-native";
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
      <View style={styles.cardContent}>
        {/* Profile Image */}
        <View style={styles.imageContainer}>
          <Image
            source={driver.profilePicUrl ? { uri: driver.profilePicUrl } : require("../../assets/car.png")}
            style={styles.profileImg}
          />
          <View style={styles.activeDot} />
        </View>

        <View style={styles.detailsContainer}>
          {/* Top Row: Name & Price */}
          <View style={styles.row}>
            <Text numberOfLines={1} style={styles.driverName}>
              {driver.driverName || t("driver")}
            </Text>
            <Text style={styles.priceText}>
              {t("currency")} {driver.price || "---"}
            </Text>
          </View>

          {/* Second Row: Rating & Trips & ETA */}
          <View style={[styles.row, { marginTop: 4 }]}>
            <View style={styles.statGroup}>
              <View style={styles.ratingBadge}>
                <Ionicons name="star" size={12} color="#FFF" />
                <Text style={styles.ratingBadgeText}>
                  {driver.rating ? driver.rating.toFixed(1) : "5.0"}
                </Text>
              </View>
              <View style={styles.tripsInfo}>
                <Text style={styles.tripsValue}>{driver.tripsCount || 0}</Text>
                <Text style={styles.tripsLabel}>{t("trips")}</Text>
              </View>
            </View>
            <View style={styles.etaContainer}>
              <Ionicons name="time-outline" size={12} color={COLORS.primary} />
              <Text style={styles.etaText}>
                {driver.eta || "3-5"} {t("mins")}
              </Text>
            </View>
          </View>
        </View>
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
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  profileImg: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#F3F4F6',
    borderWidth: 2,
    borderColor: '#F3F4F6',
  },
  activeDot: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  detailsContainer: {
    flex: 1,
  },
  driverName: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.8),
    color: "#1F2937",
    flex: 1,
  },
  priceText: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2),
    color: COLORS.primary,
  },
  statGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFB000',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    gap: 4,
  },
  ratingBadgeText: {
    color: '#FFF',
    fontSize: 12,
    fontFamily: FONTS.bold,
  },
  tripsInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  tripsValue: {
    fontSize: 13,
    fontFamily: FONTS.bold,
    color: '#4B5563',
  },
  tripsLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: '#9CA3AF',
  },
  etaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary + '10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    gap: 4,
  },
  etaText: {
    fontFamily: FONTS.medium,
    fontSize: 11,
    color: COLORS.primary,
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
