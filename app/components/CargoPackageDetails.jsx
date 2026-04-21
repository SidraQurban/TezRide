import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CargoPackageDetails = ({ selectedCategory, setSelectedCategory }) => {
  const categories = [
    { id: "Documents", icon: "file-document-outline" },
    { id: "Small Parcel", icon: "package-variant" },
    { id: "Large Parcel", icon: "package-variant-closed" },
    { id: "Fragile", icon: "wine-glass-outline" },
  ];

  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Package Details</Text>
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
            <Text style={styles.categoryLabel}>{cat.id}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.inputRow}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.inputLabel}>Weight</Text>
          <View style={styles.weightInputContainer}>
            <TextInput
              style={styles.weightInput}
              placeholder="5"
              placeholderTextColor="gray"
              keyboardType="numeric"
            />
            <Text style={styles.unitText}>kg/lbs</Text>
          </View>
        </View>
        <View style={{ flex: 1.5 }}>
          <Text style={styles.inputLabel}>Drop-off Contact</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Ali"
            placeholderTextColor="gray"
          />
        </View>
      </View>

      <Text style={styles.inputLabel}>
        Notes{" "}
        <Text style={{ color: "gray", fontWeight: "400" }}>(optional)</Text>
      </Text>
      <TextInput
        style={styles.textInput}
        placeholder="Handle with care"
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
    fontSize: responsiveFontSize(1.8),
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
