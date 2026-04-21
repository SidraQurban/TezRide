import React, { useState, useEffect } from "react";
import { View, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import MapComponent from "../components/MapComponent";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import BackBtn from "../components/BackBtn";
import DeliverybottomPanel from "../components/DeliverybottomPanel";
import { COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";

const DeliveryScreen = () => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [pickupAddress, setPickupAddress] = useState("Near 3 Sector 24 Chowrangi industrial area, Karachi");
  const [homeAddress, setHomeAddress] = useState("Clifton, Karachi");

  // Geocode address when it changes
  useEffect(() => {
    const geocode = async (address, type) => {
      if (!address) return;
      try {
        const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GOOGLE_MAPS_API_KEY}`;
        const response = await fetch(url);
        const json = await response.json();
        if (json.status === "OK") {
          const { lat, lng } = json.results[0].geometry.location;
          if (type === "pickup") {
            setPickup({ latitude: lat, longitude: lng });
          } else {
            setDestination({ latitude: lat, longitude: lng });
          }
        }
      } catch (error) {
        console.warn("Geocoding error:", error);
      }
    };

    const timer = setTimeout(() => {
      geocode(pickupAddress, "pickup");
      geocode(homeAddress, "destination");
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [pickupAddress, homeAddress]);

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
      >
        <ScrollView 
          contentContainerStyle={{ flexGrow: 1 }} 
          scrollEnabled={false} 
          keyboardShouldPersistTaps="handled"
        >
          {/* MAIN CONTAINER */}
          <View style={{ flex: 1 }}>
            {/* BACK BUTTON */}
            <View
              style={{
                left: responsiveWidth(4),
              }}
            >
              <BackBtn />
            </View>

            {/* MAP */}
            <View
              style={{
                height: responsiveHeight(60),
                width: "100%",
                borderRadius: 15,
                overflow: "hidden",
                marginTop: responsiveHeight(0),
              }}
            >
              <MapComponent 
                pickup={pickup} 
                destination={destination}
                showMarkers={true} 
              />
            </View>

            {/* BOTTOM PANEL */}
            <View
              style={{
                position: "absolute",
                bottom: 0,
                width: "100%",
                zIndex: 20,
              }}
            >
              <DeliverybottomPanel 
                pickupAddress={pickupAddress}
                setPickupAddress={setPickupAddress}
                homeAddress={homeAddress}
                setHomeAddress={setHomeAddress}
              />
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default DeliveryScreen;
