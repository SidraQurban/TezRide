import React from "react";
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
  const isRTL = i18n.language === "ur";

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} />}
      screenOptions={{
        headerShown: false,
        swipeEnabled: false,
        drawerStyle: {
          width: responsiveWidth(75),
          backgroundColor: 'transparent',
          borderTopRightRadius: 0,
          borderBottomRightRadius: 0,
        },
      }}
    >
      <Drawer.Screen name="Home" component={HomeScreen} />
      {/* <Drawer.Screen name="Booking" component={BookingScreen} /> */}
      {/* <Drawer.Screen name="ContactUs" component={ContactUsScreen} /> */}
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
