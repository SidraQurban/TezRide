import { View, Text, TouchableOpacity, Image, Linking } from "react-native";
import React from "react";
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
import i18n from "../locales/i18n";

const ArrivingCard = ({ onClose, driver, rideId, pickup, destination, rideStatus, telemetry }) => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  
  const displayDuration = telemetry?.durationRemaining ?? (driver?.timeMinutes ? `${driver.timeMinutes} ${t("mins")}` : "");
  const displayDistance = telemetry?.distanceRemaining ?? (driver?.distanceKm != null ? `${parseFloat(driver.distanceKm).toFixed(2)} ${t("km")}` : "");

  return (
    <View
      style={{
        width: "100%",
        backgroundColor: "#fff",
        borderTopLeftRadius: 35,
        borderTopRightRadius: 35,
        paddingTop: responsiveHeight(1.5),
        paddingBottom: responsiveHeight(2.5),
        paddingHorizontal: responsiveWidth(5),
      }}
    >
      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: responsiveHeight(2),
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(2),
            fontFamily: FONTS.semiBold,
          }}
        >
          {rideStatus === "in_transit" 
            ? t("ride_in_progress", { defaultValue: "Ride in progress" })
            : rideStatus === "driver_arrived" 
            ? t("driver_has_arrived", { defaultValue: "Driver has arrived!" })
            : t("driver_arriving", { defaultValue: "Driver is arriving..." })}
        </Text>

        <Text
          style={{
            fontSize: responsiveFontSize(1.7),
            color: COLORS.primary,
            fontFamily: FONTS.bold,
          }}
        >
          {displayDuration}
        </Text>
      </View>

      {/* Driver Row */}
      <TouchableOpacity onPress={() => navigation.navigate("DriverProfile", { driver })}>
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: responsiveHeight(2),
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
                backgroundColor: '#F0F0F0',
                justifyContent: 'center',
                alignItems: 'center',
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
              }}
            >
              {driver?.driverName || driver?.DriverName || t("driver")}
            </Text>

            <Text
              style={{
                color: "#8A8A8A",
                fontSize: responsiveFontSize(1.5),
              }}
            >
              {(driver?.vehicleType || driver?.VehicleType || "")} {(driver?.vehiclePlateNumber || driver?.VehiclePlateNumber) ? `• ${driver.vehiclePlateNumber || driver.VehiclePlateNumber}` : ""}
            </Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="star" size={16} color="#FFC107" />
            <Text style={{ marginLeft: 4, fontSize: 13, fontFamily: FONTS.medium }}>
              {driver?.rating || driver?.Rating ? parseFloat(driver.rating || driver.Rating).toFixed(1) : "5.0"}
            </Text>
          </View>
        </View>
      </TouchableOpacity>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: "#F0F0F0",
          marginBottom: responsiveHeight(2),
        }}
      />

      {/* Locations */}
      <View>
        <View style={{ flexDirection: "row", marginBottom: 14 }}>
          <View
            style={{
              width: responsiveWidth(9),
              height: responsiveWidth(9),
              borderRadius: responsiveWidth(4.5),
              backgroundColor: COLORS.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <MaterialIcons name="my-location" size={18} color={COLORS.white} />
          </View>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontFamily: FONTS.medium, fontSize: 14 }} numberOfLines={1}>
              {pickup?.address || t("my_current_location")}
            </Text>
            {displayDistance !== "" && (
              <Text style={{ color: "#8A8A8A", fontSize: 12 }}>
                {displayDistance} {rideStatus === "in_transit" ? t("to_destination") : t("away")}
              </Text>
            )}
          </View>
        </View>

        <View style={{ flexDirection: "row" }}>
          <View
            style={{
              width: responsiveWidth(9),
              height: responsiveWidth(9),
              borderRadius: responsiveWidth(4.5),
              backgroundColor: COLORS.secondary,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons name="location" size={18} color={COLORS.white} />
          </View>

          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={{ fontFamily: FONTS.medium, fontSize: 14 }} numberOfLines={1}>
              {destination?.address || t("destination")}
            </Text>
            {/* <Text style={{ color: "#8A8A8A", fontSize: 12 }}>4 {t("km")}</Text> */}
          </View>
        </View>
      </View>
      {/* SHARE RIDE (RIGHT SIDE) */}
      <View
        style={{
          width: "100%",
          alignItems: "flex-end",
          marginBottom: responsiveHeight(1),
        }}
      >
        {/* Share My Ride Row */}
        <TouchableOpacity
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <Ionicons name="share-social" size={24} color={COLORS.secondary} />
          <Text
            style={{
              marginHorizontal: 6,
              color: COLORS.black,
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(1.7),
            }}
          >
            {t("share_my_ride")}
          </Text>
        </TouchableOpacity>
      </View>
      {/* Bottom Buttons */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-evenly",
          alignItems: "center",
          marginTop: responsiveHeight(1),
        }}
      >
        {/* ❌ CLOSE */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            width: responsiveWidth(15),
            height: responsiveWidth(15),
            borderRadius: responsiveWidth(7.5),
            backgroundColor: "#F2F2F2",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>

        {/* CHAT */}
        <TouchableOpacity
          onPress={() => navigation.navigate("Chat", { 
            rideId: rideId || driver?.rideId || driver?.RideId, 
            driverName: driver?.driverName || driver?.DriverName,
            profilePicUrl: driver?.profilePicUrl || driver?.ProfilePicUrl,
            phoneNumber: driver?.phoneNumber || driver?.PhoneNumber
          })}
          style={{
            width: responsiveWidth(16),
            height: responsiveWidth(16),
            borderRadius: responsiveWidth(8),
            backgroundColor: COLORS.secondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Ionicons name="chatbubble" size={24} color={COLORS.black} />
        </TouchableOpacity>

        {/* CALL */}
        <TouchableOpacity
          onPress={() => {
            let phone = driver?.phoneNumber || driver?.PhoneNumber;
            if (phone) {
              if (phone.startsWith('92')) {
                phone = '0' + phone.substring(2);
              }
              Linking.openURL(`tel:${phone}`).catch((err) => console.warn("Failed to open dialer", err));
            }
          }}
          style={{
            width: responsiveWidth(15),
            height: responsiveWidth(15),
            borderRadius: responsiveWidth(7.5),
            backgroundColor: COLORS.secondary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <FontAwesome name="phone" size={22} color={COLORS.black} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ArrivingCard;
