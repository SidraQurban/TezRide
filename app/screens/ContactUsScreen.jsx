import { View, Text, StyleSheet } from "react-native";
import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AppHeader from "../components/AppHeader";
import { COLORS, FONTS } from "../constants";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

const ContactUsScreen = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith("ur");

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader isRtlIcon={true} />

      {/* Page title */}
      <View style={[styles.pageTitleRow, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.pageTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("contact_us", "Contact Us")}</Text>
      </View>

      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#aaa", fontFamily: FONTS.regular }}>Coming soon...</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  pageTitleRow: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pageTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
});

export default ContactUsScreen;
