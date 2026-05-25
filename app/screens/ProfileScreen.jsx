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
import authService from "../api/authService";
import storage from "../utils/storage";
import { LinearGradient } from "expo-linear-gradient";

const ProfileScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState({
    id: "",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    gender: "",
    dateOfBirth: "",
    profilePictureUrl: "",
  });

  const fetchProfile = async () => {
    try {
      const userId = await storage.getItem("userId");
      if (!userId) {
        Alert.alert("Error", "User ID not found. Please log in again.");
        return;
      }
      const response = await authService.getUserProfile(userId);
      if (response.succeeded) {
        setProfile(response.data);
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleUpdate = async () => {
    if (!profile.firstName || !profile.lastName) {
      Alert.alert(t("error"), "First and Last name are required.");
      return;
    }

    setUpdating(true);
    try {
      const updateData = {
        id: profile.id,
        firstName: profile.firstName,
        lastName: profile.lastName,
        gender: profile.gender,
        dateOfBirth: profile.dateOfBirth,
        profilePictureUrl: profile.profilePictureUrl,
      };
      
      const response = await authService.updateProfile(updateData);
      if (response.succeeded) {
        Alert.alert(t("success"), "Profile updated successfully!");
        // Update local storage name if it changed
        await storage.setItem('customerName', `${profile.firstName} ${profile.lastName}`);
      } else {
        Alert.alert(t("error"), response.message || t("something_went_wrong"));
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      Alert.alert(t("error"), t("something_went_wrong"));
    } finally {
      setUpdating(false);
    }
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
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={28} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("profile", "Profile")}</Text>
        <TouchableOpacity onPress={handleUpdate} disabled={updating}>
          {updating ? (
            <ActivityIndicator size="small" color={COLORS.primary} />
          ) : (
            <Text style={styles.saveText}>{t("save", "Save")}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Picture Placeholder */}
        <View style={styles.avatarContainer}>
          <View style={styles.avatarBox}>
            {profile.profilePictureUrl ? (
              <Image source={{ uri: profile.profilePictureUrl }} style={styles.avatarImage} />
            ) : (
              <Ionicons name="person" size={60} color="#ccc" />
            )}
            <TouchableOpacity style={styles.editBadge}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.phoneNumber}>{profile.phoneNumber}</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("first_name", "First Name")}</Text>
            <TextInput
              style={styles.input}
              value={profile.firstName}
              onChangeText={(txt) => setProfile({ ...profile, firstName: txt })}
              placeholder={t("first_name")}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("last_name", "Last Name")}</Text>
            <TextInput
              style={styles.input}
              value={profile.lastName}
              onChangeText={(txt) => setProfile({ ...profile, lastName: txt })}
              placeholder={t("last_name")}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("gender", "Gender")}</Text>
            <View style={styles.genderRow}>
              {["Male", "Female"].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[
                    styles.genderOption,
                    profile.gender === g && styles.genderOptionActive,
                  ]}
                  onPress={() => setProfile({ ...profile, gender: g })}
                >
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
            <Text style={styles.label}>{t("dob", "Date of Birth")}</Text>
            <TextInput
              style={styles.input}
              value={profile.dateOfBirth ? profile.dateOfBirth.split('T')[0] : ""}
              onChangeText={(txt) => setProfile({ ...profile, dateOfBirth: txt })}
              placeholder="YYYY-MM-DD"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.infoBox}>
          <Ionicons name="shield-checkmark-outline" size={20} color={COLORS.success} />
          <Text style={styles.infoText}>
            Your data is encrypted and protected following the highest security standards.
          </Text>
        </View>

        <TouchableOpacity style={styles.updateButton} onPress={handleUpdate} disabled={updating}>
          <LinearGradient
            colors={[COLORS.primary, COLORS.secondary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.gradientBtn}
          >
            {updating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.btnText}>{t("update_profile", "Update Profile")}</Text>
            )}
          </LinearGradient>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
  saveText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.8),
  },
  scrollContent: {
    paddingHorizontal: responsiveWidth(5),
    paddingBottom: responsiveHeight(5),
  },
  avatarContainer: {
    alignItems: "center",
    marginTop: responsiveHeight(2),
    marginBottom: responsiveHeight(4),
  },
  avatarBox: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: "#E5E7EB",
  },
  avatarImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
  },
  editBadge: {
    position: "absolute",
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.primary,
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#fff",
  },
  phoneNumber: {
    marginTop: 10,
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.semiBold,
    color: "#777",
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
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
    paddingVertical: 12,
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.medium,
    color: COLORS.black,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  genderRow: {
    flexDirection: "row",
    gap: 15,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
  },
  genderOptionActive: {
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    borderColor: COLORS.primary,
  },
  genderOptionText: {
    fontFamily: FONTS.medium,
    color: "#777",
  },
  genderOptionTextActive: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  infoBox: {
    marginTop: 30,
    flexDirection: "row",
    backgroundColor: "rgba(34, 197, 94, 0.05)",
    padding: 15,
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
  updateButton: {
    marginTop: 30,
  },
  gradientBtn: {
    height: 56,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    elevation: 3,
  },
  btnText: {
    color: "#fff",
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.bold,
  },
});

export default ProfileScreen;
