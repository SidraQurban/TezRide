import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import BackBtn from "../components/BackBtn";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";

const PackageDetail = () => {
  const [weight, setWeight] = useState("Light (0-5kg)");
  const [packageType, setPackageType] = useState("Document");
  const [deliveryMethod, setDeliveryMethod] = useState("Bike");
  return (
    <View>
      <Text
        style={{
          fontSize: responsiveFontSize(1.8),
          fontFamily: FONTS.semiBold,
          marginVertical: responsiveHeight(1),
        }}
      >
        Package Details
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ marginVertical: responsiveHeight(1) }}
      >
        {["Light (0-5kg)", "Medium (5-15kg)", "Heavy (>15kg)"].map((item) => (
          <TouchableOpacity
            key={item}
            onPress={() => setWeight(item)}
            style={{
              borderWidth: 1,
              borderColor: weight === item ? COLORS.primary : "#ddd",
              borderRadius: 10,
              paddingVertical: responsiveHeight(1),
              paddingHorizontal: responsiveWidth(4),
              marginRight: responsiveWidth(2),
              backgroundColor: weight === item ? COLORS.active : "#fff",
              height: responsiveHeight(6),
              justifyContent: "center",
            }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(1.7),
                fontFamily: FONTS.medium,
                color: COLORS.black,
              }}
            >
              {item}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default PackageDetail;
