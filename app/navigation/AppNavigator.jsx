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
import ChatScreen from "../screens/ChatScreen";
import NotificationHandler from "../components/NotificationHandler";

import authService from "../api/authService";
import rideService from "../api/rideService";
import { useRide } from "../context/RideContext";
import { COLORS } from "../constants";

const Stack = createNativeStackNavigator();

const AppNavigator = () => {
  const { i18n } = useTranslation();
  const { setActiveRide } = useRide();

  // null = loading, string = ready
  const [initialRoute, setInitialRoute] = useState(null);
  const [restoredRideParams, setRestoredRideParams] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        // Step 1: Validate auth token
        const authenticated = await authService.ensureValidToken();
        if (!authenticated) {
          setInitialRoute("Onboarding");
          return;
        }

        // Step 2: Check backend for an active ride (Redis → PostgreSQL fallback)
        try {
          const response = await rideService.getCurrentRide();
          const ride = response?.data?.data ?? response?.data ?? null;

          if (ride && ride.rideId) {
            // Map backend RideStatus enum strings → UI status strings
            const statusMap = {
              Searching: "searching",
              Assigned: "assigned",
              DriverArrived: "driver_arrived",
              InTransit: "in_transit",
              Completed: "completed",
              CanceledByCustomer: "cancelled",
              CanceledByDriver: "cancelled",
            };
            // isSearching flag takes precedence over the Status field.
            // Backend sets Status = Assigned as a sentinel for searches; use isSearching to detect accurately.
            const uiStatus = ride.isSearching === true
              ? "searching"
              : (statusMap[ride.status] ?? "searching");

            // Skip if ride is already in a terminal state
            if (uiStatus === "completed" || uiStatus === "cancelled") {
              setInitialRoute("MainDrawer");
              return;
            }

            // Map the API response into the shape SearchingDirection + context expect
            const restoredActiveRide = {
              rideId: ride.rideId,
              status: uiStatus,
              vehicleType: ride.vehicleType,
              serviceType: ride.serviceType || "ride",
              paymentMethod: ride.paymentMethod || "Cash",
              price: ride.estimatedFare ?? null,
              distance: ride.estimatedDistanceKm ?? null,
              duration: ride.estimatedDurationMinutes ?? null,
              pickup: ride.pickupLat
                ? {
                    latitude: ride.pickupLat,
                    longitude: ride.pickupLon,
                    address: ride.pickupAddress || "",
                  }
                : null,
              destination: ride.dropoffLat
                ? {
                    latitude: ride.dropoffLat,
                    longitude: ride.dropoffLon,
                    address: ride.dropoffAddress || "",
                  }
                : null,
              // Driver details for the assigned/in-transit card.
              // UserMinimalDto field names: id, firstName, lastName, profilePictureUrl, phoneNumber, averageRating
              // ArrivingCard expected prop names: driverName, profilePicUrl, rating, phoneNumber
              assignedDriver: ride.partnerDetail
                ? {
                    driverId: ride.partnerDetail.id,
                    driverName: [ride.partnerDetail.firstName, ride.partnerDetail.lastName]
                      .filter(Boolean).join(" ") || "Driver",
                    profilePicUrl: ride.partnerDetail.profilePictureUrl || null,
                    vehicleType: ride.vehicleType,
                    vehiclePlateNumber: ride.driverVehiclePlateNumber || ride.partnerDetail.vehicleNumber || "",
                    rating: ride.partnerDetail.averageRating ?? null,
                    phoneNumber: ride.partnerDetail.phoneNumber || "",
                    // Last known GPS for the driver marker (populated from Redis)
                    lat: ride.driverLat ?? null,
                    lon: ride.driverLon ?? null,
                  }
                : null,
              // Pre-seed driverLocation so SearchingDirection shows the marker immediately
              driverLocation: (ride.driverLat && ride.driverLon)
                ? { latitude: ride.driverLat, longitude: ride.driverLon }
                : null,
              restoredFromBackend: true,
            };

            // Hydrate context so SearchingDirection can read it
            setActiveRide(restoredActiveRide);

            // Pass minimal params to SearchingDirection (it reads the rest from context)
            setRestoredRideParams({
              rideId: ride.rideId,
              pickup: restoredActiveRide.pickup,
              destination: restoredActiveRide.destination,
              vehicleType: ride.vehicleType,
              price: ride.estimatedFare ?? null,
              serviceType: ride.serviceType || "ride",
              restoredFromBackend: true,
              recoveredStatus: uiStatus,
              isSearching: ride.isSearching === true,
            });

            setInitialRoute("SearchingDirection");
            return;
          }
        } catch (rideError) {
          // Non-fatal: if ride check fails, continue to home normally
          console.warn("[AppNavigator] Could not check for active ride:", rideError?.message);
        }

        // Step 3: No active ride — go to home
        setInitialRoute("MainDrawer");
      } catch (error) {
        console.warn("[AppNavigator] Startup session recovery failed:", error);
        setInitialRoute("Onboarding");
      }
    })();
  }, []);

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
      <NotificationHandler>
        <Stack.Navigator
          initialRouteName={initialRoute}
          screenOptions={{
            headerShown: false,
            contentStyle: { direction: "ltr" },
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
          <Stack.Screen
            name="SearchingDirection"
            component={SearchingDirection}
            initialParams={restoredRideParams ?? undefined}
          />
          <Stack.Screen name="DriverProfile" component={DriverProfileScreen} />
          <Stack.Screen name="SearchDriver" component={SearchDriverScreen} />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="RideHistory" component={RideHistoryScreen} />
          <Stack.Screen name="Settings" component={Settings} />
          <Stack.Screen name="ContactUs" component={ContactUsScreen} />
          <Stack.Screen name="Chat" component={ChatScreen} />
        </Stack.Navigator>
      </NotificationHandler>
    </NavigationContainer>
  );
};

export default AppNavigator;
