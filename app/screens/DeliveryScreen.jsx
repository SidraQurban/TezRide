import React from "react";
import { View } from "react-native";
import { WebView } from "react-native-webview";
import { COLORS, SIZES } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";

const DeliveryScreen = () => {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View style={{ flex: 1 }}>
        {/* MAP */}
        <WebView
          source={{
            html: `
              <iframe
                src="https://maps.google.com/maps?q=25.198152585089883,66.45617498089926&z=10&output=embed"
                width="100%"
                height="60%"
                style="border:0;"
              ></iframe>
            `,
          }}
          style={{ flex: 1 }}
        />
      </View>
    </SafeAreaView>
  );
};

export default DeliveryScreen;
