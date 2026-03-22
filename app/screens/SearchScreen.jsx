import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Image,
  SafeAreaView,
} from "react-native";
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
        top: responsiveHeight(3),
      }}
    >
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          marginVertical: responsiveHeight(2),
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
      </View>

      {/* SEARCH BAR */}
      <SearchInput search={search} setSearch={setSearch} />

      {/* RESULT HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          marginVertical: 10,
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

      {/* EMPTY STATE OR RESULTS */}
      {filteredData.length === 0 ? (
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
              Sorry, the keyword you entered cannot be found, please check again
              or search with another keyword.
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
