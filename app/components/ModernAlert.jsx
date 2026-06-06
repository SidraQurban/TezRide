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
import { useTranslation } from "react-i18next";
import { CheckCircle2, AlertCircle, XCircle, Info, X } from "lucide-react-native";

const { width } = Dimensions.get("window");

const ModernAlert = ({ 
  visible, 
  title, 
  message, 
  onOk, 
  okText, 
  onCancel,
  cancelText,
  type = "info", // success, error, warning, info
  icon = null,
  onClose = null // Optional close button callback
}) => {
  const { t, i18n } = useTranslation();
  const isRTL = false; // Layout is always LTR
  
  const finalOkText = okText || t("ok_btn", "OK");
  const finalCancelText = cancelText || t("cancel_btn", "Cancel");
  
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
      onRequestClose={onClose || onCancel}
    >
      <TouchableOpacity 
        style={styles.overlay} 
        activeOpacity={1} 
        onPress={onClose || onCancel}
      >
        <TouchableOpacity activeOpacity={1} style={styles.container}>
          {/* Close Button at top-right */}
          <TouchableOpacity 
            onPress={onClose || onCancel}
            style={styles.closeBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={20} color="#9CA3AF" />
          </TouchableOpacity>

          {/* Icon Area */}
          <View style={styles.iconWrapper}>
            <View style={[styles.iconCircle, { backgroundColor: type === 'success' ? '#10B98115' : type === 'error' ? '#EF444415' : type === 'warning' ? '#F59E0B15' : COLORS.primary + '15' }]}>
               {icon ? icon : getIcon()}
            </View>
          </View>

          {/* Text Content */}
          <View style={styles.content}>
            <Text style={[styles.title, { textAlign: "center" }]}>{title}</Text>
            <Text style={[styles.message, { textAlign: "center" }]}>{message}</Text>
          </View>

          {/* Action Buttons */}
          <View style={styles.buttonContainer}>
            {onCancel && (
              <TouchableOpacity 
                onPress={onCancel} 
                style={styles.cancelBtn}
                activeOpacity={0.6}
              >
                <Text style={styles.cancelBtnText}>{finalCancelText}</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              onPress={onOk} 
              activeOpacity={0.8}
              style={{ flex: 1 }}
            >
              <LinearGradient
                colors={type === 'warning' ? ['#F59E0B', '#D97706'] : [COLORS.primary, COLORS.secondary]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.okButton}
              >
                <Text style={styles.okButtonText}>{finalOkText}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </TouchableOpacity>
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
  closeBtn: {
    position: 'absolute',
    top: 18,
    right: 18,
    zIndex: 10,
    backgroundColor: '#F9FAFB',
    padding: 6,
    borderRadius: 20
  }
});

export default ModernAlert;
