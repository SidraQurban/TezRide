import { View, Text, TouchableOpacity, Image, Linking, Animated } from "react-native";
import React, { useEffect, useRef } from "react";
import { Ionicons, MaterialIcons, FontAwesome } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const ArrivingCard = ({ onClose, driver, rideId, pickup, destination, rideStatus, telemetry }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const displayDuration = telemetry?.durationRemaining ?? (driver?.timeMinutes ? `${driver.timeMinutes} ${t("mins")}` : null);
  const displayDistance = telemetry?.distanceRemaining ?? (driver?.distanceKm != null ? `${parseFloat(driver.distanceKm).toFixed(2)} ${t("km")}` : null);
  const hasLiveData = !!(displayDuration || displayDistance);

  // Pulse animation when waiting for live data
  useEffect(() => {
    if (!hasLiveData) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        ])
      );
      pulse.start();
      return () => pulse.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [hasLiveData]);

  const isInTransit = rideStatus === "in_transit";
  const isArrived = rideStatus === "driver_arrived";
  const headerLabel = isInTransit
    ? t("ride_in_progress", { defaultValue: "Ride in Progress" })
    : isArrived
    ? t("driver_has_arrived", { defaultValue: "Driver has arrived!" })
    : t("driver_arriving", { defaultValue: "Driver is arriving..." });

  const accentColor = isInTransit ? "#10B981" : (COLORS.primary || "#F59E0B");

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 28,
        borderTopRightRadius: 28,
        paddingTop: responsiveHeight(1.5),
        paddingBottom: responsiveHeight(2.5),
        paddingHorizontal: responsiveWidth(5),
      }}
    >
      {/* ── Header: Status + ETA ─────────────────────── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: responsiveHeight(1.5),
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View
            style={{
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: accentColor,
              marginRight: 8,
            }}
          />
          <Text
            style={{
              fontSize: responsiveFontSize(2),
              fontFamily: FONTS.semiBold,
              color: "#111827",
            }}
          >
            {headerLabel}
          </Text>
        </View>

        {hasLiveData ? (
          <Text
            style={{
              fontSize: responsiveFontSize(1.8),
              color: accentColor,
              fontFamily: FONTS.bold,
            }}
          >
            {displayDuration}
          </Text>
        ) : (
          <Animated.Text
            style={{
              fontSize: responsiveFontSize(1.6),
              color: "#9CA3AF",
              fontFamily: FONTS.medium,
              opacity: pulseAnim,
            }}
          >
            Calculating...
          </Animated.Text>
        )}
      </View>

      {/* ── Live ETA / Distance Stats Row ────────────── */}
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "#F9FAFB",
          borderRadius: 14,
          paddingVertical: 12,
          paddingHorizontal: 16,
          marginBottom: responsiveHeight(1.5),
          alignItems: "center",
          justifyContent: "space-around",
        }}
      >
        {/* Distance */}
        <View style={{ alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
            <Ionicons name="navigate" size={13} color="#6B7280" style={{ marginRight: 3 }} />
            <Text style={{ fontSize: 11, color: "#6B7280", fontFamily: FONTS.medium }}>
              {isInTransit ? "Remaining" : "Distance"}
            </Text>
          </View>
          {displayDistance ? (
            <Text style={{ fontSize: responsiveFontSize(2.1), fontFamily: FONTS.bold, color: "#111827" }}>
              {displayDistance}
            </Text>
          ) : (
            <Animated.Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: "#CBD5E1", opacity: pulseAnim }}>
              — km
            </Animated.Text>
          )}
        </View>

        <View style={{ width: 1, height: 36, backgroundColor: "#E5E7EB" }} />

        {/* ETA */}
        <View style={{ alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
            <Ionicons name="time-outline" size={13} color="#6B7280" style={{ marginRight: 3 }} />
            <Text style={{ fontSize: 11, color: "#6B7280", fontFamily: FONTS.medium }}>ETA</Text>
          </View>
          {displayDuration ? (
            <Text style={{ fontSize: responsiveFontSize(2.1), fontFamily: FONTS.bold, color: accentColor }}>
              {displayDuration}
            </Text>
          ) : (
            <Animated.Text style={{ fontSize: 14, fontFamily: FONTS.medium, color: "#CBD5E1", opacity: pulseAnim }}>
              — min
            </Animated.Text>
          )}
        </View>

        <View style={{ width: 1, height: 36, backgroundColor: "#E5E7EB" }} />

        {/* Rating */}
        <View style={{ alignItems: "center" }}>
          <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 3 }}>
            <Ionicons name="star" size={13} color="#FFC107" style={{ marginRight: 3 }} />
            <Text style={{ fontSize: 11, color: "#6B7280", fontFamily: FONTS.medium }}>Rating</Text>
          </View>
          <Text style={{ fontSize: responsiveFontSize(2.1), fontFamily: FONTS.bold, color: "#111827" }}>
            {driver?.rating || driver?.Rating ? parseFloat(driver.rating || driver.Rating).toFixed(1) : "5.0"}
          </Text>
        </View>
      </View>

      {/* ── Driver Row ──────────────────────────────── */}
      <TouchableOpacity onPress={() => navigation.navigate("DriverProfile", { driver })}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: responsiveHeight(1.5),
          }}
        >
          {driver?.profilePicUrl ? (
            <Image
              source={{ uri: driver.profilePicUrl }}
              style={{
                width: responsiveWidth(13),
                height: responsiveWidth(13),
                borderRadius: responsiveWidth(6.5),
              }}
            />
          ) : (
            <View
              style={{
                width: responsiveWidth(13),
                height: responsiveWidth(13),
                borderRadius: responsiveWidth(6.5),
                backgroundColor: "#F0F0F0",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons name="person" size={26} color="#AAA" />
            </View>
          )}

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(1.9),
                color: "#111827",
              }}
            >
              {driver?.driverName || driver?.DriverName || t("driver")}
            </Text>
            <Text style={{ color: "#8A8A8A", fontSize: responsiveFontSize(1.5) }}>
              {(driver?.vehicleType || driver?.VehicleType || "")}
              {(driver?.vehiclePlateNumber || driver?.VehiclePlateNumber)
                ? ` • ${driver.vehiclePlateNumber || driver.VehiclePlateNumber}`
                : ""}
            </Text>
          </View>

          <View
            style={{
              backgroundColor: accentColor + "20",
              borderRadius: 20,
              paddingHorizontal: 10,
              paddingVertical: 4,
            }}
          >
            <Text style={{ color: accentColor, fontFamily: FONTS.semiBold, fontSize: 12 }}>
              {isInTransit ? "On Trip" : isArrived ? "Arrived" : "En Route"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* ── Divider ─────────────────────────────────── */}
      <View style={{ height: 1, backgroundColor: "#F0F0F0", marginBottom: responsiveHeight(1.5) }} />

      {/* ── Route: Pickup → Destination ─────────────── */}
      <View style={{ marginBottom: responsiveHeight(1) }}>
        {/* Pickup */}
        <View style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 12 }}>
          <View
            style={{
              marginTop: 2,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: "#10B98118",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="my-location" size={16} color="#10B981" />
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONTS.medium, marginBottom: 2 }}>
              {isInTransit ? "Started From" : "Pickup"}
            </Text>
            <Text style={{ fontFamily: FONTS.semiBold, fontSize: 14, color: "#111827" }} numberOfLines={1}>
              {pickup?.address || t("my_current_location")}
            </Text>
            {displayDistance && !isInTransit && (
              <Text style={{ color: "#6B7280", fontSize: 12, marginTop: 1 }}>
                {displayDistance} away
              </Text>
            )}
          </View>
        </View>

        {/* Dashed line connector */}
        <View style={{ width: 1, height: 8, backgroundColor: "#E5E7EB", marginLeft: 15, marginBottom: 4 }} />

        {/* Destination */}
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View
            style={{
              marginTop: 2,
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: accentColor + "18",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="location" size={16} color={accentColor} />
          </View>
          <View style={{ marginLeft: 10, flex: 1 }}>
            <Text style={{ fontSize: 11, color: "#9CA3AF", fontFamily: FONTS.medium, marginBottom: 2 }}>
              Destination
            </Text>
            <Text style={{ fontFamily: FONTS.semiBold, fontSize: 14, color: "#111827" }} numberOfLines={1}>
              {destination?.address || t("destination")}
            </Text>
            {isInTransit && displayDistance && (
              <Text style={{ color: accentColor, fontSize: 12, fontFamily: FONTS.medium, marginTop: 1 }}>
                {displayDistance} remaining
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Bottom Action Buttons ──────────────────── */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          marginTop: responsiveHeight(1.5),
          paddingTop: responsiveHeight(1),
          borderTopWidth: 1,
          borderTopColor: "#F3F4F6",
        }}
      >
        {/* Collapse */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: responsiveWidth(14),
            height: responsiveWidth(14),
            borderRadius: responsiveWidth(7),
            backgroundColor: "#F2F2F2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chevron-down" size={22} color="#6B7280" />
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 14,
            paddingVertical: 8,
            backgroundColor: "#F9FAFB",
            borderRadius: 20,
          }}
        >
          <Ionicons name="share-social" size={18} color={COLORS.secondary || "#6366F1"} />
          <Text style={{ marginLeft: 6, color: "#111827", fontFamily: FONTS.semiBold, fontSize: responsiveFontSize(1.6) }}>
            {t("share_my_ride")}
          </Text>
        </TouchableOpacity>

        {/* Chat */}
        <TouchableOpacity
          onPress={() =>
            navigation.navigate("Chat", {
              rideId: rideId || driver?.rideId || driver?.RideId,
              driverName: driver?.driverName || driver?.DriverName,
              profilePicUrl: driver?.profilePicUrl || driver?.ProfilePicUrl,
              phoneNumber: driver?.phoneNumber || driver?.PhoneNumber,
            })
          }
          style={{
            width: responsiveWidth(14),
            height: responsiveWidth(14),
            borderRadius: responsiveWidth(7),
            backgroundColor: COLORS.secondary || "#FCD34D",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chatbubble" size={20} color="#111827" />
        </TouchableOpacity>

        {/* Call */}
        <TouchableOpacity
          onPress={() => {
            let phone = driver?.phoneNumber || driver?.PhoneNumber;
            if (phone) {
              if (phone.startsWith("92")) {
                phone = "0" + phone.substring(2);
              }
              Linking.openURL(`tel:${phone}`).catch((err) => console.warn("Failed to open dialer", err));
            }
          }}
          style={{
            width: responsiveWidth(14),
            height: responsiveWidth(14),
            borderRadius: responsiveWidth(7),
            backgroundColor: COLORS.secondary || "#FCD34D",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="phone" size={20} color="#111827" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ArrivingCard;
