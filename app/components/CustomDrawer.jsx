import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, Alert, Image } from "react-native";
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
import authService from "../api/authService";
import storage from "../utils/storage";

const drawerItems = [
  { label: "Home", icon: "home-outline", route: "Home" },
  { label: "Wallet", icon: "wallet-outline", route: "Wallet" },
  { label: "Your Rides", icon: "car-outline", route: "RideHistory" },
  { label: "Profile", icon: "person-circle-outline", route: "Profile" },
  { label: "Settings", icon: "settings-outline", route: "Settings" },
  { label: "Contact Us", icon: "call-outline", route: "ContactUs" },
];

const CustomDrawer = (props) => {
  const { state, navigation } = props;
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === "ur";

  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState("");

  // Load name & avatar from local storage each time drawer mounts
  useEffect(() => {
    const loadProfile = async () => {
      const name = await storage.getItem("customerName");
      const pic  = await storage.getItem("profilePictureUrl");
      if (name) setUserName(name);
      if (pic)  setProfilePic(pic);
    };
    loadProfile();
  }, []);


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

  const handleLogout = () => {
    Alert.alert(
      t("logout"),
      t("logout_confirmation"),
      [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("yes"),
          onPress: async () => {
            await authService.logout();
            // The drawer's navigation is scoped inside DrawerNavigator.
            // We must use getParent() to reach the root NativeStack and
            // reset it to "login", preventing the user from navigating back.
            navigation.getParent()?.reset({
              index: 0,
              routes: [{ name: "login" }],
            });
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ paddingTop: 0 }}
        >
          {/* Profile Section */}
          <TouchableOpacity
            onPress={() => navigation.navigate("Profile")}
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
                width: responsiveWidth(13),
                height: responsiveWidth(13),
                borderRadius: responsiveWidth(6.5),
                backgroundColor: "#E8E8E8",
                justifyContent: "center",
                alignItems: "center",
                marginHorizontal: responsiveWidth(3),
                borderWidth: 2,
                borderColor: COLORS.primary,
                overflow: "hidden",
              }}
            >
              {profilePic ? (
                <Image
                  source={{ uri: profilePic }}
                  style={{
                    width: responsiveWidth(13),
                    height: responsiveWidth(13),
                    borderRadius: responsiveWidth(6.5),
                  }}
                />
              ) : (
                <Ionicons
                  name="person"
                  size={responsiveFontSize(3)}
                  color="#999"
                />
              )}
            </View>

            {/* Name + Phone hint */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  color: COLORS.black,
                  fontFamily: FONTS.semiBold,
                  includeFontPadding: false,
                }}
              >
                {userName || t("user", "User")}
              </Text>
              <Text
                style={{
                  fontSize: responsiveFontSize(1.4),
                  color: "#999",
                  fontFamily: FONTS.regular,
                  marginTop: 2,
                  includeFontPadding: false,
                }}
              >
                {t("view_profile", "View profile")}
              </Text>
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
          </TouchableOpacity>

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

          <TouchableOpacity onPress={handleLogout}>
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
