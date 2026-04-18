import React from "react";
import { View } from "react-native";
import MapComponent from "../components/MapComponent";
import {
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import BackBtn from "../components/BackBtn";
import DeliverybottomPanel from "../components/DeliverybottomPanel";
import { COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";

const DeliveryScreen = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >
      {/* MAIN CONTAINER */}
      <View style={{ flex: 1 }}>
        {/* BACK BUTTON */}
        <View
          style={{
            // position: "absolute",
            // top: responsiveHeight(2),
            left: responsiveWidth(4),
            // zIndex: 10,
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
          <MapComponent />
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
          <DeliverybottomPanel />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryScreen;
