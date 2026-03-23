import React, { useState } from "react";
import {
  View,
  Text,
  Image,
  TextInput,
  TouchableOpacity,
  Modal,
  FlatList,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { FONTS } from "../constants/theme";

const countries = [
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+1", flag: "🇺🇸", name: "USA" },
  { code: "+44", flag: "🇬🇧", name: "UK" },
];

const LoginScreen = () => {
  const [phone, setPhone] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [modalVisible, setModalVisible] = useState(false);
  const navigation = useNavigation();

  const isPhoneComplete = phone.length === 10;

  const handlePhoneChange = (text) => {
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 11) {
      setPhone(cleaned);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{
          flex: 1,
          justifyContent: "space-between", // ✅ distributes content properly
          alignItems: "center",
          paddingVertical: responsiveHeight(3),
        }}
      >
        {/* TOP SECTION */}
        <View style={{ alignItems: "center", width: "100%" }}>
          {/* Logo */}
          <Image
            source={require("../../assets/logo.png")}
            resizeMode="contain"
            style={{
              height: responsiveHeight(18),
              width: responsiveWidth(70),
            }}
          />

          {/* Text */}
          <View
            style={{ alignItems: "center", marginTop: responsiveHeight(1) }}
          >
            <Text
              style={{
                fontSize: responsiveFontSize(2.3),
                fontFamily: FONTS.semiBold,
                textAlign: "center",
              }}
            >
              Enter your number to
            </Text>
            <Text
              style={{
                fontSize: responsiveFontSize(2.3),
                fontFamily: FONTS.semiBold,
                textAlign: "center",
              }}
            >
              continue
            </Text>
          </View>

          {/* Phone Input */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: responsiveHeight(4),
              borderWidth: 1.5,
              borderColor: isPhoneComplete ? COLORS.primary : "#ccc",
              borderRadius: responsiveWidth(3),
              paddingHorizontal: responsiveWidth(3),
              height: responsiveHeight(6.5),
              width: responsiveWidth(85),
            }}
          >
            {/* Country Picker */}
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text
                style={{
                  fontSize: responsiveFontSize(2.5),
                  fontFamily: FONTS.regular,
                }}
              >
                {selectedCountry.flag}
              </Text>

              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons
                  name="caret-down"
                  size={responsiveFontSize(2.2)}
                  color={COLORS.primary}
                  style={{ marginLeft: responsiveWidth(1.5) }}
                />
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View
              style={{
                width: 1,
                height: "60%",
                backgroundColor: COLORS.num,
                marginHorizontal: responsiveWidth(2),
              }}
            />

            {/* Code */}
            <Text
              style={{
                color: COLORS.primary,
                fontSize: responsiveFontSize(2),
                fontFamily: FONTS.semiBold,
              }}
            >
              {selectedCountry.code}
            </Text>

            {/* Input */}
            <TextInput
              style={{
                flex: 1,
                fontSize: responsiveFontSize(2),
                color: isPhoneComplete ? COLORS.primary : COLORS.black,
                marginLeft: responsiveWidth(2),
                fontFamily: FONTS.semiBold,
              }}
              placeholder="3XXXXXXXXX"
              placeholderTextColor={COLORS.num}
              keyboardType="number-pad"
              value={phone}
              onChangeText={handlePhoneChange}
              maxLength={11}
            />
          </View>
        </View>

        {/* BOTTOM SECTION */}
        <View style={{ alignItems: "center" }}>
          {/* Privacy */}
          <Text
            style={{
              color: "#adb5bd",
              textDecorationLine: "underline",
              fontFamily: FONTS.regular,
              marginBottom: responsiveHeight(2),
            }}
          >
            Privacy Policy
          </Text>

          {/* Button */}
          <TouchableOpacity
            disabled={!isPhoneComplete}
            onPress={() =>
              navigation.navigate("VerifyCode", {
                phoneNumber: `${selectedCountry.code} ${phone}`,
              })
            }
            style={{
              opacity: isPhoneComplete ? 1 : 0.4,
            }}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={{
                width: responsiveWidth(85),
                height: responsiveHeight(7), // ✅ fixed (was width before)
                borderRadius: responsiveWidth(10),
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <Ionicons
                name="checkmark-sharp"
                size={responsiveFontSize(4)}
                color={COLORS.white}
              />
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* MODAL */}
        <Modal visible={modalVisible} transparent animationType="slide">
          <View
            style={{
              flex: 1,
              backgroundColor: "rgba(0,0,0,0.5)",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <View
              style={{
                backgroundColor: COLORS.white,
                width: responsiveWidth(85),
                borderRadius: responsiveWidth(4),
                maxHeight: responsiveHeight(50),
              }}
            >
              <FlatList
                data={countries}
                keyExtractor={(item) => item.code}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      padding: responsiveWidth(3),
                      borderBottomWidth: 0.5,
                      borderColor: "#ccc",
                    }}
                    onPress={() => {
                      setSelectedCountry(item);
                      setModalVisible(false);
                    }}
                  >
                    <Text
                      style={{
                        fontSize: responsiveFontSize(2.5),
                        marginRight: responsiveWidth(3),
                      }}
                    >
                      {item.flag}
                    </Text>

                    <Text style={{ fontSize: responsiveFontSize(2) }}>
                      {item.name}
                    </Text>

                    <Text
                      style={{
                        fontSize: responsiveFontSize(2),
                        marginLeft: "auto",
                      }}
                    >
                      {item.code}
                    </Text>
                  </TouchableOpacity>
                )}
              />
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;
