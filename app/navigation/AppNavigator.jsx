import { View, Text } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import { useTranslation } from "react-i18next";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import VerifyCodeScreen from "../screens/VerifyCodeScreen";
import DrawerNavigator from "./DrawerNavigator";
import SearchScreen from "../screens/SearchScreen";
import LocationDetailsScreen from "../screens/LocationDetailsScreen";
// import SelectRideScreen from "../screens/SelectRideScreen";
import PromoScreen from "../screens/PromoScreen";
// import PaymentMethodScreen from "../screens/PaymentMethodScreen";
import SearchingDirection from "../screens/SearchingDirection";
import ConfirmRideScreen from "../screens/ConfirmRideScreen";
import DriverProfileScreen from "../screens/DriverProfileScreen";
import DeliveryScreen from "../screens/DeliveryScreen";
import ShopsScreen from "../screens/ShopsScreen";
import HireDriverScreen from "../screens/HireDriverScreen";
import SearchDriverScreen from "../screens/SearchDriverScreen";
import CargoScreen from "../screens/CargoScreen";

// import ShopDetailScreen from "../screens/ShopDetailScreen";

const Stack = createNativeStackNavigator();
const AppNavigator = () => {
  const { i18n } = useTranslation();
  const isRtl = i18n.language?.startsWith("ur");

  return (
    <NavigationContainer>
      <Stack.Navigator
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
        {/* <Stack.Screen name="ShopDetail" component={ShopDetailScreen} /> */}
        <Stack.Screen name="Cargo" component={CargoScreen} />
        <Stack.Screen
          name="LocationDetails"
          component={LocationDetailsScreen}
        />
        {/* <Stack.Screen name="SelectRide" component={SelectRideScreen} /> */}
        <Stack.Screen name="Promo" component={PromoScreen} />
        {/* <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} /> */}
        <Stack.Screen name="ConfirmRide" component={ConfirmRideScreen} />
        <Stack.Screen
          name="SearchingDirection"
          component={SearchingDirection}
        />
        <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
        <Stack.Screen name="SearchDriver" component={SearchDriverScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
