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
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { CheckCircle2, AlertCircle, XCircle, Info } from "lucide-react-native";

const { width } = Dimensions.get("window");

const ModernAlert = ({ 
  visible, 
  title, 
  message, 
  onOk, 
  okText = "OK", 
  onCancel,
  cancelText = "Cancel",
  type = "info" // success, error, warning, info
}) => {
  
  const getIcon = () => {
    const size = 60;
    switch (type) {
      case "success": return <CheckCircle2 size={size} color="#10B981" strokeWidth={1.5} />;
      case "error": return <XCircle size={size} color="#EF4444" strokeWidth={1.5} />;
      case "warning": return <AlertCircle size={size} color="#F59E0B" strokeWidth={1.5} />;
      default: return <Info size={size} color={COLORS.primary} strokeWidth={1.5} />;
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel || onOk}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Icon Area */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: type === 'success' ? '#10B98110' : type === 'error' ? '#EF444410' : type === 'warning' ? '#F59E0B10' : COLORS.primary + '10' }]}>
               {getIcon()}
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.content}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity 
                onPress={onCancel} 
                style={styles.cancelBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.cancelBtnText}>{cancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={onOk} 
              activeOpacity={0.8}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={type === 'error' ? ['#EF4444', '#DC2626'] : type === 'warning' ? ['#F59E0B', '#D97706'] : [COLORS.primary, COLORS.secondary]}
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
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: width * 0.85,
    backgroundColor: "#fff",
    borderRadius: 30,
    padding: 24,
    alignItems: "center",
    elevation: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 15,
  },
  iconWrapper: {
    marginTop: -10,
    marginBottom: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(2.4),
    color: "#1F2937",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: responsiveFontSize(1.8),
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 22,
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    gap: 12,
  },
  okButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  okButtonText: {
    color: "#fff",
    fontFamily: FONTS.bold,
    fontSize: responsiveFontSize(1.8),
  },
  cancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F3F4F6",
  },
  cancelBtnText: {
    color: "#4B5563",
    fontFamily: FONTS.semiBold,
    fontSize: responsiveFontSize(1.8),
  },
});

export default ModernAlert;
