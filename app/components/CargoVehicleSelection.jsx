import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5 } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CargoVehicleSelection = ({ selectedVehicle, setSelectedVehicle }) => {
  const vehicles = [
    { id: "Bike", icon: "bicycle", price: "250", time: "15-20 mins" },
    { id: "Car", icon: "car", price: "450", time: "20-25 mins" },
    { id: "Van", icon: "truck", price: "850", time: "30-35 mins" },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Select Vehicle</Text>
      <View style={styles.vehicleRow}>
        {vehicles.map((v) => (
          <TouchableOpacity
            key={v.id}
            onPress={() => setSelectedVehicle(v.id)}
            style={[
              styles.vehicleCard,
              selectedVehicle === v.id && styles.selectedVehicleCard,
            ]}
          >
            {selectedVehicle === v.id && (
              <View style={styles.checkIcon}>
                <Ionicons
                  name="checkmark-circle"
                  size={18}
                  color={COLORS.primary}
                />
              </View>
            )}
            <FontAwesome5 name={v.icon} size={24} color="black" />
            <Text style={styles.vehiclePrice}>Rs {v.price}</Text>
            <Text style={styles.vehicleTime}>{v.time}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: responsiveHeight(3),
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.8),
    color: COLORS.black,
    marginBottom: responsiveHeight(1.5),
  },
  vehicleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  vehicleCard: {
    width: responsiveWidth(28),
    paddingVertical: responsiveHeight(2),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    alignItems: "center",
    backgroundColor: "#FFF",
  },
  selectedVehicleCard: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.active,
  },
  checkIcon: {
    position: "absolute",
    top: 5,
    right: 5,
  },
  vehiclePrice: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.8),
    marginTop: 8,
  },
  vehicleTime: {
    fontSize: responsiveFontSize(1.4),
    color: "gray",
    fontFamily: FONTS.regular,
  },
});

export default CargoVehicleSelection;
