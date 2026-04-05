import React from "react";
import { View, I18nManager } from "react-native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import BookingScreen from "../screens/BookingScreen";
import ContactUsScreen from "../screens/ContactUsScreen";
import CustomDrawer from "../components/CustomDrawer";
import { useTranslation } from "react-i18next";
import { responsiveWidth } from "react-native-responsive-dimensions";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith("ur");

  const drawerPosition = isRTL && !I18nManager.isRTL ? "right" : "left";

  const HomeScreenWrapper = (props) => (
    <View style={{ flex: 1, direction: isRTL ? "rtl" : "ltr" }}>
      <HomeScreen {...props} />
    </View>
  );

  return (
    <Drawer.Navigator
      key={isRTL ? "urdu" : "english"}
      drawerContent={(props) => (
        <View style={{ flex: 1, direction: isRTL ? "rtl" : "ltr" }}>
          <CustomDrawer {...props} />
        </View>
      )}
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        drawerType: "front",
        drawerPosition: drawerPosition,
        drawerStyle: {
          width: responsiveWidth(75),
          backgroundColor: "transparent",
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreenWrapper} />
      {/* <Drawer.Screen name="Booking" component={BookingScreen} /> */}
      {/* <Drawer.Screen name="ContactUs" component={ContactUsScreen} /> */}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
