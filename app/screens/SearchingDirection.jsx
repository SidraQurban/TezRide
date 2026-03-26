import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Easing,
  Image,
  Modal,
} from "react-native";
import React, { useRef, useMemo, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import { WebView } from "react-native-webview";
import { SafeAreaView } from "react-native-safe-area-context";
import ArrivingCard from "../components/ArrivingCard";
import BottomSheet from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";

const SearchingDirection = () => {
  const navigation = useNavigation();
  const bottomSheetRef = useRef(null);

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const snapPoints = useMemo(() => ["10%", "20%", "55%"], []);

  //modal state
  const [showCancelModal, setShowCancelModal] = useState(false);

  //show modal on cancel button press
  const handleCancelRide = () => {
    setShowCancelModal(true);
  };

  //confirm cancel
  const confirmCancelRide = () => {
    setShowCancelModal(false);
    navigation.navigate("Search");
  };

  useEffect(() => {
    Animated.loop(
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 1500,
        easing: Easing.out(Easing.ease),
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1, paddingBottom: responsiveHeight(2) }}>
        {/* HEADER */}
        <View
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
        </View>

        {/* MAP + OVERLAY */}
        <View style={{ flex: 1 }}>
          <WebView
            source={{
              html: `
                <iframe
                  src="https://maps.google.com/maps?q=25.198152585089883,66.45617498089926&z=12&output=embed"
                  width="100%"
                  height="100%"
                  style="border:0;"
                ></iframe>
              `,
            }}
            style={{ flex: 1 }}
          />

          <View
            style={{
              position: "absolute",
              top: responsiveHeight(40),
              left: responsiveWidth(45),
              transform: [{ translateX: -80 }, { translateY: -80 }],
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* CANCEL BUTTON */}
            <TouchableOpacity
              onPress={handleCancelRide}
              style={{
                position: "absolute",
                top: responsiveHeight(1),
                right: responsiveWidth(1),
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
                source={require("../../assets/auto.png")}
                style={{
                  width: responsiveWidth(26),
                  height: responsiveHeight(26),
                  resizeMode: "contain",
                }}
              />
            </View>

            {/* TEXT */}
            <Text
              style={{
                marginTop: responsiveHeight(1),
                fontSize: responsiveFontSize(2),
                fontFamily: FONTS.semiBold,
              }}
            >
              Finding nearby drivers...
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                fontFamily: FONTS.medium,
              }}
            >
              Your ride will arrive shortly
            </Text>
          </View>
        </View>

        {/* BOTTOM SHEET */}
        <BottomSheet
          ref={bottomSheetRef}
          index={0}
          snapPoints={snapPoints}
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
                Thinking of cancelling your ride?
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.8),
                  fontFamily: FONTS.regular,
                  textAlign: "left",
                  marginBottom: responsiveHeight(3),
                }}
              >
                Your driver is on the way to pick you up. Cancelling now could
                cause delays
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
                    No
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
                      Yes, Cancel
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

export default SearchingDirection;
