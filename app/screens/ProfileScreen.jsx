import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Alert,
  Image,
  Animated,
} from "react-native";
import { useRef } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants";
import authService from "../api/authService";
import storage from "../utils/storage";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import DateTimePicker from "@react-native-community/datetimepicker";
import { Platform } from "react-native";
import AppHeader from "../components/AppHeader";
import ImageSourceModal from "../components/ImageSourceModal";
import ProfileAlert from "../components/ProfileAlert";

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    title: "",
    message: "",
  });
  const [profile, setProfile] = useState({
    id: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    profilePictureUrl: "",
  });

  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 10,
    }).start();
  };

  const fetchProfile = async () => {
    try {
      const userId = await storage.getItem("userId");
      if (!userId) {
        showAlert(t("error"), "User ID not found. Please log in again.");
        return;
      }
      const response = await authService.getUserProfile(userId);
      if (response.succeeded) {
        const d = response.data;
        setProfile({
          id: d.id || "",
          firstName: d.firstName || "",
          lastName: d.lastName || "",
          phoneNumber: d.phoneNumber || "",
          gender: d.gender || "",
          dateOfBirth: d.dateOfBirth || "",
          profilePictureUrl: d.profilePictureUrl || "",
        });
        // Persist so CustomDrawer can show real name & photo
        if (d.firstName || d.lastName)
          await storage.setItem("customerName", `${d.firstName || ""} ${d.lastName || ""}`.trim());
        if (d.profilePictureUrl)
          await storage.setItem("profilePictureUrl", d.profilePictureUrl);
        if (d.phoneNumber)
          await storage.setItem("customerPhone", d.phoneNumber);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      showAlert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // ─── Image Picker ────────────────────────────────────────────────────────
  const handlePickImage = async () => {
    // Request permission
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      showAlert(
        t("error"),
        "Camera roll access is required to update your profile picture."
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true, // Request base64 so we can send it to server
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setUploadingImage(true);

    try {
      // Build a data URI so the server can store or process it
      const base64Uri = `data:image/jpeg;base64,${asset.base64}`;

      // Optimistically show the local URI in the UI for instant feedback
      setProfile((prev) => ({ ...prev, profilePictureUrl: asset.uri }));

      // Upload via profile update immediately so the change is persisted
      const updateData = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth || null,
        profilePictureUrl: base64Uri,
      };

      const response = await authService.updateProfile(updateData);
      if (response.succeeded) {
        // Keep the local URI displayed; server holds the base64 version
        await storage.setItem("profilePictureUrl", asset.uri);
        showAlert(t("success"), t("profile_pic_updated_success", "Profile picture updated!"));
      } else {
        // Revert on failure
        setProfile((prev) => ({
          ...prev,
          profilePictureUrl: profile.profilePictureUrl,
        }));
        showAlert(t("error"), response.message || t("something_went_wrong"));
      }
    } catch (err) {
      console.error("Image upload error:", err);
      showAlert(t("error"), t("something_went_wrong"));
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Camera option ───────────────────────────────────────────────────────
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      showAlert(t("error"), "Camera access is required to take a photo.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];
    setUploadingImage(true);

    try {
      const base64Uri = `data:image/jpeg;base64,${asset.base64}`;
      setProfile((prev) => ({ ...prev, profilePictureUrl: asset.uri }));

      const updateData = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth || null,
        profilePictureUrl: base64Uri,
      };

      const response = await authService.updateProfile(updateData);
      if (!response.succeeded) {
        showAlert(t("error"), response.message || t("something_went_wrong"));
      } else {
        await storage.setItem("profilePictureUrl", asset.uri);
        showAlert(t("success"), t("profile_pic_updated_success", "Profile picture updated!"));
      }
    } catch (err) {
      console.error("Camera upload error:", err);
      showAlert(t("error"), t("something_went_wrong"));
    } finally {
      setUploadingImage(false);
    }
  };

  // ─── Show bottom sheet options for image source ──────────────────────────
  const handleAvatarPress = () => {
    setShowImageModal(true);
  };

  // ─── Profile Update ───────────────────────────────────────────────────────
  const handleUpdate = async () => {
    if (!profile.firstName.trim() || !profile.lastName.trim()) {
      showAlert(t("error"), "First and Last name are required.");
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        id: profile.id,
        firstName: profile.firstName.trim(),
        lastName: profile.lastName.trim(),
        gender: profile.gender || null,
        dateOfBirth: profile.dateOfBirth || null,
        profilePictureUrl: profile.profilePictureUrl || null,
      };

      const response = await authService.updateProfile(updateData);
      if (response.succeeded) {
        showAlert(t("success"), t("profile_updated_success", "Profile updated successfully!"));
        const fullName = `${profile.firstName} ${profile.lastName}`.trim();
        await storage.setItem("customerName", fullName);
        if (profile.profilePictureUrl)
          await storage.setItem("profilePictureUrl", profile.profilePictureUrl);
      } else {
        showAlert(t("error"), response.message || t("something_went_wrong"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      showAlert(t("error"), t("something_went_wrong"));
    } finally {
      setUpdating(false);
    }
  };

  const showAlert = (title, message) => {
    setAlertConfig({
      visible: true,
      title,
      message,
    });
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader isRtlIcon={true} />

      {/* Page title row */}
      <View style={styles.pageTitleRow}>
        <Text style={styles.pageTitle}>{t("profile", "Profile")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <TouchableOpacity
            onPress={handleAvatarPress}
            style={styles.avatarBox}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : profile.profilePictureUrl ? (
              <Image
                source={{ uri: profile.profilePictureUrl }}
                style={styles.avatarImage}
              />
            ) : (
              <Ionicons name="person" size={60} color="#ccc" />
            )}

            {/* Camera badge */}
            <View style={styles.editBadge}>
              <Ionicons name="camera" size={16} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.phoneNumber}>
            {profile.phoneNumber?.startsWith("92") 
              ? `+92 ${profile.phoneNumber.substring(2)}` 
              : profile.phoneNumber}
          </Text>
          <Text style={styles.tapHint}>{t("tap_to_change", "Tap photo to change")}</Text>
        </View>

        {/* Form */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: "left" }]}>{t("first_name", "First Name")}</Text>
            <TextInput
              style={[styles.input, { textAlign: "left", writingDirection: "ltr" }]}
              value={profile.firstName}
              onChangeText={(t) => setProfile((p) => ({ ...p, firstName: t }))}
              placeholder={t("first_name")}
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: "left" }]}>{t("last_name", "Last Name")}</Text>
            <TextInput
              style={[styles.input, { textAlign: "left", writingDirection: "ltr" }]}
              value={profile.lastName}
              onChangeText={(t) => setProfile((p) => ({ ...p, lastName: t }))}
              placeholder={t("last_name")}
              placeholderTextColor="#bbb"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: "left" }]}>{t("gender", "Gender")}</Text>
            <View style={styles.genderRow}>
              {["Male", "Female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderOption,
                    profile.gender === g && styles.genderOptionActive,
                  ]}
                  onPress={() => setProfile((p) => ({ ...p, gender: g }))}
                  disabled={true}
                >
                  <Ionicons
                    name={g === "Male" ? "male" : "female"}
                    size={16}
                    color={profile.gender === g ? COLORS.primary : "#aaa"}
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.genderOptionText,
                      profile.gender === g && styles.genderOptionTextActive,
                    ]}
                  >
                    {t(g.toLowerCase())}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { textAlign: "left" }]}>{t("dob", "Date of Birth")}</Text>
            <TouchableOpacity
              style={[styles.input, { justifyContent: "center", alignItems: "flex-start" }]}
              onPress={() => setShowDatePicker(true)}
            >
              <Text style={{ color: profile.dateOfBirth ? COLORS.black : "#bbb", fontSize: 16 }}>
                {profile.dateOfBirth ? profile.dateOfBirth.split("T")[0] : "YYYY-MM-DD"}
              </Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={profile.dateOfBirth ? new Date(profile.dateOfBirth) : new Date()}
                mode="date"
                display="default"
                maximumDate={new Date()}
                onChange={(event, selectedDate) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (event.type === "set" && selectedDate) {
                    const localDate = new Date(selectedDate.getTime() - selectedDate.getTimezoneOffset() * 60000);
                    setProfile((p) => ({
                      ...p,
                      dateOfBirth: localDate.toISOString().split("T")[0],
                    }));
                  }
                }}
              />
            )}
          </View>
        </View>

        {/* Security note */}
        <View style={styles.infoBox}>
          <Ionicons
            name="shield-checkmark-outline"
            size={20}
            color="#15803d"
          />
          <Text style={styles.infoText}>
            {t("data_security_msg", "Your data is encrypted and protected following the highest security standards.")}
          </Text>
        </View>

        {/* Save Button */}
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity 
            activeOpacity={0.9}
            style={styles.updateButton} 
            onPress={handleUpdate}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={updating}
          >
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.gradientBtn}
            >
              {updating ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.btnText}>{t("save", "Save")}</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>
        </Animated.View>

      </ScrollView>

      <ImageSourceModal
        visible={showImageModal}
        onClose={() => setShowImageModal(false)}
        onCamera={handleTakePhoto}
        onGallery={handlePickImage}
        t={t}
      />

      <ProfileAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        onOk={() => setAlertConfig((prev) => ({ ...prev, visible: false }))}
        okText={t("ok_btn", "OK")}
        isUrdu={false}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  pageTitleRow: {
    paddingHorizontal: responsiveWidth(5),
    paddingVertical: responsiveHeight(1.5),
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  pageTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  saveBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: responsiveWidth(4),
    paddingVertical: responsiveHeight(0.7),
    borderRadius: 20,
    minWidth: responsiveWidth(14),
    alignItems: "center",
  },
  saveBtnText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.7),
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(5),
    paddingBottom: responsiveHeight(5),
  },
  // ─── Avatar ────────────────────────────────────────────────────
  avatarContainer: {
    alignItems: "center",
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(4),
  },
  avatarBox: {
    width: 115,
    height: 115,
    borderRadius: 58,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: COLORS.primary,
    position: "relative",
    overflow: "visible",
  },
  avatarImage: {
    width: 109,
    height: 109,
    borderRadius: 55,
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  phoneNumber: {
    marginTop: 12,
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.semiBold,
    color: "#555",
  },
  tapHint: {
    marginTop: 4,
    fontSize: responsiveFontSize(1.3),
    color: "#aaa",
    fontFamily: FONTS.regular,
  },
  // ─── Form ──────────────────────────────────────────────────────
  form: { gap: 20 },
  inputGroup: { gap: 8 },
  label: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.bold,
    color: COLORS.black,
    paddingLeft: 4,
  },
  input: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 13,
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.medium,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  genderRow: { flexDirection: "row", gap: 12 },
  genderOption: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F9FAFB",
  },
  genderOptionActive: {
    backgroundColor: "rgba(255, 92, 0, 0.08)",
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    fontFamily: FONTS.medium,
    color: "#aaa",
    fontSize: responsiveFontSize(1.6),
  },
  genderOptionTextActive: { color: COLORS.primary, fontFamily: FONTS.bold },
  // ─── Info & Button ─────────────────────────────────────────────
  infoBox: {
    marginTop: 30,
    flexDirection: "row",
    backgroundColor: "rgba(34, 197, 94, 0.07)",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    gap: 10,
  },
  infoText: {
    flex: 1,
    fontSize: responsiveFontSize(1.3),
    color: "#15803d",
    fontFamily: FONTS.regular,
    lineHeight: 18,
  },
  updateButton: { marginTop: 28 },
  gradientBtn: {
    height: 56,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.9),
    fontFamily: FONTS.bold,
  },
});

export default ProfileScreen;
