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
import { AntDesign } from "@expo/vector-icons";
import data from "../data/onboardingdata";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

const OnboardingScreen = () => {
  const navigation = useNavigation();
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
      Animated: true,
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
      animate: true,
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
        {/* Back Button */}
        <TouchableOpacity
          style={{ padding: SIZES.base }}
          onPress={handleBackButton}
        >
          {/* hiding back btn on 1st screen  */}
          <AntDesign
            name="left"
            style={{
              fontSize: responsiveFontSize(2.5),
              color: COLORS.primary,
              opacity: currentPage == 0 ? 0 : 1,
            }}
          />
        </TouchableOpacity>

        {/* Skip Button */}
        {/* hiding skip btn on lasst screen */}
        <TouchableOpacity onPress={handleskipbutton}>
          <View
            style={{
              width: responsiveWidth(15),
              height: responsiveWidth(9),
              borderWidth: 1,
              borderRadius: responsiveWidth(2),
              borderColor: COLORS.primary,
              justifyContent: "center",
              alignItems: "center",
              opacity: currentPage == data.length - 1 ? 0 : 1,
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2),
                color: "#adb5bd",
              }}
            >
              Skip
            </Text>
          </View>
        </TouchableOpacity>
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
                name="right"
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  opacity: 0.3,
                }}
              />

              <AntDesign
                name="right"
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
                  fontSize: responsiveFontSize(2.2),
                  marginLeft: SIZES.base,
                }}
              >
                Get Started
              </Text>

              <AntDesign
                name="right"
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.white,
                  opacity: 0.3,
                  marginLeft: SIZES.base,
                }}
              />

              <AntDesign
                name="right"
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
            marginTop: responsiveHeight(-5),
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
            fontSize: responsiveFontSize(3.5),
            textAlign: "center",
            fontWeight: "bold",
            marginTop: responsiveHeight(-5),
          }}
        >
          {item.title}
        </Text>
        <Text
          style={{
            fontSize: responsiveFontSize(2.2),
            opacity: 0.4,
            textAlign: "center",
            marginTop: responsiveHeight(1.5),
            lineHeight: responsiveHeight(3.2),
          }}
        >
          {item.description}
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
