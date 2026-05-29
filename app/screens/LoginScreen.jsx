import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { FONTS } from "../constants/theme";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";

import authService from "../api/authService";
import { ActivityIndicator, Alert } from "react-native";
import ModernAlert from "../components/ModernAlert";

const countries = [
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  // { code: "+91", flag: "🇮🇳", name: "India" },
  // { code: "+1", flag: "🇺🇸", name: "USA" },
  // { code: "+44", flag: "🇬🇧", name: "UK" },
];

const LoginScreen = () => {
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language?.startsWith("ur");
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const [privacyModalVisible, setPrivacyModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });

  const toggleLanguage = () => {
    const newLang = i18n.language?.startsWith("ur") ? "en" : "ur";
    i18n.changeLanguage(newLang);
    if (newLang === "ur" && !I18nManager.isRTL) {
      I18nManager.forceRTL(true);
    } else if (newLang === "en" && I18nManager.isRTL) {
      I18nManager.forceRTL(false);
    }
  };

  const isPhoneComplete = phone.length === 10;

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 10) {
      setPhone(cleaned);
    }
  };

  const handleSendOTP = async () => {
    if (!isPhoneComplete) return;

    setLoading(true);
    try {
      const fullPhoneNumber = `${selectedCountry.code}${phone}`;
      const response = await authService.sendOTP(fullPhoneNumber);

      if (response.succeeded) {
        navigation.navigate("VerifyCode", {
          phoneNumber: fullPhoneNumber,
        });
      } else {
        const message = response.message && response.message.toLowerCase().includes("please wait") 
          ? t("wait_for_otp") 
          : response.message || t("otp_send_failed");
        
        setAlertConfig({
          visible: true,
          title: t("error"),
          message: message,
        });
      }
    } catch (error) {
      setAlertConfig({
        visible: true,
        title: t("error"),
        message: (error.message && error.message.toLowerCase().includes("please wait")) ? t("wait_for_otp") : (error.message || t("something_went_wrong")),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "padding"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={
          Platform.OS === "ios" ? 0 : responsiveHeight(20)
        }
      >
        {/* Sleek Language Toggle UI (Right Corner) */}
        <View
          style={{
            width: "100%",
            alignItems: "flex-end",
            paddingHorizontal: responsiveWidth(5),
            paddingTop: responsiveHeight(1),
          }}
        >
          <TouchableOpacity
            onPress={toggleLanguage}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              backgroundColor: "#F3F4F6",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: 20,
              paddingVertical: 6,
              paddingHorizontal: 14,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Ionicons
              name="globe-outline"
              size={14}
              color={COLORS.primary}
              style={
                i18n.language === "ur" ? { marginLeft: 6 } : { marginRight: 6 }
              }
            />
            <Text
              style={{
                fontSize: responsiveFontSize(1.6),
                color: COLORS.primary,
                fontFamily: FONTS.medium,
                marginTop: 2,
              }}
            >
              {i18n.language === "en" ? "اردو" : "EN"}
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: "space-between",
            alignItems: "center",
            paddingVertical: responsiveHeight(3),
          }}
        >
          {/* TOP SECTION */}
          <View style={{ alignItems: "center", width: "100%" }}>
            {/* Logo */}
            <Image
              source={require("../../assets/logo.png")}
              resizeMode="contain"
              style={{
                height: responsiveHeight(18),
                width: responsiveWidth(70),
              }}
            />

            {/* Text */}
            <View
              style={{ alignItems: "center", marginTop: responsiveHeight(1) }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2.3),
                  fontFamily: FONTS.semiBold,
                  textAlign: "center",
                }}
              >
                {t("enter_number")}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(2.3),
                  fontFamily: FONTS.semiBold,
                  textAlign: "center",
                }}
              >
                {t("continue_text")}
              </Text>
            </View>

            {/* Phone Input */}
            <View
              style={{
                flexDirection: isUrdu ? "row-reverse" : "row",
                alignItems: "center",
                marginTop: responsiveHeight(4),
                borderWidth: 1.5,
                borderColor: isPhoneComplete ? COLORS.primary : "#ccc",
                borderRadius: responsiveWidth(3),
                paddingHorizontal: responsiveWidth(3),
                height: responsiveHeight(6.5),
                width: responsiveWidth(85),
                marginBottom: responsiveHeight(2),
              }}
            >
              {/* Country Picker */}
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <View style={{ flexDirection: isUrdu ? "row-reverse" : "row", alignItems: "center" }}>
                  <Text
                    style={{
                      fontSize: responsiveFontSize(2.5),
                      fontFamily: FONTS.regular,
                    }}
                  >
                    {selectedCountry.flag}
                  </Text>
                  <Ionicons
                    name="caret-down"
                    size={responsiveFontSize(2.2)}
                    color={COLORS.primary}
                    style={{ marginLeft: isUrdu ? 0 : 10, marginRight: isUrdu ? 10 : 0 }}
                  />
                </View>
              </TouchableOpacity>

              {/* Divider */}
              <View
                style={{
                  width: 1,
                  height: "60%",
                  backgroundColor: COLORS.num,
                  marginHorizontal: responsiveWidth(2),
                }}
              />

              {/* Code */}
              <Text
                style={{
                  color: COLORS.primary,
                  fontSize: responsiveFontSize(2),
                  fontFamily: FONTS.semiBold,
                  lineHeight: responsiveFontSize(2.5),
                  includeFontPadding: false,
                  textAlignVertical: "center",
                }}
              >
                {"\u200E"}
                {selectedCountry.code}
              </Text>

              {/* Input */}
              <TextInput
                style={{
                  flex: 1,
                  fontSize: responsiveFontSize(2),
                  color: isPhoneComplete ? COLORS.primary : COLORS.black,
                  marginLeft: isUrdu ? 0 : responsiveWidth(1),
                  marginRight: isUrdu ? responsiveWidth(1) : 0,
                  fontFamily: FONTS.semiBold,
                  includeFontPadding: false,
                  textAlignVertical: "center",
                  paddingVertical: 0,
                  textAlign: "left",
                  writingDirection: "ltr",
                  lineHeight: responsiveFontSize(4),
                }}
                placeholder={t("phone_placeholder")}
                placeholderTextColor={COLORS.num}
                keyboardType="number-pad"
                value={phone}
                onChangeText={handlePhoneChange}
                maxLength={10}
              />
            </View>
          </View>

          {/* BOTTOM SECTION */}
          <View style={{ alignItems: "center" }}>
            {/* Privacy */}
            <TouchableOpacity onPress={() => setPrivacyModalVisible(true)}>
              <Text
                style={{
                  color: "#adb5bd",
                  textDecorationLine: "underline",
                  fontFamily: FONTS.regular,
                  marginBottom: responsiveHeight(2),
                }}
              >
                {t("privacy_policy")}
              </Text>
            </TouchableOpacity>

            {/* Button */}
            <TouchableOpacity
              disabled={!isPhoneComplete || loading}
              onPress={handleSendOTP}
              style={{ opacity: isPhoneComplete && !loading ? 1 : 0.4 }}
            >
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={{
                  width: responsiveWidth(85),
                  height: responsiveHeight(7),
                  borderRadius: responsiveWidth(10),
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {loading ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <Ionicons
                    name="checkmark-sharp"
                    size={responsiveFontSize(4)}
                    color={COLORS.white}
                  />
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* MODAL */}
        <Modal visible={modalVisible} transparent animationType="fade">
          <TouchableOpacity
            activeOpacity={1}
            onPress={() => setModalVisible(false)}
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              activeOpacity={1}
              style={{
                backgroundColor: COLORS.white,
                width: responsiveWidth(85),
                borderRadius: responsiveWidth(4),
                maxHeight: responsiveHeight(50),
                overflow: "hidden",
              }}
            >
              <FlatList
                data={countries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: responsiveWidth(4),
                      borderBottomWidth: 0.5,
                      borderColor: "#F3F4F6",
                    }}
                    onPress={() => {
                      setSelectedCountry(item);
                      setModalVisible(false);
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        flex: 1,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: responsiveFontSize(2.5),
                          marginRight:
                            i18n.language === "ur" ? 0 : responsiveWidth(3),
                          marginLeft:
                            i18n.language === "ur" ? responsiveWidth(3) : 0,
                        }}
                      >
                        {item.flag}
                      </Text>
                      <Text
                        style={{
                          fontSize: responsiveFontSize(1.8),
                          fontFamily: FONTS.medium,
                          textAlign: i18n.language === "ur" ? "right" : "left",
                        }}
                      >
                        {t(item.name.toLowerCase())}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: responsiveFontSize(1.8),
                        fontFamily: FONTS.semiBold,
                        color: COLORS.primary,
                        marginLeft: i18n.language === "ur" ? 0 : 10,
                        marginRight: i18n.language === "ur" ? 10 : 0,
                      }}
                    >
                      {"\u200E"}
                      {item.code}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </TouchableOpacity>
          </TouchableOpacity>
        </Modal>

        {/* PRIVACY POLICY MODAL */}
        <Modal visible={privacyModalVisible} transparent animationType="fade">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              padding: responsiveWidth(5),
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.white,
                width: "100%",
                borderRadius: responsiveWidth(4),
                padding: responsiveWidth(5),
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: FONTS.semiBold,
                  color: COLORS.black,
                  marginBottom: responsiveHeight(2),
                  textAlign: i18n.language === "ur" ? "right" : "left",
                }}
              >
                {t("privacy_policy")}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.8),
                  fontFamily: FONTS.regular,
                  color: COLORS.black,
                  lineHeight: responsiveHeight(3),
                  textAlign: i18n.language === "ur" ? "right" : "left",
                  marginBottom: responsiveHeight(3),
                }}
              >
                {t("privacy_policy_content")}
              </Text>

              <TouchableOpacity
                onPress={() => setPrivacyModalVisible(false)}
                style={{ alignSelf: "flex-end" }}
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    paddingHorizontal: responsiveWidth(6),
                    paddingVertical: responsiveHeight(1.2),
                    borderRadius: responsiveWidth(2),
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      color: COLORS.white,
                      fontFamily: FONTS.semiBold,
                      fontSize: responsiveFontSize(1.8),
                    }}
                  >
                    {t("cancel_btn") || t("cancel") || "Close"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </KeyboardAvoidingView>
      <ModernAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        isUrdu={isUrdu}
        okText={t("ok_btn") || "OK"}
        onOk={() => setAlertConfig({ ...alertConfig, visible: false })}
      />
    </SafeAreaView>
  );
};

export default LoginScreen;
