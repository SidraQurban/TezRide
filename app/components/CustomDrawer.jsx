import React from "react";
import { View, Text, Image, TouchableOpacity } from "react-native";
import { DrawerContentScrollView, DrawerItem } from "@react-navigation/drawer";
import { COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const drawerItems = [
  { label: "Home", route: "Home" },
  { label: "Missed Calls", route: "MissedCalls" },
  { label: "Booking", route: "Booking" },
  { label: "Wallet", route: "Wallet" },
  { label: "Contact Us", route: "ContactUs" },
];

const CustomDrawer = (props) => {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <DrawerContentScrollView {...props}>
          {/* Logo Section */}
          <View
            style={{
              alignItems: "center",
              backgroundColor: COLORS.secondary,
              marginTop: -50,
            }}
          >
            <Image
              source={require("../../assets/logo.png")}
              style={{
                width: responsiveWidth(50),
                height: responsiveHeight(20),
                resizeMethod: "cover",
              }}
            />
          </View>

          {/* Drawer Items using map */}
          {drawerItems.map((item, index) => (
            <View key={index}>
              <DrawerItem
                label={item.label}
                labelStyle={{
                  fontSize: responsiveFontSize(1.8),
                  fontWeight: "bold",
                  color: COLORS.black,
                }}
                onPress={() => props.navigation.navigate(item.route)}
              />

              {/* Divider Line */}
              <View
                style={{
                  height: 1,
                  backgroundColor: "#E0E0E0",
                  marginHorizontal: 15,
                }}
              />
            </View>
          ))}
        </DrawerContentScrollView>

        {/* Bottom Section */}
        <View style={{ padding: 20 }}>
          <TouchableOpacity>
            <Text style={{ color: COLORS.primary }}>Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawer;
