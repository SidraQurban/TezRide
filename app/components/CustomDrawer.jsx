import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { DrawerContentScrollView } from "@react-navigation/drawer";
import { COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const drawerItems = [
  { label: "Home", icon: "home-outline", route: "Home" },
  // { label: "Wallet", icon: "wallet-outline", route: "Wallet" },
  { label: "Booking", icon: "calendar-outline", route: "Booking" },
  { label: "Contact Us", icon: "call-outline", route: "ContactUs" },
  {
    label: "Notifications",
    icon: "notifications-outline",
    badge: 4,
    route: "Notifications",
  },
  // { label: "Safety", icon: "shield-checkmark-outline", route: "Safety" },
  { label: "Settings", icon: "settings-outline", route: "Settings" },
];

const CustomDrawer = (props) => {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <View style={{ flex: 1, backgroundColor: COLORS.background }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ paddingTop: 0 }}
        >
          {/* Profile Section */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              paddingHorizontal: responsiveWidth(4),
              paddingVertical: responsiveHeight(2),
              borderBottomWidth: 1,
              borderColor: "#eee",
            }}
          >
            {/* Avatar */}
            <View
              style={{
                width: responsiveWidth(12),
                height: responsiveWidth(12),
                borderRadius: responsiveWidth(6),
                backgroundColor: "#E0E0E0",
                justifyContent: "center",
                alignItems: "center",
                marginRight: responsiveWidth(3),
              }}
            >
              <Ionicons
                name="person"
                size={responsiveFontSize(3)}
                color="#777"
              />
            </View>

            {/* Name + Rating */}
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  fontWeight: "600",
                  color: COLORS.black,
                }}
              >
                User
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 2,
                }}
              >
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Ionicons name="star" size={14} color={COLORS.secondary} />
                <Ionicons name="star-half" size={14} color={COLORS.secondary} />

                <Text
                  style={{
                    marginLeft: 5,
                    fontSize: responsiveFontSize(1.6),
                    color: "#777",
                  }}
                >
                  4.8 (4)
                </Text>
              </View>
            </View>
            {/* Back Icon */}
            <TouchableOpacity
              onPress={() => props.navigation.closeDrawer()}
              style={{ marginRight: responsiveWidth(3) }}
            >
              <Ionicons
                name="chevron-back-sharp"
                size={responsiveFontSize(3)}
                color={COLORS.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Drawer Items */}
          <View style={{ marginTop: responsiveHeight(2) }}>
            {drawerItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => {
                  setActiveIndex(index);
                  props.navigation.navigate(item.route || ""); // navigate if route exists
                }}
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  paddingVertical: responsiveHeight(1.5),
                  paddingHorizontal: responsiveWidth(5),
                  backgroundColor:
                    activeIndex === index ? COLORS.active : "transparent",
                  borderRadius: 10,
                  marginHorizontal: responsiveWidth(2),
                  marginVertical: responsiveHeight(0.5),
                }}
              >
                <Ionicons
                  name={item.icon}
                  size={responsiveFontSize(2.2)}
                  color={COLORS.black}
                />
                <Text
                  style={{
                    fontSize: responsiveFontSize(1.9),
                    marginLeft: responsiveWidth(4),
                    flex: 1,
                    color: COLORS.black,
                  }}
                >
                  {item.label}
                </Text>
                {item.badge && (
                  <View
                    style={{
                      backgroundColor: "red",
                      borderRadius: 10,
                      paddingHorizontal: 6,
                      paddingVertical: 2,
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontSize: responsiveFontSize(1.4),
                      }}
                    >
                      {item.badge}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </DrawerContentScrollView>

        {/* Bottom Section */}
        <View
          style={{
            padding: responsiveWidth(5),
            borderTopWidth: 1,
            borderColor: "#E0E0E0",
          }}
        >
          <TouchableOpacity>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                alignItems: "center",
                padding: responsiveHeight(1.2),
                borderRadius: responsiveHeight(1.5),
                marginBottom: responsiveHeight(1.5),
                paddingVertical: responsiveHeight(1.5),
              }}
            >
              <Text
                style={{
                  fontSize: responsiveFontSize(2),
                  fontWeight: "bold",
                }}
              >
                Logout
              </Text>
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ flexDirection: "row", justifyContent: "center" }}>
            <TouchableOpacity style={{ marginHorizontal: responsiveWidth(3) }}>
              <Ionicons
                name="logo-facebook"
                size={responsiveFontSize(3)}
                color="#3b5998"
              />
            </TouchableOpacity>
            <TouchableOpacity style={{ marginHorizontal: responsiveWidth(3) }}>
              <Ionicons
                name="logo-instagram"
                size={responsiveFontSize(3)}
                color="#C13584"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default CustomDrawer;
