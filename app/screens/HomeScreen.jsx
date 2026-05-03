import React from "react";
import { View, ScrollView, Image, Text, AppState } from "react-native";
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
import * as ExpoLocation from "expo-location";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
} from "react-native-reanimated";
import { FONTS } from "../constants/theme";


const HomeScreen = ({ navigation, route }) => {
  const { t, i18n } = useTranslation();
  const [locationModalVisible, setLocationModalVisible] = React.useState(false);
  const dismissedManuallyRef = React.useRef(false);
  const appState = React.useRef(AppState.currentState);


  // Show modal if permission is missing OR device GPS is turned off
  const checkLocationStatus = React.useCallback(async () => {
    try {
      const { status } = await ExpoLocation.getForegroundPermissionsAsync();
      const isGpsEnabled = await ExpoLocation.hasServicesEnabledAsync();

      if ((status !== "granted" || !isGpsEnabled) && !dismissedManuallyRef.current) {
        setLocationModalVisible(true);
      } else {
        setLocationModalVisible(false);
      }
    } catch (e) {
      if (!dismissedManuallyRef.current) setLocationModalVisible(true);
    }
  }, []);

  // On mount: check location
  React.useEffect(() => {
    checkLocationStatus();
  }, []);

  // Re-check when user returns from Settings
  React.useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        checkLocationStatus();
      }
      appState.current = nextAppState;
    });
    return () => subscription.remove();
  }, [checkLocationStatus]);

  const translateX = useSharedValue(0);
  const isUrdu = i18n.language?.startsWith("ur");

  React.useEffect(() => {
    // Reset translation
    translateX.value = 0;

    // Animate opposite sides for UR/EN (Subtle floating effect)
    translateX.value = withRepeat(
      withSequence(
        withTiming(isUrdu ? responsiveWidth(6) : -responsiveWidth(6), {
          duration: 2500,
        }),
        withTiming(0, { duration: 2500 }),
      ),
      -1,
      true,
    );
  }, [i18n.language]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <AppHeader />

      <ScrollView
        contentContainerStyle={{ paddingBottom: responsiveHeight(5) }}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner Section */}
        <View
          style={{
            height: responsiveHeight(25),
            backgroundColor: COLORS.backgroundimg,
            justifyContent: "center",
            overflow: "hidden",
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
              alignItems: "flex-start", // Flex-start is Right in RTL, Left in LTR
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(4.2),
                fontFamily: FONTS.bold,
                color: COLORS.white,
                textAlign: isUrdu ? "right" : "left",
                includeFontPadding: false,
              }}
            >
              {t("tez_ride")}
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2.2),
                fontFamily: FONTS.medium,
                color: COLORS.white,
                opacity: 0.8,
                textAlign: isUrdu ? "right" : "left",
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
                bottom: responsiveHeight(3),
                // Native direction-aware positioning (end is Left in RTL, Right in LTR)
                end: responsiveWidth(2),
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
        <LocationModal
          visible={locationModalVisible}
          onClose={() => {
            setLocationModalVisible(false);
            dismissedManuallyRef.current = true;
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
};

export default HomeScreen;
