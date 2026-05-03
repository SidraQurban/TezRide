import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Modal,
} from "react-native";
import React, { useRef, useMemo, useEffect, useState, useCallback } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import MapComponent from "../components/MapComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrivingCard from "../components/ArrivingCard";
import BottomSheet from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import BackBtn from "../components/BackBtn";
import { useTranslation } from "react-i18next";

const SearchDriverScreen = ({ route }) => {
  const navigation = useNavigation();
  const { selectedGender, pickup } = route.params || {};
  const { t } = useTranslation();
  const bottomSheetRef = useRef(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const snapPoints = useMemo(() => ["10%", "20%", "55%"], []);

  //modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  //show modal on cancel button press
  const handleCancelRide = () => {
    setShowCancelModal(true);
  };

  // Cancel confirmed — go to Home and clear the stack
  const confirmCancelRide = useCallback(() => {
    setShowCancelModal(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "MainDrawer" }],
    });
  }, [navigation]);

  useEffect(() => {
    Animated.loop(
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ).start();
  }, []);

  const scale = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });

  const opacity = scaleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1, paddingBottom: responsiveHeight(2) }}>
        {/* HEADER */}
        {/* <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: responsiveWidth(4),
            marginTop: responsiveHeight(2),
            marginBottom: responsiveHeight(2),
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={25} color={COLORS.primary} />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: responsiveFontSize(2.2),
              fontFamily: FONTS.semiBold,
              marginLeft: responsiveWidth(4),
            }}
          >
            Searching Direction
          </Text>
        </View> */}
        <View
          style={{
            // position: "absolute",
            left: responsiveWidth(1.5),
            // zIndex: 10,
          }}
        >
          <BackBtn />
        </View>

        {/* MAP + OVERLAY */}
        <View style={{ flex: 1 }}>
          <MapComponent
            pickup={pickup}
            showMarkers={false}
            showPickupMarker={true}
            disablePolyline={true}
            animateZoomOut={true}
          />

          <View
            style={{
              position: "absolute",
              top: responsiveHeight(18),
              left: 0,
              right: 0,
              alignItems: "center",
              elevation: 1, // ensure webview stays under natively
            }}
          >
            {/* Inner Wrapper strictly to bound cancel button */}
            <View
              style={{
                position: "relative",
                width: 140,
                height: 140,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* CANCEL BUTTON */}
              <TouchableOpacity
                onPress={handleCancelRide}
                style={{
                  position: "absolute",
                  top: -5,
                  right: -5,
                  width: responsiveWidth(10),
                  height: responsiveWidth(10),
                  borderRadius: responsiveWidth(5),
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                  elevation: 5,
                  shadowColor: "#000",
                  shadowOpacity: 0.2,
                  shadowOffset: { width: 0, height: 2 },
                  shadowRadius: 4,
                  zIndex: 10,
                }}
              >
                <Ionicons name="close" size={20} color="red" />
              </TouchableOpacity>

              {/* PULSE */}
              <Animated.View
                style={{
                  position: "absolute",
                  width: 140,
                  height: 140,
                  borderRadius: 70,
                  backgroundColor: "orange",
                  opacity: opacity,
                  transform: [{ scale: scale }],
                }}
              />

              {/* STATIC CIRCLE */}
              <View
                style={{
                  width: 140,
                  height: 140,
                  borderRadius: 75,
                  borderWidth: 4,
                  borderColor: "orange",
                  alignItems: "center",
                  justifyContent: "center",
                  backgroundColor: "#fff",
                }}
              >
                <Image
                  source={
                    selectedGender === "female"
                      ? require("../../assets/femaledriver.png")
                      : require("../../assets/driver.png")
                  }
                  style={{
                    width: responsiveWidth(70),
                    height: responsiveHeight(70),
                    resizeMode: "contain",
                  }}
                />
              </View>
            </View>

            {/* TEXT */}
            {/* <Text
              style={{
                marginTop: responsiveHeight(2),
                fontSize: responsiveFontSize(2),
                fontFamily: FONTS.semiBold,
                color: COLORS.primary,
              }}
            >
              {t("connecting_driver")}
            </Text> */}
          </View>
        </View>

        {/* BOTTOM SHEET */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
          style={{ zIndex: 999, elevation: 999 }}
          enablePanDownToClose={false}
          animateOnMount={true}
          enableDynamicSizing={false}
          handleIndicatorStyle={{
            width: 60,
            height: 5,
            backgroundColor: "#E0E0E0",
          }}
        >
          <ArrivingCard
            onClose={() => bottomSheetRef.current?.snapToIndex(0)}
          />
        </BottomSheet>

        {/* CUSTOM CANCEL MODAL */}
        <Modal
          transparent
          animationType="fade"
          visible={showCancelModal}
          onRequestClose={() => setShowCancelModal(false)}
        >
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: responsiveWidth(5),
            }}
          >
            <View
              style={{
                width: "100%",
                backgroundColor: "#fff",
                borderRadius: 10,
                padding: responsiveWidth(5),
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2.2),
                  fontFamily: FONTS.semiBold,
                  marginBottom: responsiveHeight(2),
                }}
              >
                {t("cancel_drv_title")}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.8),
                  fontFamily: FONTS.regular,
                  textAlign: "left",
                  marginBottom: responsiveHeight(3),
                }}
              >
                {t("cancel_drv_msg")}
              </Text>

              {/* BUTTONS */}
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                  justifyContent: "space-between",
                }}
              >
                {/* NO BUTTON */}
                <TouchableOpacity
                  onPress={() => setShowCancelModal(false)}
                  style={{
                    flex: 1,
                    marginRight: 10,
                    borderRadius: 10,
                    paddingVertical: responsiveHeight(1.5),
                    backgroundColor: "#E0E0E0",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontFamily: FONTS.semiBold, color: "#000" }}>
                    {t("no_cancel")}
                  </Text>
                </TouchableOpacity>

                {/* YES BUTTON WITH LINEAR GRADIENT */}
                <TouchableOpacity
                  onPress={confirmCancelRide}
                  activeOpacity={0.8}
                  style={{
                    flex: 1,
                    marginLeft: 10,
                    borderRadius: 10,
                    overflow: "hidden",
                  }}
                >
                  <LinearGradient
                    colors={[COLORS.primary, COLORS.secondary]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                      paddingVertical: responsiveHeight(1.5),
                      borderRadius: 10,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text style={{ fontFamily: FONTS.semiBold, color: "#fff" }}>
                      {t("yes_cancel")}
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default SearchDriverScreen;
