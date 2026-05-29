import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { COLORS, FONTS } from "../constants";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";

const { width, height } = Dimensions.get("window");

const ImageSourceModal = ({
  visible,
  onClose,
  onCamera,
  onGallery,
  t,
  isRTL,
}) => {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <View style={styles.container}>
              <View style={styles.indicator} />
              
              <Text style={[styles.title, { textAlign: isRTL ? "right" : "left" }]}>
                {t("update_profile_picture", "Update Profile Picture")}
              </Text>
              <Text style={[styles.subtitle, { textAlign: isRTL ? "right" : "left" }]}>
                {t("choose_source", "Choose a source")}
              </Text>

              <View style={[styles.optionsRow, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
                <TouchableOpacity
                  style={styles.optionBtn}
                  onPress={() => {
                    onClose();
                    onCamera();
                  }}
                >
                  <LinearGradient
                    colors={["#4F46E5", "#6366F1"]}
                    style={styles.iconContainer}
                  >
                    <Ionicons name="camera" size={30} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.optionText}>{t("camera", "Camera")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.optionBtn}
                  onPress={() => {
                    onClose();
                    onGallery();
                  }}
                >
                  <LinearGradient
                    colors={["#0EA5E9", "#38BDF8"]}
                    style={styles.iconContainer}
                  >
                    <Ionicons name="images" size={30} color="#fff" />
                  </LinearGradient>
                  <Text style={styles.optionText}>{t("gallery", "Gallery")}</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                <Text style={styles.cancelBtnText}>{t("cancel", "Cancel")}</Text>
              </TouchableOpacity>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  container: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 24,
    paddingTop: 12,
    paddingBottom: responsiveHeight(4),
    width: "100%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  indicator: {
    width: 40,
    height: 5,
    backgroundColor: "#E5E7EB",
    borderRadius: 3,
    alignSelf: "center",
    marginBottom: 20,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.2),
    color: COLORS.black,
    marginBottom: 6,
  },
  subtitle: {
    fontFamily: FONTS.medium,
    fontSize: responsiveFontSize(1.6),
    color: "#6B7280",
    marginBottom: 24,
  },
  optionsRow: {
    gap: 16,
    marginBottom: 24,
  },
  optionBtn: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  optionText: {
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.7),
    color: COLORS.black,
  },
  cancelBtn: {
    width: "100%",
    paddingVertical: 16,
    borderRadius: 15,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
  },
  cancelBtnText: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.8),
    color: "#EF4444",
  },
});

export default ImageSourceModal;
