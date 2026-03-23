import React, { useState } from "react";
import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
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

const SearchScreen = () => {
  const navigation = useNavigation();
  const [search, setSearch] = useState("");

  const filteredData = SearchData.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate("LocationDetails", { location: item })}
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
    <SafeAreaView style={{ flex: 1, backgroundColor: "#fff" }}>
      <View style={{ flex: 1 }}>
        {/* ✅ HEADER (MATCHED EXACTLY) */}
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: responsiveWidth(4),
            marginTop: responsiveHeight(2), // ✅ SAME as LocationDetails
            marginBottom: responsiveHeight(2),
          }}
        >
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons
              name="arrow-back"
              size={responsiveFontSize(2.5)}
              color={COLORS.primary}
            />
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
        </View>

        {/* SEARCH BAR */}
        <View style={{ paddingHorizontal: responsiveWidth(4) }}>
          <SearchInput search={search} setSearch={setSearch} />
        </View>

        {/* RESULT HEADER */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
            marginVertical: 10,
            paddingHorizontal: responsiveWidth(4),
          }}
        >
          <Text
            style={{
              fontSize: responsiveFontSize(1.7),
              fontFamily: FONTS.semiBold,
            }}
          >
            {filteredData.length} founds
          </Text>

          <TouchableOpacity onPress={() => setSearch("")}>
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

        {/* RESULTS */}
        <FlatList
          data={filteredData}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: responsiveWidth(4),
          }}
        />
      </View>
    </SafeAreaView>
  );
};

export default SearchScreen;
