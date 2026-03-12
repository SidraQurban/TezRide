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
import { COLORS, SIZES } from "../constants";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";

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

  // Check if 11 digits entered
  const isPhoneComplete = phone.length === 10;

  const handlePhoneChange = (text) => {
    // Allow only numbers & max 11 digits
    const cleaned = text.replace(/[^0-9]/g, "");
    if (cleaned.length <= 11) {
      setPhone(cleaned);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <View
        style={{ flex: 1, alignItems: "center", paddingHorizontal: SIZES.base }}
      >
        {/* Logo */}
        <Image
          source={require("../../assets/logo.png")}
          resizeMode="contain"
          style={{ height: responsiveHeight(20), width: responsiveWidth(80) }}
        />

        {/* Text Section */}
        <View style={{ alignItems: "center", marginTop: responsiveHeight(-2) }}>
          <Text
            style={{
              fontSize: responsiveFontSize(2.3),
              fontWeight: "450",
              textAlign: "center",
            }}
          >
            Enter your number to
          </Text>
          <Text
            style={{
              fontSize: responsiveFontSize(2.3),
              fontWeight: "450",
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
            borderRadius: 10,
            paddingHorizontal: 10,
            height: responsiveHeight(6),
            width: responsiveWidth(85),
          }}
        >
          {/* Country Code Picker */}
          <View
            style={{
              height: responsiveWidth(15),
              justifyContent: "center",
              alignItems: "center",
              marginRight: responsiveWidth(2),
            }}
          >
            <View style={{ flexDirection: "row" }}>
              <Text style={{ fontSize: responsiveFontSize(2.5) }}>
                {selectedCountry.flag}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(true)}>
                <Ionicons
                  name="caret-down"
                  color={COLORS.primary}
                  style={{
                    marginLeft: responsiveWidth(2),
                    fontSize: responsiveFontSize(2.4),
                  }}
                />
              </TouchableOpacity>
            </View>
          </View>

          <View
            style={{
              width: 0.4,
              height: responsiveHeight(4.5),
              backgroundColor: COLORS.num,
            }}
          />

          <Text
            style={{
              color: COLORS.primary,
              fontWeight: "bold",
              marginLeft: responsiveWidth(3),
              fontSize: responsiveFontSize(2),
            }}
          >
            {selectedCountry.code}
          </Text>

          {/* Phone Number Input */}
          <TextInput
            style={{
              flex: 1,
              fontSize: responsiveFontSize(2),
              color: isPhoneComplete ? COLORS.primary : COLORS.black,
              marginLeft: responsiveWidth(2),
            }}
            placeholder="3XXXXXXXXXX"
            placeholderTextColor={COLORS.num}
            keyboardType="number-pad"
            value={phone}
            onChangeText={handlePhoneChange}
            maxLength={11}
          />
        </View>

        {/* Privacy policy */}
        <View style={{ marginTop: responsiveHeight(45) }}>
          <Text style={{ color: "#adb5bd", textDecorationLine: "underline" }}>
            Privacy Policy
          </Text>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          disabled={!isPhoneComplete}
          onPress={() =>
            navigation.navigate("VerifyCode", {
              phoneNumber: `${selectedCountry.code} ${phone}`,
            })
          }
          style={{
            backgroundColor: COLORS.primary,
            opacity: isPhoneComplete ? 1 : 0.4,
            marginTop: responsiveHeight(2),
            width: responsiveWidth(85),
            height: responsiveWidth(16),
            borderRadius: responsiveWidth(10),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={{
              width: responsiveWidth(85),
              height: responsiveWidth(16),
              borderRadius: responsiveWidth(10),
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Ionicons
              name="checkmark-sharp"
              style={{
                fontSize: responsiveFontSize(5),
                color: COLORS.white,
              }}
            />
          </LinearGradient>
        </TouchableOpacity>

        {/* Country Selection Modal */}
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
                width: responsiveWidth(80),
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
