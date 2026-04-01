import React from "react";
import { View, ScrollView, Image, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import AppHeader from "../components/AppHeader";
import Services from "../components/Services";
import SearchBar from "../components/SearchBar";
import LocationModal from "../components/LocationModal";
import { useTranslation } from "react-i18next";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { FONTS } from "../constants/theme";

const HomeScreen = () => {
  const { t, i18n } = useTranslation();
  const translateX = useSharedValue(0);

  React.useEffect(() => {
    translateX.value = withRepeat(
      withSequence(
        withTiming(15, { duration: 2500 }),
        withTiming(0, { duration: 2500 }),
      ),
      -1,
      true,
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* Fixed Header */}
      <AppHeader />

      {/* Scrollable content */}
      <ScrollView
        contentContainerStyle={{
          paddingBottom: responsiveHeight(5),
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <View
          style={{
            height: responsiveHeight(25),
            backgroundColor: COLORS.backgroundimg,
            justifyContent: "center",
            overflow: "hidden", // Keeps animation within banner bounds
          }}
        >
          {/* Background Banner Image */}
          <Image
            source={require("../../assets/banner1.png")}
            style={{
              width: responsiveWidth(95),
              height: responsiveHeight(25),
              resizeMode: "contain",
              alignSelf: "center",
              position: "absolute",
            }}
          />

          {/* Text Overlay */}
          <View
            style={{
              position: "absolute",
              top: responsiveHeight(5),
              width: responsiveWidth(85),
              alignSelf: "center",
              zIndex: 1,
              alignItems: i18n.language === "ur" ? "flex-start" : "flex-start",
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(3.5),
                fontFamily: FONTS.bold,
                color: COLORS.white,
                textAlign: i18n.language === "ur" ? "right" : "left",
                includeFontPadding: false,
              }}
            >
              {t("tez_ride")}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(1.9),
                fontFamily: FONTS.medium,
                color: COLORS.white,
                opacity: 0.8,
                textAlign: i18n.language === "ur" ? "right" : "left",
                includeFontPadding: false,
              }}
            >
              {t("home_tagline")}
            </Text>
          </View>

          {/* Animated Image (Floating Car) */}
          <Animated.Image
            source={require("../../assets/animationimg.png")}
            style={[
              {
                width: responsiveWidth(45),
                height: responsiveHeight(18),
                resizeMode: "contain",
                position: "absolute",
                right: responsiveWidth(5),
                bottom: responsiveHeight(3),
              },
              animatedStyle,
            ]}
          />
        </View>

        {/* Search Bar */}
        <View>
          <SearchBar />
        </View>

        {/* Services */}
        <View style={{ marginTop: responsiveHeight(2) }}>
          <Services />
        </View>

        {/* Location Modal */}
        <LocationModal />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
