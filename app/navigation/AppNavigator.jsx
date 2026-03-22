import { View, Text } from "react-native";
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { NavigationContainer } from "@react-navigation/native";
import OnboardingScreen from "../screens/OnboardingScreen";
import LoginScreen from "../screens/LoginScreen";
import VerifyCodeScreen from "../screens/VerifyCodeScreen";
import DrawerNavigator from "./DrawerNavigator";
import DeliveryScreen from "../screens/DeliveryScreen";
import RideScreen from "../screens/RideScreen";
import ShopScreen from "../screens/ShopScreen";
import RentalsScreen from "../screens/RentalsScreen";
import SearchScreen from "../screens/SearchScreen";

const Stack = createNativeStackNavigator();
const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="login" component={LoginScreen} />
        <Stack.Screen name="VerifyCode" component={VerifyCodeScreen} />
        <Stack.Screen name="MainDrawer" component={DrawerNavigator} />
        <Stack.Screen name="Delivery" component={DeliveryScreen} />
        <Stack.Screen name="Ride" component={RideScreen} />
        <Stack.Screen name="Shop" component={ShopScreen} />
        <Stack.Screen name="Rentals" component={RentalsScreen} />
        <Stack.Screen name="Search" component={SearchScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
