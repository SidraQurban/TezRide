import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS } from "../constants";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { FONTS } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { rideOptions } from "../data/data";
import { LinearGradient } from "expo-linear-gradient";

const RideOptions = () => {
  const navigation = useNavigation();
  const [selectedCar, setSelectedCar] = useState(null);
  const [promoCode, setPromoCode] = useState("");

  const selectedPrice = selectedCar
    ? rideOptions.find((c) => c.id === selectedCar).price
    : 0;
  const renderCarOption = ({ item }) => (
    <TouchableOpacity
      onPress={() => setSelectedCar(item.id)}
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "#fff",
        marginHorizontal: responsiveWidth(4),
        marginVertical: responsiveHeight(1),
        padding: responsiveWidth(4),
        borderRadius: responsiveWidth(3),
        elevation: 2,
      }}
    >
      {/* LEFT */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: responsiveWidth(12),
            height: responsiveWidth(12),
            borderRadius: responsiveWidth(6),
            backgroundColor: COLORS.secondary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {item.iconLib === "MaterialCommunityIcons" ? (
            <MaterialCommunityIcons name={item.icon} size={24} color="#fff" />
          ) : (
            <Ionicons name={item.icon} size={24} color="#fff" />
          )}
        </View>
        <View style={{ marginLeft: responsiveWidth(4) }}>
          <Text
            style={{
              fontFamily: FONTS.semiBold,
              fontSize: responsiveFontSize(2),
            }}
          >
            {item.type}
          </Text>
          <Text style={{ color: "gray", fontSize: responsiveFontSize(1.5) }}>
            {item.nearby} nearby
          </Text>
        </View>
      </View>

      {/* RIGHT */}
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Text
          style={{
            fontFamily: FONTS.semiBold,
            fontSize: responsiveFontSize(2),
          }}
        >
          Rs.{item.price}
        </Text>

        <View
          style={{
            width: responsiveWidth(5),
            height: responsiveWidth(5),
            borderRadius: responsiveWidth(2.5),
            borderWidth: 2,
            borderColor: selectedCar === item.id ? COLORS.secondary : "#ccc",
            marginLeft: responsiveWidth(2),
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {selectedCar === item.id && (
            <View
              style={{
                width: responsiveWidth(2.5),
                height: responsiveWidth(2.5),
                borderRadius: responsiveWidth(1.25),
                backgroundColor: COLORS.secondary,
              }}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
  return (
    <View>
      {/* CAR LIST */}
      <FlatList
        data={rideOptions}
        renderItem={renderCarOption}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: responsiveHeight(2) }}
      />
      {/* PROMO CODE */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(8),
        }}
      >
        <TextInput
          placeholder="Enter your promo code"
          value={promoCode}
          onChangeText={setPromoCode}
          style={{
            flex: 1,
            backgroundColor: "#fff",
            paddingHorizontal: responsiveWidth(4),
            paddingVertical: responsiveHeight(1.5),
            borderRadius: responsiveWidth(3),
            borderWidth: 1,
            borderColor: COLORS.num,
          }}
        />
        <TouchableOpacity
          onPress={() => navigation.navigate("Promo")}
          style={{
            marginLeft: responsiveWidth(2),
            width: responsiveWidth(12),
            height: responsiveWidth(12),
            borderRadius: responsiveWidth(6),
            backgroundColor: COLORS.secondary,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Ionicons name="add" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
      {/* distance+time+rs */}
      <View
        style={{
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(3),
          paddingBottom: responsiveHeight(2),
        }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: responsiveHeight(2),
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="location-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>4.5 Km</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="time-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>4 mins</Text>
          </View>

          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Ionicons name="card-outline" size={18} color="gray" />
            <Text style={{ marginLeft: 5, color: "gray" }}>
              Rs. {selectedPrice}.00
            </Text>
          </View>
        </View>
      </View>

      {/* Continue Button */}
      <View
        style={{
          paddingHorizontal: responsiveWidth(4),
          marginTop: responsiveHeight(3),
          paddingBottom: responsiveHeight(2),
        }}
      >
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => navigation.navigate("PaymentMethod")}
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
                color: "#fff",
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(2),
              }}
            >
              Continue
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default RideOptions;
