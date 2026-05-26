import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Modal,
  I18nManager,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants";
import AppHeader from "../components/AppHeader";

const LANGUAGES = [
  { code: "en", label: "English", native: "English", flag: "🇬🇧" },
  { code: "ur", label: "Urdu", native: "اردو", flag: "🇵🇰" },
];

const Settings = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith("ur");
  const [langModalVisible, setLangModalVisible] = useState(false);

  const currentLang = LANGUAGES.find((l) => l.code === i18n.language) || LANGUAGES[0];

  const switchLanguage = (code) => {
    setLangModalVisible(false);
    if (code === i18n.language) return;

    i18n.changeLanguage(code);
    const isRtl = code === "ur";
    if (isRtl !== I18nManager.isRTL) {
      I18nManager.allowRTL(isRtl);
      I18nManager.forceRTL(isRtl);
    }
  };

  // ─── Reusable row ──────────────────────────────────────────────────────────
  const SettingItem = ({ icon, label, value, onPress, type = "link", last = false }) => (
    <TouchableOpacity
      style={[styles.settingItem, { flexDirection: isRTL ? "row-reverse" : "row" }, last && styles.settingItemLast]}
      onPress={onPress}
      disabled={type === "switch"}
      activeOpacity={0.7}
    >
      <View style={[styles.settingItemLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={[styles.iconBox, { [isRTL ? "marginLeft" : "marginRight"]: 14 }]}>
          <Ionicons name={icon} size={20} color={COLORS.primary} />
        </View>
        <Text style={[styles.settingLabel, { textAlign: isRTL ? "right" : "left" }]}>{label}</Text>
      </View>

      {type === "link" && (
        <View style={[styles.settingRight, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          {value ? <Text style={styles.settingValue}>{value}</Text> : null}
          <Ionicons name={isRTL ? "chevron-back" : "chevron-forward"} size={18} color="#ccc" />
        </View>
      )}
      {type === "switch" && (
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
      <AppHeader isRtlIcon={true} />

      {/* Page title */}
      <View style={[styles.pageTitleRow, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.pageTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("settings", "Settings")}</Text>
      </View>

      <View style={styles.contentArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
        {/* ── Account ─────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left", paddingRight: isRTL ? 4 : 0, paddingLeft: isRTL ? 0 : 4 }]}>{t("account", "Account")}</Text>
        <View style={styles.sectionBox}>
          <SettingItem
            icon="person-outline"
            label={t("profile", "Profile")}
            onPress={() => navigation.navigate("Profile")}
          />
          <SettingItem
            icon="card-outline"
            label={t("payment_methods", "Payment Methods")}
            onPress={() => {}}
            last
          />
        </View>

        {/* ── App Settings ─────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left", paddingRight: isRTL ? 4 : 0, paddingLeft: isRTL ? 0 : 4 }]}>{t("app_settings", "App Settings")}</Text>
        <View style={styles.sectionBox}>
          <SettingItem
            icon="globe-outline"
            label={t("language", "Language")}
            value={`${currentLang.flag} ${currentLang.native}`}
            onPress={() => setLangModalVisible(true)}
          />
          <SettingItem
            icon="moon-outline"
            label={t("dark_mode", "Dark Mode")}
            type="switch"
            value={false}
            onPress={() => {}}
            last
          />
        </View>

        {/* ── More ─────────────────────────────────────────────────── */}
        <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left", paddingRight: isRTL ? 4 : 0, paddingLeft: isRTL ? 0 : 4 }]}>{t("more", "More")}</Text>
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
            last
          />
        </View>

        <TouchableOpacity style={styles.deleteAccount}>
          <Text style={styles.deleteText}>{t("delete_account", "Delete Account")}</Text>
        </TouchableOpacity>
        </ScrollView>
      </View>

      {/* ── Language Modal ──────────────────────────────────────────── */}
      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setLangModalVisible(false)}
        >
          <View style={styles.modalCard}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
              <Text style={styles.modalTitle}>{t("language", "Language")}</Text>
              <TouchableOpacity onPress={() => setLangModalVisible(false)}>
                <Ionicons name="close" size={22} color="#555" />
              </TouchableOpacity>
            </View>

            {/* Language options */}
            {LANGUAGES.map((lang) => {
              const isSelected = i18n.language === lang.code;
              return (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.langOption,
                    { flexDirection: isRTL ? "row-reverse" : "row" },
                    isSelected && styles.langOptionActive,
                  ]}
                  onPress={() => switchLanguage(lang.code)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.langLeft, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                    <Text style={styles.langFlag}>{lang.flag}</Text>
                    <View style={{ alignItems: isRTL ? "flex-end" : "flex-start", marginHorizontal: 14 }}>
                      <Text
                        style={[
                          styles.langLabel,
                          isSelected && styles.langLabelActive,
                        ]}
                      >
                        {lang.label}
                      </Text>
                      <Text style={styles.langNative}>{lang.native}</Text>
                    </View>
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={COLORS.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  contentArea: { flex: 1, backgroundColor: "#F5F7FA" },
  pageTitleRow: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pageTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },

  scrollContent: {
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(5),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(1.5),
    fontFamily: FONTS.bold,
    color: "#999",
    marginTop: responsiveHeight(3),
    marginBottom: responsiveHeight(1.2),
    paddingLeft: 4,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sectionBox: {
    backgroundColor: "#fff",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  settingItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  settingItemLast: { borderBottomWidth: 0 },
  settingItemLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "rgba(255, 92, 0, 0.07)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  settingLabel: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.medium,
    color: COLORS.black,
  },
  settingRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  settingValue: {
    fontSize: responsiveFontSize(1.5),
    color: "#888",
    fontFamily: FONTS.regular,
  },
  deleteAccount: {
    marginTop: responsiveHeight(5),
    alignItems: "center",
    paddingVertical: 15,
  },
  deleteText: {
    color: "#FF3B30",
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.7),
  },

  // ─── Language Modal ───────────────────────────────────────────────────────
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: responsiveWidth(6),
  },
  modalCard: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 24,
    paddingTop: 16,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
  },
  modalTitle: {
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  langOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "transparent",
  },
  langOptionActive: {
    backgroundColor: "rgba(255, 92, 0, 0.06)",
    borderColor: COLORS.primary,
  },
  langLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  langFlag: { fontSize: 28 },
  langLabel: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  langLabelActive: { color: COLORS.primary },
  langNative: {
    fontSize: responsiveFontSize(1.4),
    color: "#888",
    fontFamily: FONTS.regular,
    marginTop: 2,
  },
});

export default Settings;
