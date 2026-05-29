import React from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const CargoReceiverInfo = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language?.startsWith("ur");
  return (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { textAlign: "left" }]}>{t("sender_receiver_info")}</Text>
      <Text style={[styles.subLabel, { textAlign: "left" }]}>
        {t("sender_label")}: <Text style={{ color: COLORS.black }}>{t("sender_name")}</Text>
      </Text>

      <View style={styles.receiverContainer}>
        <TextInput
          style={styles.textInput}
          placeholder={t("receiver_name_placeholder")}
          placeholderTextColor="gray"
        />
        <View style={[styles.phoneInputContainer, { flexDirection: isUrdu ? "row-reverse" : "row" }]}>
          <View style={[styles.phoneIcon, { borderRightWidth: isUrdu ? 0 : 1, borderLeftWidth: isUrdu ? 1 : 0, borderLeftColor: "#DDD" }]}>
            <Ionicons name="call-outline" size={18} color="gray" />
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="+92 300 1234567"
            placeholderTextColor="gray"
          />
        </View>
        <TouchableOpacity style={[styles.contactLink, { alignSelf: "flex-start", marginLeft: "auto" }]}>
          <Text style={styles.contactLinkText}>{t("select_from_contacts")}</Text>
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
    textAlign: "left",
    writingDirection: "ltr",
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
    textAlign: "left",
    writingDirection: "ltr",
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
