import React from "react";
import { View, TextInput, TouchableOpacity } from "react-native";
import { Ionicons, Feather } from "@expo/vector-icons";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveWidth,
  responsiveHeight,
} from "react-native-responsive-dimensions";

const SearchInput = ({ search, setSearch }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#EFEFF4",
        borderRadius: 12,
        paddingHorizontal: 12,
        height: 45,
        marginVertical: 10,
        borderWidth: 1,
        borderColor: "#ddd",
      }}
    >
      <Ionicons name="search" size={18} color="#999" />
      <TextInput
        placeholder="Search"
        placeholderTextColor="#999"
        value={search}
        onChangeText={setSearch}
        style={{
          flex: 1,
          marginLeft: 8,
          fontFamily: FONTS.regular,
          height: 45,
          paddingVertical: 0,
        }}
      />
      <Feather name="sliders" size={18} color={COLORS.primary} />
    </View>
  );
};

export default SearchInput;
