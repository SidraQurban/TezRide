import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
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
          <WebView
            source={{
              html: `<iframe src="https://maps.google.com/maps?q=25.198152585089883,66.45617498089926&z=12&output=embed" width="100%" height="100%" style="border:0;"></iframe>`,
            }}
            style={{ flex: 1 }}
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
          <DeliverybottomPanel />
        </View>
      </View>
    </SafeAreaView>
  );
};

export default DeliveryScreen;
