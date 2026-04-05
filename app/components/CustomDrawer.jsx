import React from "react";
import { View, Text, TouchableOpacity, Alert } from "react-native";
import {
  DrawerContentScrollView,
  useDrawerStatus,
} from "@react-navigation/drawer";
import { COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";
import { I18nManager } from "react-native";
import { FONTS } from "../constants/theme";

const drawerItems = [
  { label: "Home", icon: "home-outline", route: "Home" },
  { label: "Booking", icon: "calendar-outline", route: "Booking" },
  { label: "Contact Us", icon: "call-outline", route: "ContactUs" },
  {
    label: "Notifications",
    icon: "notifications-outline",
    badge: 4,
    route: "Notifications",
  },
  { label: "Settings", icon: "settings-outline", route: "Settings" },
];

const CustomDrawer = (props) => {
  const { state, navigation } = props;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ur";

  const toggleLanguage = () => {
    const newLang = i18n.language === "en" ? "ur" : "en";
    i18n.changeLanguage(newLang);
    const isRtl = newLang === "ur";

    if (isRtl !== I18nManager.isRTL) {
      I18nManager.allowRTL(isRtl);
      I18nManager.forceRTL(isRtl);
    }
    // Close the drawer automatically
    navigation.closeDrawer();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ paddingTop: 0 }}
        >
          {/* Profile Section */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: responsiveWidth(4),
              paddingVertical: responsiveHeight(2),
              borderBottomWidth: 1,
              borderColor: "#eee",
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: responsiveWidth(12),
                height: responsiveWidth(12),
                borderRadius: responsiveWidth(6),
                backgroundColor: "#E0E0E0",
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: responsiveWidth(3),
              }}
            >
              <Ionicons
                name="person"
                size={responsiveFontSize(3)}
                color="#777"
              />
            </View>

            {/* Name + Rating */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.black,
                  fontFamily: FONTS.semiBold,
                  includeFontPadding: false,
                }}
              >
                {t("user")}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: responsiveHeight(0.5),
                }}
              >
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Ionicons name="star-half" size={14} color={COLORS.secondary} />
                <Text
                  style={{
                    marginHorizontal: responsiveWidth(1.5),
                    fontSize: responsiveFontSize(1.5),
                    color: "#777",
                    fontFamily: FONTS.medium,
                    includeFontPadding: false,
                  }}
                >
                  4.8 (4)
                </Text>
              </View>
            </View>

            {/* Close Drawer */}
            <TouchableOpacity
              onPress={() => navigation.closeDrawer()}
              style={{ marginRight: responsiveWidth(3) }}
            >
              <Ionicons
                name={isRTL ? "chevron-back" : "chevron-forward"}
                size={responsiveFontSize(3)}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Drawer Items */}
          <View style={{ marginTop: responsiveHeight(2) }}>
            {drawerItems.map((item, index) => {
              const isActive = state.index === index; // active screen
              return (
                <TouchableOpacity
                  key={index}
                  onPress={() => navigation.navigate(item.route)}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    paddingVertical: responsiveHeight(1.5),
                    paddingHorizontal: responsiveWidth(5),
                    backgroundColor: isActive ? COLORS.active : "transparent",
                    borderRadius: responsiveWidth(3),
                    marginHorizontal: responsiveWidth(2),
                    marginVertical: responsiveHeight(0.5),
                  }}
                >
                  <Ionicons
                    name={item.icon}
                    size={responsiveFontSize(2.2)}
                    color={COLORS.black}
                  />
                  <Text
                    style={{
                      fontSize: responsiveFontSize(1.7),
                      marginHorizontal: responsiveWidth(5),
                      flex: 1,
                      color: COLORS.black,
                      fontFamily: FONTS.medium,
                      includeFontPadding: false,
                    }}
                  >
                    {t(item.label.toLowerCase().replace(" ", "_"))}
                  </Text>
                  {item.badge && (
                    <View
                      style={{
                        backgroundColor: "red",
                        borderRadius: responsiveWidth(3),
                        paddingHorizontal: responsiveWidth(2),
                        paddingVertical: responsiveHeight(0.4),
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: responsiveFontSize(1.3),
                          fontFamily: FONTS.medium,
                          includeFontPadding: false,
                        }}
                      >
                        {item.badge}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </DrawerContentScrollView>

        {/* Bottom Section */}
        <View
          style={{
            padding: responsiveWidth(5),
            borderTopWidth: 1,
            borderColor: "#E0E0E0",
          }}
        >
          {/* Sleek Language Toggle UI */}
          <TouchableOpacity
            onPress={toggleLanguage}
            activeOpacity={0.7}
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: "#F3F4F6",
              borderWidth: 1,
              borderColor: "#E5E7EB",
              borderRadius: responsiveHeight(1.5),
              paddingVertical: responsiveHeight(1.5),
              marginBottom: responsiveHeight(1.5),
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.05,
              shadowRadius: 3,
              elevation: 2,
            }}
          >
            <Ionicons
              name="globe-outline"
              size={responsiveFontSize(2.2)}
              color={COLORS.primary}
            />
            <View style={{ width: 8 }} />
            <Text
              style={{
                fontSize: responsiveFontSize(1.8),
                color: COLORS.primary,
                fontFamily: "System",
                fontFamily: FONTS.semiBold,
                includeFontPadding: false,
              }}
            >
              {i18n.language === "en" ? "اردو" : "English"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                alignItems: "center",
                borderRadius: responsiveHeight(1.5),
                marginBottom: responsiveHeight(1.5),
                paddingVertical: responsiveHeight(1.5),
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  fontFamily: FONTS.semiBold,
                  includeFontPadding: false,
                }}
              >
                {t("logout")}
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TouchableOpacity style={{ marginHorizontal: responsiveWidth(3) }}>
              <Ionicons
                name="logo-facebook"
                size={responsiveFontSize(3)}
                color="#3b5998"
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginHorizontal: responsiveWidth(3) }}>
              <Ionicons
                name="logo-instagram"
                size={responsiveFontSize(3)}
                color="#C13584"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawer;
