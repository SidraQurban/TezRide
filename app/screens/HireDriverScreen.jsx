import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import BackBtn from "../components/BackBtn";
import VehicleType from "../components/VehicleType";
import CurrentLocation from "../components/CurrentLocation";
import TimeSelector from "../components/TimeSelector";
import DriverPreference from "../components/DriverPreference";
import RateInfo from "../components/RateInfo";
import { driverPreferences, timeOptions } from "../data/data";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const HireDriverScreen = () => {
  const navigation = useNavigation();
  const [pickup, setPickup] = useState("");
  const [time, setTime] = useState("Morning");
  const [gender, setGender] = useState("No Preference");
  const [startTime, setStartTime] = useState(new Date(2023, 1, 1, 9, 0));
  const [endTime, setEndTime] = useState(new Date(2023, 1, 1, 17, 0));
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const driverRate = 150;

  const formatTime = (date) => {
    let hours = date.getHours();
    let minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    return `${hours}:${minutes} ${ampm}`;
  };

  const calculateDuration = (start, end) => {
    const diff = end - start;
    const hours = diff / (1000 * 60 * 60);
    return hours > 0 ? hours : 0;
  };

  const duration = calculateDuration(startTime, endTime);
  const totalPrice = duration * driverRate;

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
        paddingHorizontal: responsiveWidth(4),
      }}
    >
      <View>
        <BackBtn />
      </View>

      <View
        style={{
          backgroundColor: COLORS.white,
          borderRadius: responsiveWidth(3),
          padding: responsiveHeight(1),
          elevation: 3,
          width: responsiveWidth(90),
          borderWidth: 1,
          borderColor: COLORS.primary,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <Ionicons name="location-outline" size={20} color={COLORS.icon} />
          <TextInput
            placeholder="Enter pickup location"
            value={pickup}
            onChangeText={setPickup}
            style={{
              flex: 1,
              marginLeft: responsiveWidth(2),
              fontSize: responsiveFontSize(1.8),
              fontFamily: FONTS.medium,
              paddingVertical: 2,
              color: COLORS.black,
              lineHeight: responsiveFontSize(3.5),
              includeFontPadding: false,
            }}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      <CurrentLocation />
      <VehicleType />
      <TimeSelector
        timeOptions={timeOptions}
        time={time}
        setTime={setTime}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        showStartPicker={showStartPicker}
        setShowStartPicker={setShowStartPicker}
        showEndPicker={showEndPicker}
        setShowEndPicker={setShowEndPicker}
        formatTime={formatTime}
      />
      <DriverPreference
        driverPreferences={driverPreferences}
        gender={gender}
        setGender={setGender}
      />
      <RateInfo
        driverRate={driverRate}
        duration={duration}
        totalPrice={totalPrice}
      />

      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => navigation.navigate("SearchDriver")}
        style={{
          marginTop: responsiveHeight(1),
          position: "absolute",
          bottom: responsiveHeight(7),
          left: responsiveWidth(4),
          right: responsiveWidth(4),
          zIndex: 5,
        }}
      >
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{
            width: "100%",
            paddingVertical: responsiveHeight(2), // responsive height
            borderRadius: responsiveHeight(3), // proportional radius
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color: COLORS.white,
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(2),
            }}
          >
            Request Driver
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default HireDriverScreen;
