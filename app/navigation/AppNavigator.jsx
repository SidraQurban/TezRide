import React, { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import VerifyCodeScreen from "../screens/VerifyCodeScreen";
import DrawerNavigator from "./DrawerNavigator";
import SearchScreen from "../screens/SearchScreen";
import LocationDetailsScreen from "../screens/LocationDetailsScreen";
import PromoScreen from "../screens/PromoScreen";
import SearchingDirection from "../screens/SearchingDirection";
import ConfirmRideScreen from "../screens/ConfirmRideScreen";
import DriverProfileScreen from "../screens/DriverProfileScreen";
import DeliveryScreen from "../screens/DeliveryScreen";
import ShopsScreen from "../screens/ShopsScreen";
import HireDriverScreen from "../screens/HireDriverScreen";
import SearchDriverScreen from "../screens/SearchDriverScreen";
import CargoScreen from "../screens/CargoScreen";
import WalletScreen from "../screens/WalletScreen";
import RideHistoryScreen from "../screens/RideHistoryScreen";
import Settings from "../screens/Settings";
import ContactUsScreen from "../screens/ContactUsScreen";
import ProfileScreen from "../screens/ProfileScreen";

import authService from "../api/authService";
import { COLORS } from "../constants";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ur");

  // Determine the correct initial route based on stored token
  const [initialRoute, setInitialRoute] = useState(null); // null = loading

  useEffect(() => {
    (async () => {
      try {
        const authenticated = await authService.ensureValidToken();
        setInitialRoute(authenticated ? "MainDrawer" : "Onboarding");
      } catch (error) {
        console.warn('[AppNavigator] Startup session recovery failed:', error);
        setInitialRoute("Onboarding");
      }
    })();
  }, []);

  // Show a neutral splash while we check storage
  if (initialRoute === null) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: COLORS.background,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: false,
          contentStyle: { direction: isRtl ? "rtl" : "ltr" },
        }}
      >
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
        <Stack.Screen
          name="MainDrawer"
          component={DrawerNavigator}
          options={{ contentStyle: { direction: "ltr" } }}
        />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen name="Delivery" component={DeliveryScreen} />
        <Stack.Screen name="HireDriver" component={HireDriverScreen} />
        <Stack.Screen name="Shops" component={ShopsScreen} />
        <Stack.Screen name="Cargo" component={CargoScreen} />
        <Stack.Screen name="LocationDetails" component={LocationDetailsScreen} />
        <Stack.Screen name="Promo" component={PromoScreen} />
        <Stack.Screen name="ConfirmRide" component={ConfirmRideScreen} />
        <Stack.Screen name="SearchingDirection" component={SearchingDirection} />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="SearchDriver" component={SearchDriverScreen} />
        <Stack.Screen name="Wallet" component={WalletScreen} />
        <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="ContactUs" component={ContactUsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
