import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { Ionicons, MaterialCommunityIcons, FontAwesome, Entypo } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS } from "../constants/theme";
import AppHeader from "../components/AppHeader";

const ContactUsScreen = () => {
  const { t, i18n } = useTranslation();
  const isRTL = false;

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      Alert.alert(t("error"), t("fill_all_fields"));
      return;
    }
    
    // Simulate API call
    Alert.alert(t("success"), t("message_sent_success"));
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const openLink = (url) => {
    Linking.openURL(url).catch((err) => console.error("An error occurred", err));
  };

  const ContactCard = ({ icon, title, value, onPress, iconType = "Ionicons" }) => (
    <TouchableOpacity style={styles.contactCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.cardIconContainer}>
        {iconType === "Ionicons" ? (
          <Ionicons name={icon} size={24} color={COLORS.primary} />
        ) : iconType === "Material" ? (
          <MaterialCommunityIcons name={icon} size={24} color={COLORS.primary} />
        ) : (
          <FontAwesome name={icon} size={24} color={COLORS.primary} />
        )}
      </View>
      <View style={[styles.cardContent, { alignItems: "flex-start" }]}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </View>
      <Ionicons
        name="chevron-forward"
        size={20}
        color="#ccc"
        style={{ marginLeft: 10, marginRight: 0 }}
      />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader isRtlIcon={true} />
      
      {/* Page title aligned with WalletScreen */}
      <View style={[styles.pageTitleRow, { alignItems: "flex-start" }]}>
        <Text style={[styles.pageTitle, { textAlign: "left" }]}>
          {t("contact_us", "Contact Us")}
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          <View style={styles.bannerContainer}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.helpBanner}
            >
              <View style={styles.bannerIconContainer}>
                <MaterialCommunityIcons name="headset" size={26} color={COLORS.white} />
              </View>
              <View style={{ marginLeft: 15, flex: 1 }}>
                <Text style={styles.bannerTitle}>{t("here_to_help_title")}</Text>
                <Text style={[styles.bannerSubtitle, { color: "rgba(255,255,255,0.85)" }]}>{t("here_to_help_desc")}</Text>
              </View>
            </LinearGradient>
          </View>

          <View style={[styles.sectionHeader, { alignItems: "flex-start" }]}>
            <Text style={styles.sectionTitle}>{t("contact_info")}</Text>
          </View>

          <View style={styles.cardsContainer}>
            <ContactCard
              icon="call-outline"
              title={t("phone")}
              value="+92 321 1234567"
              onPress={() => openLink("tel:+923211234567")}
            />
            <ContactCard
              icon="whatsapp"
              iconType="Material"
              title={t("whatsapp")}
              value="+92 321 1234567"
              onPress={() => openLink("whatsapp://send?phone=+923211234567")}
            />
            <ContactCard
              icon="mail-outline"
              title={t("email")}
              value="support@tezride.com"
              onPress={() => openLink("mailto:support@tezride.com")}
            />
            <ContactCard
              icon="location-outline"
              title={t("our_office")}
              value="Saddar, Karachi, Pakistan"
              onPress={() => openLink("https://maps.google.com/?q=Saddar,Karachi")}
            />
          </View>

          <View style={[styles.sectionHeader, { alignItems: "flex-start" }]}>
            <Text style={styles.sectionTitle}>{t("get_in_touch")}</Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: "left" }]}>
                {t("full_name")}
              </Text>
              <TextInput
                style={[styles.input, { textAlign: "left" }]}
                placeholder={t("full_name")}
                value={formData.name}
                onChangeText={(val) => handleInputChange("name", val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: "left" }]}>
                {t("email_address")}
              </Text>
              <TextInput
                style={[styles.input, { textAlign: "left" }]}
                placeholder={t("email_address")}
                keyboardType="email-address"
                autoCapitalize="none"
                value={formData.email}
                onChangeText={(val) => handleInputChange("email", val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: "left" }]}>
                {t("subject")}
              </Text>
              <TextInput
                style={[styles.input, { textAlign: "left" }]}
                placeholder={t("subject")}
                value={formData.subject}
                onChangeText={(val) => handleInputChange("subject", val)}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { textAlign: "left" }]}>
                {t("message")}
              </Text>
              <TextInput
                style={[
                  styles.input,
                  styles.textArea,
                  { textAlign: "left" },
                ]}
                placeholder={t("message")}
                multiline
                numberOfLines={4}
                value={formData.message}
                onChangeText={(val) => handleInputChange("message", val)}
              />
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              activeOpacity={0.8}
              style={styles.submitButtonContainer}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitButton}
              >
                <Text style={styles.submitButtonText}>{t("send_message")}</Text>
                <Ionicons
                  name="chevron-forward"
                  size={20}
                  color={COLORS.white}
                  style={{ marginLeft: 10, marginRight: 0 }}
                />
              </LinearGradient>
            </TouchableOpacity>
          </View>
          
          <View style={styles.footer}>
            <Text style={styles.followUsText}>Follow Us</Text>
            <View style={styles.socialIcons}>
              <TouchableOpacity onPress={() => openLink("https://facebook.com/tezride")}>
                <Entypo name="facebook-with-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink("https://twitter.com/tezride")}>
                <Entypo name="twitter-with-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => openLink("https://instagram.com/tezride")}>
                <Entypo name="instagram-with-circle" size={32} color={COLORS.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
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
  scrollContent: {
    paddingBottom: responsiveHeight(5),
  },
  bannerContainer: {
    paddingHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(2.5),
  },
  helpBanner: {
    borderRadius: 15,
    padding: responsiveHeight(2),
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  bannerIconContainer: {
    width: 50,
    height: 50, 
    borderRadius: 15,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  bannerTitle: {
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
    color: COLORS.white,
    textAlign: "left",
  },
  bannerSubtitle: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "rgba(255, 255, 255, 0.9)",
    textAlign: "left",
    marginTop: 2,
  },
  sectionHeader: {
    paddingHorizontal: responsiveWidth(5),
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  cardsContainer: {
    paddingHorizontal: responsiveWidth(5),
    marginBottom: responsiveHeight(1),
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  cardIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: "rgba(255, 92, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
    marginHorizontal: 15,
  },
  cardTitle: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.medium,
    color: "#888",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  cardValue: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
    marginTop: 2,
  },
  formContainer: {
    paddingHorizontal: responsiveWidth(5),
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.medium,
    color: COLORS.black,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: Platform.OS === "ios" ? 15 : 10,
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.regular,
    color: COLORS.black,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  submitButtonContainer: {
    marginTop: 10,
    marginBottom: 20,
  },
  submitButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 15,
    borderRadius: 12,
  },
  submitButtonText: {
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  footer: {
    alignItems: "center",
    marginTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
    paddingTop: 20,
    marginHorizontal: responsiveWidth(5),
  },
  followUsText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.semiBold,
    color: "#888",
    marginBottom: 15,
  },
  socialIcons: {
    flexDirection: "row",
    gap: 20,
  },
});

export default ContactUsScreen;
