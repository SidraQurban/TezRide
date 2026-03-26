import { View, Text } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import VerifyCodeScreen from "../screens/VerifyCodeScreen";
import DrawerNavigator from "./DrawerNavigator";
import SearchScreen from "../screens/SearchScreen";
import LocationDetailsScreen from "../screens/LocationDetailsScreen";
import SelectRideScreen from "../screens/SelectRideScreen";
import PromoScreen from "../screens/PromoScreen";
import PaymentMethodScreen from "../screens/PaymentMethodScreen";
import SearchingDirection from "../screens/SearchingDirection";
import ConfirmRideScreen from "../screens/ConfirmRideScreen";

const Stack = createNativeStackNavigator();
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
        <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
        <Stack.Screen name="Search" component={SearchScreen} />
        <Stack.Screen
          name="LocationDetails"
          component={LocationDetailsScreen}
        />
        <Stack.Screen name="SelectRide" component={SelectRideScreen} />
        <Stack.Screen name="Promo" component={PromoScreen} />
        <Stack.Screen name="PaymentMethod" component={PaymentMethodScreen} />
        <Stack.Screen name="ConfirmRide" component={ConfirmRideScreen} />
        <Stack.Screen
          name="SearchingDirection"
          component={SearchingDirection}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
