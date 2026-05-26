import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
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
import customerService from "../api/customerService";
import { LinearGradient } from "expo-linear-gradient";
import AppHeader from "../components/AppHeader";

const WalletScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language?.startsWith("ur");
  const [loading, setLoading] = useState(true);
  const [balanceData, setBalanceData] = useState({ balance: 0, currency: "PKR" });
  const [refreshing, setRefreshing] = useState(false);

  const fetchBalance = async () => {
    try {
      const response = await customerService.getBalance();
      if (response.succeeded) {
        setBalanceData(response.data);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalance();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBalance();
  };

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader isRtlIcon={true} />

      {/* Page title */}
      <View style={[styles.pageTitleRow, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.pageTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("wallet", "Wallet")}</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Balance Card */}
        <LinearGradient
          colors={[COLORS.primary, COLORS.secondary]}
          start={{ x: isRTL ? 1 : 0, y: 0 }}
          end={{ x: isRTL ? 0 : 1, y: 0 }}
          style={[styles.balanceCard, { flexDirection: isRTL ? "row-reverse" : "row" }]}
        >
          <View style={{ alignItems: isRTL ? "flex-end" : "flex-start" }}>
            <Text style={[styles.balanceLabel, { textAlign: isRTL ? "right" : "left" }]}>{t("total_balance", "Total Balance")}</Text>
            {loading && !refreshing ? (
              <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
            ) : (
              <Text style={[styles.balanceAmount, { textAlign: isRTL ? "right" : "left" }]}>
                {isRTL ? `${balanceData.balance.toLocaleString()} ${balanceData.currency}` : `${balanceData.currency} ${balanceData.balance.toLocaleString()}`}
              </Text>
            )}
          </View>
          <Ionicons name="wallet-outline" size={50} color="rgba(255,255,255,0.3)" />
        </LinearGradient>

        {/* Quick Actions */}
        <View style={styles.actionsBox}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {/* Handle Top up */}}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="add-circle-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>{t("top_up", "Top Up")}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {/* Handle Transactions */}}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="list-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>{t("transactions", "Transactions")}</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Transactions Placeholder */}
        <View style={[styles.sectionHeader, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
          <Text style={[styles.sectionTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("recent_activity", "Recent Activity")}</Text>
        </View>
        
        <View style={styles.emptyActivity}>
          <Ionicons name="receipt-outline" size={40} color="#ccc" />
          <Text style={[styles.emptyText, { textAlign: "center" }]}>{t("no_recent_activity", "No recent activity")}</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
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

  scrollContent: {
    paddingHorizontal: responsiveWidth(5),
    paddingBottom: responsiveHeight(5),
  },
  balanceCard: {
    borderRadius: 20,
    padding: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: responsiveHeight(2),
    elevation: 5,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  balanceLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.medium,
  },
  balanceAmount: {
    color: "#fff",
    fontSize: responsiveFontSize(3.5),
    fontFamily: FONTS.bold,
    marginTop: 5,
  },
  actionsBox: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: responsiveHeight(4),
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 2,
  },
  actionButton: {
    alignItems: "center",
  },
  actionIconBox: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255, 107, 0, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  actionText: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.semiBold,
    color: COLORS.black,
  },
  sectionHeader: {
    marginTop: responsiveHeight(4),
    marginBottom: responsiveHeight(2),
  },
  sectionTitle: {
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  emptyActivity: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
  },
  emptyText: {
    marginTop: 10,
    color: "#999",
    fontFamily: FONTS.regular,
  },
});

export default WalletScreen;
