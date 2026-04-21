import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CargoPackageDetails = ({ selectedCategory, setSelectedCategory }) => {
  const { t } = useTranslation();
  const categories = [
    { id: "documents", icon: "file-document-outline" },
    { id: "small_parcel", icon: "package-variant" },
    { id: "large_parcel", icon: "package-variant-closed" },
    { id: "fragile", icon: "cup-outline" },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{t("cargo_package_category")}</Text>
      <View style={styles.categoryRow}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => setSelectedCategory(cat.id)}
            style={[
              styles.categoryItem,
              selectedCategory === cat.id && styles.selectedCategory,
            ]}
          >
            <MaterialCommunityIcons
              name={cat.icon}
              size={30}
              color={selectedCategory === cat.id ? COLORS.primary : "#555"}
            />
            <Text style={styles.categoryLabel}>{t(cat.id)}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View
        style={{
          flexDirection: "row",
          marginTop: responsiveHeight(2),
          gap: 15,
        }}
      >
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>{t("package_weight")}</Text>
          <View style={styles.weightInputContainer}>
            <TextInput
              style={styles.weightInput}
              placeholder="5"
              placeholderTextColor="gray"
              keyboardType="numeric"
            />
            <Text style={styles.unitText}>{t("kg")}</Text>
          </View>
        </View>
        <View style={{ flex: 1.5 }}>
          <Text style={styles.inputLabel}>{t("dropoff_contact")}</Text>
          <TextInput
            style={styles.textInput}
            placeholder={t("dropoff_name_placeholder")}
            placeholderTextColor="gray"
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>{t("notes_optional")}</Text>
      <TextInput
        style={styles.textInput}
        placeholder={t("handle_with_care")}
        placeholderTextColor="gray"
      />
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
  categoryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: responsiveHeight(2),
  },
  categoryItem: {
    width: responsiveWidth(20),
    height: responsiveHeight(10),
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#EEE",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F9F9F9",
  },
  selectedCategory: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.active,
  },
  categoryLabel: {
    fontSize: responsiveFontSize(1.1),
    fontFamily: FONTS.medium,
    marginTop: 5,
    textAlign: "center",
    color: "#555",
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: responsiveHeight(1.5),
  },
  inputLabel: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.6),
    color: COLORS.black,
    marginBottom: 8,
  },
  weightInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 10,
    height: responsiveHeight(6),
    backgroundColor: "#F9F9F9",
  },
  weightInput: {
    flex: 1,
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.8),
    color: COLORS.black,
  },
  unitText: {
    color: "gray",
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.4),
    borderLeftWidth: 1,
    borderLeftColor: "#DDD",
    paddingLeft: 10,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    paddingHorizontal: 12,
    height: responsiveHeight(6),
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.8),
    backgroundColor: "#F9F9F9",
    marginBottom: responsiveHeight(1),
    color: COLORS.black,
  },
});

export default CargoPackageDetails;
