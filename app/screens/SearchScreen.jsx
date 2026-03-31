import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { SearchData } from "../data/data";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import SearchInput from "../components/SearchInput";
import { SafeAreaView } from "react-native-safe-area-context";
import BackBtn from "../components/BackBtn";
import CurrentLocation from "../components/CurrentLocation";

const SearchScreen = () => {
  const navigation = useNavigation();
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const filteredData = SearchData.filter((item) =>
    item.name.toLowerCase().includes(destination.toLowerCase().trim()),
  );

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("ConfirmRide", { location: item })}
      style={{
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: responsiveHeight(1.2),
        borderBottomWidth: index !== filteredData.length - 1 ? 1 : 0,
        borderBottomColor: "#E5E5E5",
      }}
    >
      <View
        style={{
          width: responsiveWidth(11),
          height: responsiveWidth(11),
          borderRadius: responsiveWidth(6),
          backgroundColor: COLORS.secondary,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Ionicons name="location-sharp" size={18} color={COLORS.black} />
      </View>

      <View style={{ flex: 1, marginLeft: responsiveWidth(2) }}>
        <Text
          style={{
            fontSize: responsiveFontSize(1.8),
            fontFamily: FONTS.semiBold,
          }}
        >
          {item.name}
        </Text>
        <Text
          style={{
            fontSize: responsiveFontSize(1.5),
            color: "#666",
            marginTop: 2,
            fontFamily: FONTS.regular,
          }}
        >
          {item.address}
        </Text>
      </View>

      <Text
        style={{
          fontSize: responsiveFontSize(1.5),
          color: "#333",
          fontFamily: FONTS.regular,
        }}
      >
        {item.distance}
      </Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={{
        flex: 1,
        paddingHorizontal: responsiveWidth(4),
        backgroundColor: COLORS.background,
      }}
    >
      {/* HEADER */}
      {/* <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginTop: responsiveHeight(2),
          marginBottom: responsiveHeight(2),
        }}
      >
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={25} color={COLORS.primary} />
        </TouchableOpacity>

        <Text
          style={{
            fontSize: responsiveFontSize(2.2),
            fontFamily: FONTS.semiBold,
            marginLeft: responsiveWidth(4),
          }}
        >
          Search
        </Text>
      </View> */}
      <BackBtn />

      {/* SEARCH INPUT */}
      <SearchInput
        pickup={pickup}
        setPickup={setPickup}
        destination={destination}
        setDestination={setDestination}
      />
      {/* Current Location */}
      <CurrentLocation />

      {/* RESULT HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: responsiveHeight(2),
        }}
      >
        <Text
          style={{
            fontSize: responsiveFontSize(1.7),
            fontFamily: FONTS.semiBold,
          }}
        >
          {filteredData.length} results found
        </Text>

        <TouchableOpacity onPress={() => setDestination("")}>
          <Text
            style={{
              fontSize: responsiveFontSize(1.7),
              color: COLORS.primary,
              fontFamily: FONTS.regular,
            }}
          >
            Clear All
          </Text>
        </TouchableOpacity>
      </View>

      {/* EMPTY STATE OR RESULTS */}
      {destination.trim().length > 0 && filteredData.length === 0 ? (
        <View style={{ flex: 1 }}>
          <Image
            source={require("../../assets/notFound.png")}
            style={{
              width: responsiveHeight(70),
              height: responsiveHeight(25),
              resizeMode: "contain",
              alignSelf: "center",
              marginTop: responsiveHeight(5),
            }}
          />

          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Text
              style={{
                fontFamily: FONTS.semiBold,
                fontSize: responsiveFontSize(2),
                marginTop: responsiveHeight(5),
              }}
            >
              Not Found
            </Text>

            <Text
              style={{
                fontFamily: FONTS.regular,
                textAlign: "center",
                color: "#777",
              }}
            >
              Sorry, the keyword you entered cannot be found. Try another
              search.
            </Text>
          </View>
        </View>
      ) : (
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
};

export default SearchScreen;
