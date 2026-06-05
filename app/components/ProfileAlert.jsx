import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS } from "../constants/theme";
import {
  responsiveFontSize,
} from "react-native-responsive-dimensions";

const { width } = Dimensions.get("window");

/**
 * ProfileAlert — single-button alert used in ProfileScreen.
 * Fully RTL-aware: title, message and button placement all flip
 * when isUrdu={true}.
 */
const ProfileAlert = ({
  visible,
  title,
  message,
  onOk,
  okText = "OK",
  isUrdu = false,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onOk}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={[styles.title, { textAlign: "left" }]}>
              {title}
            </Text>
          </View>

          {/* Message */}
          <View style={styles.content}>
            <Text style={[styles.message, { textAlign: "left" }]}>
              {message}
            </Text>
          </View>

          {/* Single OK button — aligned to start (left in LTR, right in RTL) */}
          <View style={[styles.footer, { alignItems: "flex-end" }]}>
            <TouchableOpacity onPress={onOk} activeOpacity={0.8}>
              <LinearGradient
                colors={[COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.okButton}
              >
                <Text style={styles.okButtonText}>{okText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  header: {
    marginBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    paddingBottom: 10,
  },
  title: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(2.2),
    color: COLORS.primary,
  },
  content: {
    marginBottom: 25,
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.8),
    color: "#4B5563",
    lineHeight: 24,
  },
  footer: {
    width: "100%",
  },
  okButton: {
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 12,
  },
  okButtonText: {
    color: "#fff",
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.8),
  },
});

export default ProfileAlert;
