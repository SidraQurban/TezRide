import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CargoSchedule = ({ scheduleType, setScheduleType }) => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Schedule Delivery</Text>
      <View style={styles.scheduleRow}>
        <TouchableOpacity
          onPress={() => setScheduleType("Now")}
          style={[
            styles.scheduleBtn,
            scheduleType === "Now" && styles.selectedScheduleBtn,
          ]}
        >
          <Ionicons
            name={
              scheduleType === "Now" ? "radio-button-on" : "radio-button-off"
            }
            size={20}
            color={COLORS.primary}
          />
          <Text style={styles.scheduleBtnText}>Deliver Now</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setScheduleType("Later")}
          style={[
            styles.scheduleBtn,
            scheduleType === "Later" && styles.selectedScheduleBtn,
          ]}
        >
          <Ionicons name="calendar-outline" size={20} color="gray" />
          <Text style={styles.scheduleBtnText}>Schedule for later</Text>
        </TouchableOpacity>
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
    fontSize: responsiveFontSize(2),
    color: COLORS.black,
    marginBottom: responsiveHeight(1.5),
  },
  scheduleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scheduleBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#DDD",
    width: "48%",
  },
  selectedScheduleBtn: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.active,
  },
  scheduleBtnText: {
    marginLeft: 8,
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.5),
  },
});

export default CargoSchedule;
