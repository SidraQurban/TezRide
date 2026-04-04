import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
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
import Svg, { Circle } from "react-native-svg";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  Easing,
  withRepeat,
  useAnimatedStyle,
} from "react-native-reanimated";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const VerifyCodeScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const { phoneNumber } = route.params || {};

  const toggleLanguage = () => {
    const newLang = i18n.language?.startsWith("ur") ? "en" : "ur";
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
  const progressValue = useSharedValue(1);
  const isCodeComplete = code.every((digit) => digit !== "");

  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    // Animate circular progress down as the timer decreases
    progressValue.value = withTiming(timer / 30, {
      duration: 1000,
      easing: Easing.linear,
    });

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

    navigation.navigate("MainDrawer", {
      screen: "Home",
      params: { showLocationModal: true },
    });
  };

  const circleSize = responsiveWidth(35);
  const strokeWidth = 8;
  const radius = (circleSize - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  const animatedCircleProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: circumference * (1 - progressValue.value),
    };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
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
              style={i18n.language === "ur" ? { marginLeft: 6 } : { marginRight: 6 }}
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
            paddingHorizontal: SIZES.base,
            justifyContent: "space-between",
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
                {"\u200E"}{phoneNumber}
              </Text>
            </View>

            {/* Timer with SVG Circular Progress */}
            <View
              style={{
                marginTop: responsiveHeight(5),
                alignItems: "center",
                justifyContent: "center",
                width: circleSize,
                height: circleSize,
              }}
            >
              {/* SVG Progress Circle */}
              <Svg
                width={circleSize}
                height={circleSize}
                style={{
                  position: "absolute",
                  transform: [{ rotate: "-90deg" }],
                }}
              >
                <Circle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke="#E5E7EB"
                  strokeWidth={strokeWidth}
                  fill="none"
                />
                <AnimatedCircle
                  cx={circleSize / 2}
                  cy={circleSize / 2}
                  r={radius}
                  stroke={COLORS.secondary}
                  strokeWidth={strokeWidth}
                  fill="transparent"
                  strokeDasharray={circumference}
                  animatedProps={animatedCircleProps}
                  strokeLinecap="round"
                />
              </Svg>

              {/* Timer Text inside */}
              <View
                style={{
                  width: circleSize - strokeWidth * 2,
                  height: circleSize - strokeWidth * 2,
                  borderRadius: (circleSize - strokeWidth * 2) / 2,
                  backgroundColor: COLORS.white,
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 2,
                }}
              >
                <Text
                  style={{
                    fontSize: responsiveFontSize(4),
                    fontFamily: FONTS.semiBold,
                    color: COLORS.black,
                  }}
                >
                  {timer}
                </Text>
              </View>
            </View>

            {/* OTP Inputs */}
            <View
              style={{
                flexDirection: "row",
                marginTop: responsiveHeight(5),
                justifyContent: "space-between",
                width: responsiveWidth(70),
                marginBottom: responsiveHeight(2),
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
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default VerifyCodeScreen;
