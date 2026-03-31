import React, { useEffect, useRef, useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import { COLORS, SIZES } from "../constants";
import { LinearGradient } from "expo-linear-gradient";
import { FONTS } from "../constants/theme";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";

const VerifyCodeScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { phoneNumber } = route.params || {};

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ur" : "en";
    i18n.changeLanguage(newLang);
    if (newLang === "ur" && !I18nManager.isRTL) {
      I18nManager.forceRTL(true);
    } else if (newLang === "en" && I18nManager.isRTL) {
      I18nManager.forceRTL(false);
    }
  };

  const [timer, setTimer] = useState(30);
  const [code, setCode] = useState(["", "", "", ""]);

  const inputs = useRef([]);

  const isCodeComplete = code.every((digit) => digit !== "");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (text, index) => {
    const newCode = [...code];
    newCode[index] = text;
    setCode(newCode);

    if (text && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleBackspace = (text, index) => {
    if (!text && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleContinue = () => {
    if (!isCodeComplete) return;

    const finalCode = code.join("");
    console.log("OTP Entered:", finalCode);

    navigation.navigate("MainDrawer");
  };

  const progress = (timer / 30) * 360;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Sleek Language Toggle UI (Right Corner) */}
      <View style={{ width: "100%", alignItems: "flex-end", paddingHorizontal: responsiveWidth(5), paddingTop: responsiveHeight(1) }}>
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
          <Ionicons name="globe-outline" size={14} color={COLORS.primary} style={{ marginRight: 6 }} />
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
          paddingHorizontal: SIZES.base,
          justifyContent: "space-between", // ✅ FIXED
          alignItems: "center",
          paddingVertical: responsiveHeight(3),
        }}
      >
        {/* TOP CONTENT */}
        <View style={{ alignItems: "center", width: "100%" }}>

          {/* Instruction Text */}
          <View
            style={{
              marginTop: responsiveHeight(3),
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                textAlign: "center",
                fontFamily: FONTS.regular,
              }}
            >
              {t("verify_desc_1")}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                textAlign: "center",
                fontFamily: FONTS.regular,
              }}
            >
              {t("verify_desc_2")}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                color: COLORS.primary,
                fontFamily: FONTS.semiBold,
                marginTop: responsiveHeight(1),
              }}
            >
              {phoneNumber}
            </Text>
          </View>

          {/* Timer */}
          <View
            style={{
              marginTop: responsiveHeight(5),
              width: responsiveWidth(35),
              height: responsiveWidth(35),
              borderRadius: responsiveWidth(35) / 2,
              borderWidth: 6,
              borderColor: COLORS.primary,
              justifyContent: "center",
              alignItems: "center",
              transform: [{ rotate: `${progress}deg` }],
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(4),
                fontFamily: FONTS.semiBold,
                transform: [{ rotate: `-${progress}deg` }],
              }}
            >
              {timer}
            </Text>
          </View>

          {/* OTP Inputs */}
          <View
            style={{
              flexDirection: "row",
              marginTop: responsiveHeight(5),
              justifyContent: "space-between",
              width: responsiveWidth(70),
            }}
          >
            {code.map((digit, index) => (
              <TextInput
                key={index}
                ref={(ref) => (inputs.current[index] = ref)}
                style={{
                  width: responsiveWidth(15),
                  height: responsiveHeight(7),
                  borderRadius: responsiveWidth(3),
                  borderWidth: 1.5,
                  borderColor: isCodeComplete ? COLORS.primary : "#ccc",
                  textAlign: "center",
                  fontSize: responsiveFontSize(3),
                  lineHeight: responsiveFontSize(3),
                  padding: 0,
                  color: isCodeComplete ? COLORS.primary : COLORS.black,
                  fontFamily: FONTS.regular,
                  includeFontPadding: false,
                }}
                keyboardType="number-pad"
                maxLength={1}
                value={digit}
                onChangeText={(text) => handleChange(text, index)}
                onKeyPress={({ nativeEvent }) =>
                  nativeEvent.key === "Backspace" &&
                  handleBackspace(digit, index)
                }
              />
            ))}
          </View>
        </View>

        {/* BOTTOM BUTTON */}
        <View style={{ alignItems: "center", width: "100%" }}>
          <TouchableOpacity
            onPress={handleContinue}
            disabled={!isCodeComplete}
            style={{
              opacity: isCodeComplete ? 1 : 0.4,
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: responsiveWidth(85),
                height: responsiveHeight(7), // ✅ consistent with login
                borderRadius: responsiveWidth(10),
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: FONTS.semiBold,
                }}
              >
                {t("continue_btn")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default VerifyCodeScreen;
