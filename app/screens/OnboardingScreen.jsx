import {
  View,
  Text,
  TouchableOpacity,
  ImageBackground,
  FlatList,
  Animated,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { COLORS, SIZES } from "../constants/index";
import { SafeAreaView } from "react-native-safe-area-context";
import { AntDesign, Ionicons } from "@expo/vector-icons";
import data from "../data/data";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { FONTS } from "../constants/theme";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";

const OnboardingScreen = () => {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const isRtl = i18n.language.startsWith("ur");

  const toggleLanguage = () => {
    const newLang = i18n.language?.startsWith("ur") ? "en" : "ur";
    i18n.changeLanguage(newLang);
    if (newLang === "ur" && !I18nManager.isRTL) {
      I18nManager.forceRTL(true);
      I18nManager.allowRTL(true);
    } else if (newLang === "en" && I18nManager.isRTL) {
      I18nManager.forceRTL(false);
      I18nManager.allowRTL(false);
    }
  };
  const flatlistRef = useRef();
  const [currentPage, setCurrentPage] = useState(0);
  const [viewableItems, setViewableItems] = useState([]);

  const viewConfigRef = useRef({ viewAreaCoveragePercentThreshold: 50 }); // memoized config

  const handleViewableItemsChanged = useRef(({ viewableItems }) => {
    setViewableItems(viewableItems);
  });

  useEffect(() => {
    if (!viewableItems[0] || currentPage === viewableItems[0].index) return;
    setCurrentPage(viewableItems[0].index);
  }, [viewableItems]);

  const handleNext = () => {
    if (currentPage == data.length - 1) return;
    flatlistRef.current.scrollToIndex({
      animated: true,
      index: currentPage + 1,
    });
  };
  const handleBackButton = () => {
    if (currentPage == 0) return;
    flatlistRef.current.scrollToIndex({
      animated: true,
      index: currentPage - 1,
    });
  };
  const handleskipbutton = () => {
    flatlistRef.current.scrollToIndex({
      animated: true,
      index: data.length - 1,
    });
  };
  const renderTopSection = () => (
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: SIZES.base * 2,
        }}
      >
        <View
          style={{ flexDirection: "row", alignItems: "center", marginLeft: -5 }}
        >
          {/* Sleek Language Toggle */}
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
              size={18}
              color={COLORS.primary}
              style={isRtl ? { marginLeft: 6 } : { marginRight: 6 }}
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

        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {/* Skip Button */}
          {/* hiding skip btn on lasst screen */}
          <TouchableOpacity onPress={handleskipbutton}>
            <View
              style={{
                // minWidth: responsiveWidth(18),
                paddingHorizontal: responsiveWidth(5),
                paddingVertical: responsiveHeight(1),
                backgroundColor: "rgba(255, 92, 0, 0.1)",
                borderRadius: responsiveWidth(5),
                justifyContent: "center",
                alignItems: "center",
                opacity: currentPage == data.length - 1 ? 0 : 1,
              }}
            >
              <Text
                numberOfLines={1}
                style={{
                  fontSize: responsiveFontSize(1.8),
                  color: COLORS.primary,
                  fontFamily: FONTS.semiBold,
                  textAlign: "center",
                  paddingHorizontal: 2,
                }}
              >
                {t("skip")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );

  const renderBottomSection = () => (
    <SafeAreaView>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: SIZES.base * 2,
          paddingVertical: SIZES.base * 2,
        }}
      >
        {/* Pagination dots */}
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          {data.map((_, index) => (
            <View
              key={index}
              style={{
                width: responsiveWidth(2.2),
                height: responsiveWidth(2.2),
                borderRadius: responsiveWidth(1.2),
                backgroundColor:
                  currentPage == index ? COLORS.primary : COLORS.primary + "20",
                marginRight: 8,
              }}
            />
          ))}
        </View>

        {/* Next Button */}
        {/* show or hide nect button & getstartedbtn by screen */}
        {currentPage != data.length - 1 ? (
          <TouchableOpacity
            onPress={handleNext}
            activeOpacity={0.8}
            style={{
              borderRadius: responsiveWidth(7.5),
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                width: responsiveWidth(15),
                height: responsiveWidth(15),
                borderRadius: responsiveWidth(7.5),
              }}
            >
              <AntDesign
                name={isRtl ? "left" : "right"}
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  opacity: 0.3,
                }}
              />

              <AntDesign
                name={isRtl ? "left" : "right"}
                style={{
                  fontSize: responsiveFontSize(2.9),
                  color: COLORS.white,
                  marginLeft: -12, // slightly cleaner spacing
                }}
              />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          // Get Started

          <TouchableOpacity
            onPress={() => navigation.navigate("login")}
            style={{
              borderRadius: responsiveWidth(7),
            }}
          >
            <LinearGradient
              colors={["#FF5C00", "#ff991c"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                paddingHorizontal: SIZES.base * 2,
                height: responsiveWidth(14),
                borderRadius: responsiveWidth(7),
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(2),
                  marginLeft: SIZES.base,
                  fontFamily: FONTS.medium,
                }}
              >
                {t("get_started")}
              </Text>

              <AntDesign
                name={isRtl ? "left" : "right"}
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  opacity: 0.3,
                  marginLeft: SIZES.base,
                }}
              />

              <AntDesign
                name={isRtl ? "left" : "right"}
                style={{
                  fontSize: responsiveFontSize(2.9),
                  color: COLORS.white,
                  marginLeft: -15,
                }}
              />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );

  const renderFlatlistItem = ({ item }) => (
    <View
      style={{
        width: SIZES.width,
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <View style={{ alignItems: "center", marginVertical: SIZES.base * 2 }}>
        <ImageBackground
          source={item.img}
          resizeMode="contain"
          style={{
            width: responsiveWidth(90),
            height: responsiveHeight(40),
            marginTop: responsiveHeight(-1),
          }}
        />
      </View>
      <View
        style={{
          paddingHorizontal: SIZES.base * 4,
          marginVertical: SIZES.base * 4,
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(3),
            textAlign: "center",
            fontFamily: FONTS.semiBold,
            marginTop: responsiveHeight(-3),
            lineHeight: responsiveHeight(4.5),
          }}
        >
          {t(item.title)}
        </Text>
        <Text
          style={{
            fontSize: responsiveFontSize(2),
            opacity: 0.4,
            textAlign: "center",
            marginTop: responsiveHeight(1.5),
            lineHeight: responsiveHeight(3.2),
            fontFamily: FONTS.regular,
          }}
        >
          {t(item.description)}
        </Text>
      </View>
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        justifyContent: "center",
      }}
    >
      {renderTopSection()}

      <FlatList
        key={isRtl ? "ur-list" : "en-list"}
        data={data}
        pagingEnabled
        horizontal
        showsHorizontalScrollIndicator={false}
        keyExtractor={(item) => item._id}
        renderItem={renderFlatlistItem}
        ref={flatlistRef}
        onViewableItemsChanged={handleViewableItemsChanged.current}
        viewabilityConfig={viewConfigRef.current}
        initialNumToRender={1}
        extraData={SIZES.width}
      />

      {renderBottomSection()}
    </View>
  );
};

export default OnboardingScreen;
