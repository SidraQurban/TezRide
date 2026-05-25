import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Switch } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants";

const Settings = ({ navigation }) => {
  const { t, i18n } = useTranslation();

  const SettingItem = ({ icon, label, onPress, value, type = "link" }) => (
    <TouchableOpacity 
      style={styles.settingItem} 
      onPress={onPress}
      disabled={type === "switch"}
    >
      <View style={styles.settingItemLeft}>
        <View style={styles.iconBox}>
          <Ionicons name={icon} size={22} color={COLORS.primary} />
        </View>
        <Text style={styles.settingLabel}>{label}</Text>
      </View>
      {type === "link" ? (
        <Ionicons name="chevron-forward" size={20} color="#ccc" />
      ) : (
        <Switch 
          value={value} 
          onValueChange={onPress}
          trackColor={{ false: "#eee", true: COLORS.primary }}
          thumbColor={value ? "#fff" : "#f4f3f4"}
        />
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.openDrawer()}>
          <Ionicons name="menu-outline" size={30} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("settings", "Settings")}</Text>
        <View style={{ width: 30 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Account Section */}
        <Text style={styles.sectionTitle}>{t("account", "Account")}</Text>
        <View style={styles.sectionBox}>
          <SettingItem 
            icon="person-outline" 
            label={t("profile", "Profile")} 
            onPress={() => {}} 
          />
          <SettingItem 
            icon="card-outline" 
            label={t("payment_methods", "Payment Methods")} 
            onPress={() => {}} 
          />
        </View>

        {/* App Settings */}
        <Text style={styles.sectionTitle}>{t("app_settings", "App Settings")}</Text>
        <View style={styles.sectionBox}>
          <SettingItem 
            icon="globe-outline" 
            label={t("language", "Language")} 
            onPress={() => {}} 
          />
          <SettingItem 
            icon="moon-outline" 
            label={t("dark_mode", "Dark Mode")} 
            type="switch"
            value={false}
            onPress={() => {}} 
          />
        </View>

        {/* Support & Legal */}
        <Text style={styles.sectionTitle}>{t("more", "More")}</Text>
        <View style={styles.sectionBox}>
          <SettingItem 
            icon="help-circle-outline" 
            label={t("help_support", "Help & Support")} 
            onPress={() => {}} 
          />
          <SettingItem 
            icon="document-text-outline" 
            label={t("terms_conditions", "Terms & Conditions")} 
            onPress={() => {}} 
          />
          <SettingItem 
            icon="shield-checkmark-outline" 
            label={t("privacy_policy", "Privacy Policy")} 
            onPress={() => {}} 
          />
        </View>

        <TouchableOpacity style={styles.deleteAccount}>
          <Text style={styles.deleteText}>{t("delete_account", "Delete Account")}</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(2),
  },
  headerTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(5),
    paddingBottom: responsiveHeight(5),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.bold,
    color: "#999",
    marginTop: responsiveHeight(3),
    marginBottom: responsiveHeight(1.5),
    paddingLeft: 5,
  },
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 15,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#f9f9f9",
  },
  settingItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 35,
    height: 35,
    borderRadius: 8,
    backgroundColor: "rgba(255, 107, 0, 0.05)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  settingLabel: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  deleteAccount: {
    marginTop: responsiveHeight(5),
    alignItems: "center",
    padding: 15,
  },
  deleteText: {
    color: "#FF3B30",
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.7),
  },
});

export default Settings;
