import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { LinearGradient } from "expo-linear-gradient";
import { FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { useTranslation } from "react-i18next";

const DeliverybottomPanel = ({ pickupAddress, homeAddress, onTextChange }) => {
  const navigation = useNavigation();
  const { t, i18n } = useTranslation();
  const isUrdu = i18n.language?.startsWith("ur");

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
            marginBottom: responsiveHeight(1.2),
            fontFamily: FONTS.semiBold,
            color: COLORS.black,
            textAlign: "left",
          }}
        >
          {t("select_pickup_title")}
        </Text>

        {/* Add location */}
        <TouchableOpacity>
          <Text
            style={{
              color: COLORS.primary,
              marginBottom: responsiveHeight(1.5),
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(1.7),
              textAlign: "left",
            }}
          >
            {t("add_another_location")}
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
          {isUrdu && (
            <Ionicons
              name="locate"
              size={22}
              color={COLORS.primary}
              style={{ marginRight: 10 }}
            />
          )}

          <View style={{ flex: 1 }}>
            <Text
              style={{
                marginBottom: responsiveHeight(0.8),
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(1.7),
                color: COLORS.black,
                textAlign: "left",
              }}
            >
              {t("current_location")}
            </Text>

            <TextInput
              style={{
                color: COLORS.black,
                fontSize: responsiveFontSize(1.6),
                fontFamily: FONTS.regular,
                padding: 0,
                textAlign: isUrdu ? "right" : "left",
                writingDirection: isUrdu ? "rtl" : "ltr",
              }}
              value={pickupAddress}
              onChangeText={(text) => onTextChange(text, "pickup")}
              multiline={false}
              placeholder={t("pickup_placeholder")}
              placeholderTextColor="#888"
              ellipsizeMode="tail"
            />
          </View>

          {!isUrdu && (
            <Ionicons
              name="locate"
              size={22}
              color={COLORS.primary}
              style={{ marginLeft: 10 }}
            />
          )}
        </View>

        {/* Home */}
        <View
          style={{
            marginBottom: responsiveHeight(2.5),
            marginHorizontal: responsiveWidth(3.2),
            alignItems: "flex-start",
          }}
        >
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(1.7),
              color: COLORS.black,
              textAlign: isUrdu ? "right" : "left",
            }}
          >
            {t("home")}
          </Text>
          <TextInput
            style={{
              color: COLORS.black,
              fontSize: responsiveFontSize(1.6),
              fontFamily: FONTS.regular,
              padding: 0,
              width: "100%",
              textAlign: isUrdu ? "right" : "left",
              writingDirection: isUrdu ? "rtl" : "ltr",
            }}
            value={homeAddress}
            onChangeText={(text) => onTextChange(text, "home")}
            multiline={false}
            placeholder={t("home_placeholder")}
            placeholderTextColor="#888"
          />
        </View>

        {/* Confirm button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("SearchingDirection")}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: "100%",
              height: responsiveHeight(7),
              borderRadius: responsiveWidth(10),
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
              {t("confirm_location")}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DeliverybottomPanel;
