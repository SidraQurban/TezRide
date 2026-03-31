import React from "react";
import { View, Text, TouchableOpacity, Platform } from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  responsiveHeight,
  responsiveWidth,
  responsiveFontSize,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { FONTS } from "../constants/theme";
import { LinearGradient } from "expo-linear-gradient";
import { useTranslation } from "react-i18next";

const TimeSelector = ({
  timeOptions,
  time,
  setTime,
  startTime,
  setStartTime,
  endTime,
  setEndTime,
  showStartPicker,
  setShowStartPicker,
  showEndPicker,
  setShowEndPicker,
  formatTime,
}) => {
  const { t } = useTranslation();
  return (
    <View
      style={{
        backgroundColor: COLORS.white,
        marginTop: responsiveHeight(2),
        padding: responsiveHeight(2),
        borderRadius: responsiveWidth(3),
        elevation: 3,
      }}
    >
      <Text
        style={{
          fontWeight: "600",
          fontSize: responsiveFontSize(1.8),
          fontFamily: FONTS.semiBold,
          marginBottom: responsiveHeight(1),
        }}
      >
        {t("when_need_driver")}
      </Text>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          marginBottom: responsiveHeight(2),
        }}
      >
        {timeOptions.map((option, index) => (
          <TouchableOpacity
            key={option}
            onPress={() => setTime(option)}
            style={{
              backgroundColor: time === option ? COLORS.active : "#E5E5E5",
              paddingVertical: responsiveHeight(1.2),
              paddingHorizontal: responsiveWidth(5),
              borderRadius: responsiveWidth(20),
              marginRight: responsiveWidth(3),
              marginBottom: responsiveHeight(1),
              borderWidth: time === option ? responsiveWidth(0.3) : 0,
              borderColor: COLORS.primary,
            }}
          >
            <Text
              style={{
                color: COLORS.black,
                fontSize: responsiveFontSize(1.6),
                fontFamily: FONTS.medium,
              }}
            >
              {t(option)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        {/* Start Time */}
        <View>
          <Text
            style={{
              fontSize: responsiveFontSize(1.6),
              fontFamily: FONTS.medium,
            }}
          >
            {t("start_time")}
          </Text>
          <TouchableOpacity onPress={() => setShowStartPicker(true)}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: responsiveHeight(1.5),
                paddingHorizontal: responsiveWidth(4),
                borderRadius: responsiveWidth(3),
                marginTop: responsiveHeight(0.5),
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(1.7),
                  fontFamily: FONTS.medium,
                }}
              >
                {formatTime(startTime)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {showStartPicker && (
            <DateTimePicker
              value={startTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              textColor={COLORS.primary} // <-- set text color here (iOS only)
              themeVariant="light"
              onChange={(event, selectedTime) => {
                setShowStartPicker(false);
                if (selectedTime) setStartTime(selectedTime);
              }}
            />
          )}
        </View>

        {/* End Time */}
        <View>
          <Text
            style={{
              fontSize: responsiveFontSize(1.6),
              fontFamily: FONTS.medium,
            }}
          >
            {t("end_time")}
          </Text>
          <TouchableOpacity onPress={() => setShowEndPicker(true)}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                paddingVertical: responsiveHeight(1.5),
                paddingHorizontal: responsiveWidth(4),
                borderRadius: responsiveWidth(3),
                marginTop: responsiveHeight(0.5),
              }}
            >
              <Text
                style={{
                  color: COLORS.white,
                  fontSize: responsiveFontSize(1.7),

                  fontFamily: FONTS.medium,
                }}
              >
                {formatTime(endTime)}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
          {showEndPicker && (
            <DateTimePicker
              value={endTime}
              mode="time"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={(event, selectedTime) => {
                setShowEndPicker(false);
                if (selectedTime) setEndTime(selectedTime);
              }}
            />
          )}
        </View>
      </View>
    </View>
  );
};

export default TimeSelector;
