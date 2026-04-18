import React, { useMemo, useRef, useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import MapComponent from "../components/MapComponent";
import { SafeAreaView } from "react-native-safe-area-context";
import BottomSheet from "@gorhom/bottom-sheet";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import RidesSlider from "../components/RidesSlider";
import { LinearGradient } from "expo-linear-gradient";
import BackBtn from "../components/BackBtn";
import { useTranslation } from "react-i18next";
import { rides } from "../data/data";

const ConfirmRide = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();
  const bottomSheetRef = useRef(null);
  const snapPoints = useMemo(() => ["55%", "56%", "56%"], []);
  const [selectedService, setSelectedService] = useState("bike");
  const selectedRide = rides.find((r) => r.id === selectedService);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      {/* MAIN CONTENT */}
      <View style={{ flex: 1 }}>
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
            Ride Details
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

        {/* MAP */}
        <View
          style={{
            height: responsiveHeight(60),
            marginBottom: responsiveHeight(0.5),
          }}
        >
          <MapComponent />
        </View>
      </View>

      {/* CONFIRM BUTTON STICKED TO BOTTOM */}
      <View
        style={{
          position: "absolute",
          bottom: responsiveHeight(6),
          left: responsiveWidth(4),
          right: responsiveWidth(4),
          zIndex: 5,
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() =>
            navigation.navigate("SearchingDirection", {
              rideImage: selectedRide?.image,
            })
          }
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: "100%",
              paddingVertical: responsiveHeight(2), // responsive height
              borderRadius: responsiveHeight(3), // proportional radius
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: COLORS.white,
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(2),
              }}
            >
              {t("confirm_ride")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

      {/* BOTTOM SHEET ABOVE BUTTON */}
      <BottomSheet
        ref={bottomSheetRef}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose={false}
        animateOnMount={true}
        enableDynamicSizing={false}
        enableContentPanningGesture={true}
        handleIndicatorStyle={{
          width: 60,
          height: 5,
          backgroundColor: "#E0E0E0",
        }}
        style={{
          zIndex: 10, // ensures sheet is above button
        }}
      >
        <RidesSlider
          selectedService={selectedService}
          setSelectedService={setSelectedService}
          onClose={() => bottomSheetRef.current?.snapToIndex(0)}
        />
      </BottomSheet>
    </SafeAreaView>
  );
};

export default ConfirmRide;
