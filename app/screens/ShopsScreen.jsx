import { Text, View } from "react-native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import BackBtn from "../components/BackBtn";
import { COLORS } from "../constants";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS } from "../constants/theme";

const ShopsScreen = () => {
  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: COLORS.background,
      }}
    >
      {/* MAIN CONTAINER */}
      <View style={{ flex: 1 }}>
        {/* BACK BUTTON */}
        <View
          style={{
            left: responsiveWidth(4),
            paddingBottom: responsiveHeight(1),
          }}
        >
          <BackBtn />
        </View>
        <View style={{ alignItems: "center" }}>
          <Text
            style={{
              marginTop: responsiveHeight(20),
              fontFamily: FONTS.bold,
              fontSize: responsiveFontSize(2),
            }}
          >
            Work in progress
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ShopsScreen;
