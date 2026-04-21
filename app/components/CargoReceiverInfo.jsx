import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CargoReceiverInfo = () => {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Sender & Receiver Information</Text>
      <Text style={styles.subLabel}>
        Sender: <Text style={{ color: COLORS.black }}>Ali Ahmed</Text>
      </Text>

      <View style={styles.receiverContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Receiver Name : Usman Khan"
          placeholderTextColor="gray"
        />
        <View style={styles.phoneInputContainer}>
          <View style={styles.phoneIcon}>
            <Ionicons name="call-outline" size={18} color="gray" />
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="+92 300 1234567"
            placeholderTextColor="gray"
          />
        </View>
        <TouchableOpacity style={styles.contactLink}>
          <Text style={styles.contactLinkText}>Select from Contacts</Text>
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
    fontSize: responsiveFontSize(1.8),
    color: COLORS.black,
    marginBottom: responsiveHeight(1.5),
  },
  subLabel: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    color: "gray",
    marginBottom: 10,
  },
  receiverContainer: {
    marginTop: 5,
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
  phoneInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#DDD",
    borderRadius: 8,
    height: responsiveHeight(6),
    backgroundColor: "#F9F9F9",
  },
  phoneIcon: {
    paddingHorizontal: 12,
    borderRightWidth: 1,
    borderRightColor: "#DDD",
  },
  phoneInput: {
    flex: 1,
    paddingHorizontal: 12,
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.8),
    color: COLORS.black,
  },
  contactLink: {
    alignSelf: "flex-end",
    marginTop: 8,
  },
  contactLinkText: {
    color: COLORS.primary,
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.5),
  },
});

export default CargoReceiverInfo;
