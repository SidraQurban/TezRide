import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CargoSchedule = ({ scheduleType, setScheduleType }) => {
  const { t } = useTranslation();
  const options = [
    { id: "Now", label: t("now"), icon: "flash-outline" },
    { id: "Later", label: t("scheduled"), icon: "calendar-outline" },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("schedule_delivery")}</Text>
      <View style={styles.scheduleRow}>
        {options.map((opt) => (
          <TouchableOpacity
            key={opt.id}
            onPress={() => setScheduleType(opt.id)}
            style={[
              styles.scheduleBtn,
              scheduleType === opt.id && styles.selectedScheduleBtn,
            ]}
          >
            <Ionicons
              name={opt.icon}
              size={18}
              color={scheduleType === opt.id ? COLORS.primary : "gray"}
            />
            <Text style={styles.scheduleBtnText}>{opt.label}</Text>
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
