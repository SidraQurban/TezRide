import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CargoPricingSummary = ({ total }) => {
  const { t } = useTranslation();
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("pricing_summary")}</Text>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>{t("delivery_fee")}:</Text>
        <Text style={styles.priceValue}>Rs 750</Text>
      </View>
      <View style={styles.priceRow}>
        <Text style={styles.priceLabel}>{t("service_fee")}:</Text>
        <Text style={styles.priceValue}>Rs 100</Text>
      </View>
      <View style={[styles.priceRow, styles.totalRow]}>
        <Text style={styles.totalLabel}>{t("total")}:</Text>
        <Text style={styles.totalValue}>Rs {total}</Text>
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
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  priceLabel: {
    color: "gray",
    fontFamily: FONTS.medium,
  },
  priceValue: {
    fontFamily: FONTS.bold,
  },
  totalRow: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#EEE",
  },
  totalLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.8),
  },
  totalValue: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.2),
    color: COLORS.primary,
  },
});

export default CargoPricingSummary;
