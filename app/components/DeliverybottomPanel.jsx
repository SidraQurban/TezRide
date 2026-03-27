import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { LinearGradient } from "expo-linear-gradient";

const DeliverybottomPanel = ({ navigation }) => {
  return (
    <View>
      {/* BOTTOM PANEL */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          width: "100%",
          backgroundColor: "#fff",
          borderTopLeftRadius: responsiveWidth(6),
          borderTopRightRadius: responsiveWidth(6),
          padding: responsiveHeight(2.6),
          elevation: 20,
        }}
      >
        {/* Title */}
        <Text
          style={{
            fontSize: responsiveFontSize(2),
            fontWeight: "600",
            marginBottom: responsiveHeight(1.2),
          }}
        >
          Select parcel pickup location
        </Text>

        {/* Add location */}
        <TouchableOpacity>
          <Text
            style={{
              color: COLORS.primary,
              marginBottom: responsiveHeight(1.5),
              fontWeight: "500",
            }}
          >
            + Add Another Location
          </Text>
        </TouchableOpacity>

        {/* Current location card */}
        <View
          style={{
            borderWidth: 2,
            borderColor: COLORS.primary,
            borderRadius: responsiveHeight(2),
            padding: responsiveHeight(1.5),
            flexDirection: "row",
            alignItems: "center",
            marginBottom: responsiveHeight(1.7),
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontWeight: "600",
                marginBottom: responsiveHeight(0.8),
              }}
            >
              Current location
            </Text>

            <Text
              style={{
                color: "#777",
                fontSize: responsiveFontSize(1.5),
              }}
            >
              Near 3 Sector 24 Chowrangi industrial area, Karachi
            </Text>
          </View>

          <Ionicons name="locate" size={22} color={COLORS.primary} />
        </View>

        {/* Home */}
        <View
          style={{
            marginBottom: responsiveHeight(2.5),
            marginLeft: responsiveWidth(3.2),
          }}
        >
          <Text
            style={{
              fontWeight: "600",
            }}
          >
            Home
          </Text>
          <Text
            style={{
              color: "#777",
              fontSize: responsiveFontSize(1.6),
            }}
          >
            Saeedabad Karachi
          </Text>
        </View>

        {/* Confirm button */}
        <TouchableOpacity>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              padding: 16,
              borderRadius: 30,
              alignItems: "center",
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                letterSpacing: 1,
              }}
            >
              CONFIRM LOCATION
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeliverybottomPanel;
