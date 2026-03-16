import { View, Text } from "react-native";
import React from "react";
import {
  responsiveFontSize,
  responsiveHeight,
} from "react-native-responsive-dimensions";
import { COLORS, SIZES } from "../constants";
import { Ionicons } from "@expo/vector-icons";

const recentLocations = [
  { id: "1", name: "Work", icon: "briefcase-outline", bgColor: COLORS.active },
  { id: "2", name: "Home", icon: "home-outline", bgColor: COLORS.active },
  {
    id: "3",
    name: "University Campus",
    icon: "school-outline",
    bgColor: COLORS.active,
  },
];

const RecentLocations = () => {
  return (
    <View>
      <View>
        <Text style={{ fontSize: responsiveFontSize(2), fontWeight: "bold" }}>
          Recent Locations
        </Text>
      </View>
      {recentLocations.map((location) => (
        <View
          key={location.id}
          style={{
            flexDirection: "row",
            alignItems: "center",
          }}
        >
          <View
            style={{
              backgroundColor: location.bgColor,
              borderRadius: responsiveHeight(1.75),
              justifyContent: "center",
              alignItems: "center",
              marginRight: 12,
              width: responsiveHeight(3.5),
              height: responsiveHeight(3.5),
              marginTop: responsiveHeight(0.5),
            }}
          >
            <Ionicons name={location.icon} size={20} color={COLORS.primary} />
          </View>
          <Text
            style={{ fontSize: responsiveFontSize(1.8), color: COLORS.black }}
          >
            {location.name}
          </Text>
        </View>
      ))}
    </View>
  );
};

export default RecentLocations;
