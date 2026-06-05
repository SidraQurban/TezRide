import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Modal,
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

// ── Helpers ────────────────────────────────────────────────────────────────

const TRANSACTION_META = {
  1: { label: "Top Up",        icon: "add-circle",      color: "#10B981" },
  2: { label: "Ride Payment",  icon: "car-sport",       color: "#EF4444" },
  3: { label: "Refund",        icon: "arrow-undo",      color: "#10B981" },
  4: { label: "Commission",    icon: "cash",            color: "#F59E0B" },
  5: { label: "Withdrawal",    icon: "arrow-down",      color: "#EF4444" },
  6: { label: "Transfer",      icon: "swap-horizontal", color: "#6366F1" },
  7: { label: "Reservation",   icon: "lock-closed",     color: "#F59E0B" },
};

const TRANSACTION_STATUS = {
  1: { label: "Pending",   color: "#F59E0B" },
  2: { label: "Completed", color: "#10B981" },
  3: { label: "Failed",    color: "#EF4444" },
};

const getTransactionStatus = (status) =>
  TRANSACTION_STATUS[status] || { label: "Unknown", color: "#6B7280" };

const getTransactionMeta = (type) =>
  TRANSACTION_META[type] || { label: "Transaction", icon: "receipt", color: "#6B7280" };

const isCredit = (type) => [1, 3].includes(type); // Topup, Refund

const formatDate = (dateStr) => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now - d;
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMs / 3600000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;

  return d.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: d.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  });
};

// ── Component ──────────────────────────────────────────────────────────────

const WalletScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = false; // RTL disabled — layout is always LTR

  const [loading, setLoading] = useState(true);
  const [balanceData, setBalanceData] = useState({ balance: 0, currency: "PKR" });
  const [refreshing, setRefreshing] = useState(false);

  const [transactions, setTransactions] = useState([]);
  const [txLoading, setTxLoading] = useState(true);
  const [txPage, setTxPage] = useState(1);
  const [txHasMore, setTxHasMore] = useState(true);
  const [txLoadingMore, setTxLoadingMore] = useState(false);

  const [selectedTx, setSelectedTx] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);

  // ── Fetch balance ──────────────────────────────────────────────────

  const fetchBalance = useCallback(async () => {
    try {
      const response = await customerService.getBalance();
      if (response.succeeded) {
        setBalanceData(response.data);
      }
    } catch (error) {
      console.error("Error fetching balance:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch transactions ─────────────────────────────────────────────

  const fetchTransactions = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setTxLoading(true);
      else setTxLoadingMore(true);

      const response = await customerService.getTransactions(page, 15);

      // The backend returns a PagedResponse with .data (array) and .totalCount
      const items = response?.data || [];
      // Use response properties directly from the provided format
      const hasNext = response?.hasNextPage ?? false;

      if (append) {
        setTransactions((prev) => [...prev, ...items]);
      } else {
        setTransactions(items);
      }

      setTxPage(page);
      setTxHasMore(hasNext);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setTxLoading(false);
      setTxLoadingMore(false);
    }
  }, []);

  // ── Initial load ───────────────────────────────────────────────────

  useEffect(() => {
    fetchBalance();
    fetchTransactions(1);
  }, []);

  // ── Pull to refresh ────────────────────────────────────────────────

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchBalance(), fetchTransactions(1)]);
    setRefreshing(false);
  }, [fetchBalance, fetchTransactions]);

  // ── Load more ──────────────────────────────────────────────────────

  const onLoadMore = useCallback(() => {
    if (!txLoadingMore && txHasMore) {
      fetchTransactions(txPage + 1, true);
    }
  }, [txLoadingMore, txHasMore, txPage, fetchTransactions]);

  // ── Render single transaction ──────────────────────────────────────

  const renderTransaction = (item) => {
    const meta = getTransactionMeta(item.type);
    const credit = isCredit(item.type);
    const amountColor = credit ? "#10B981" : "#EF4444";
    const sign = credit ? "+" : "-";

    return (
      <TouchableOpacity 
        key={item.id} 
        style={styles.txRow}
        onPress={() => {
          setSelectedTx(item);
          setModalVisible(true);
        }}
      >
        <View style={[styles.txIconBox, { backgroundColor: meta.color + "15" }]}>
          <Ionicons name={meta.icon} size={20} color={meta.color} />
        </View>

        <View style={styles.txDetails}>
          <Text style={styles.txLabel} numberOfLines={1}>{meta.label}</Text>
          <Text style={styles.txDesc} numberOfLines={1}>
            {item.description || meta.label}
          </Text>
        </View>

        <View style={styles.txRight}>
          <Text style={[styles.txAmount, { color: amountColor }]}>
            {sign} {item.currency || "PKR"} {Math.abs(item.amount).toLocaleString()}
          </Text>
          <Text style={styles.txDate}>{formatDate(item.createdAt)}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  // ── Render ─────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader isRtlIcon={false} />

      {/* Page title */}
      <View style={[styles.pageTitleRow, { alignItems: "flex-start" }]}>
        <Text style={[styles.pageTitle, { textAlign: "left" }]}>
          {t("wallet", "Wallet")}
        </Text>
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
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={[styles.balanceCard, { flexDirection: "row" }]}
        >
          <View style={{ alignItems: "flex-start" }}>
            <Text style={[styles.balanceLabel, { textAlign: "left" }]}>
              {t("total_balance", "Total Balance")}
            </Text>
            {loading && !refreshing ? (
              <ActivityIndicator color="#fff" style={{ marginTop: 10 }} />
            ) : (
              <Text style={[styles.balanceAmount, { textAlign: "left" }]}>
                {`${balanceData.currency} ${balanceData.balance.toLocaleString()}`}
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
            onPress={() => {/* Scroll to transactions */}}
          >
            <View style={styles.actionIconBox}>
              <Ionicons name="list-outline" size={24} color={COLORS.primary} />
            </View>
            <Text style={styles.actionText}>{t("transactions", "Transactions")}</Text>
          </TouchableOpacity>
        </View>

        {/* ── Transactions Section ──────────────────────────────────── */}
        <View style={[styles.sectionHeader, { alignItems: "flex-start" }]}>
          <Text style={[styles.sectionTitle, { textAlign: "left" }]}>
            {t("recent_activity", "Recent Activity")}
          </Text>
        </View>

        {txLoading ? (
          <View style={styles.emptyActivity}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : transactions.length === 0 ? (
          <View style={styles.emptyActivity}>
            <Ionicons name="receipt-outline" size={40} color="#ccc" />
            <Text style={[styles.emptyText, { textAlign: "center" }]}>
              {t("no_recent_activity", "No recent activity")}
            </Text>
          </View>
        ) : (
          <View style={styles.txList}>
            {transactions.map(renderTransaction)}

            {txHasMore && (
              <TouchableOpacity
                style={styles.loadMoreBtn}
                onPress={onLoadMore}
                disabled={txLoadingMore}
              >
                {txLoadingMore ? (
                  <ActivityIndicator size="small" color={COLORS.primary} />
                ) : (
                  <Text style={styles.loadMoreText}>
                    {t("load_more", "Load More")}
                  </Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* ── Transaction Detail Modal ───────────────────────────────── */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{t("transaction_details", "Transaction Details")}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            {selectedTx && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.modalBody}>
                  {/* Amount highlight */}
                  <View style={styles.modalAmountBox}>
                    <Text style={[styles.modalAmountValue, { color: isCredit(selectedTx.type) ? "#10B981" : "#EF4444" }]}>
                      {isCredit(selectedTx.type) ? "+" : "-"} {selectedTx.currency} {Math.abs(selectedTx.amount).toLocaleString()}
                    </Text>
                    <View style={[styles.statusBadge, { backgroundColor: getTransactionStatus(selectedTx.status).color + "20" }]}>
                      <Text style={[styles.statusBadgeText, { color: getTransactionStatus(selectedTx.status).color }]}>
                        {getTransactionStatus(selectedTx.status).label}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailList}>
                    <DetailItem 
                      label={t("type", "Type")} 
                      value={getTransactionMeta(selectedTx.type).label} 
                      icon={getTransactionMeta(selectedTx.type).icon}
                    />
                    <DetailItem 
                      label={t("description", "Description")} 
                      value={selectedTx.description || "N/A"} 
                      isDescription={true}
                    />
                    <DetailItem 
                      label={t("reference_id", "Reference ID")} 
                      value={selectedTx.referenceId} 
                      isCopyable={true}
                    />
                    <DetailItem 
                      label={t("date", "Date")} 
                      value={new Date(selectedTx.createdAt).toLocaleString()} 
                    />
                    {selectedTx.completedAt && (
                      <DetailItem 
                        label={t("completed_at", "Completed At")} 
                        value={new Date(selectedTx.completedAt).toLocaleString()} 
                      />
                    )}
                    <DetailItem 
                      label={t("transaction_id", "Transaction ID")} 
                      value={selectedTx.id} 
                    />
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const DetailItem = ({ label, value, icon, isDescription, isCopyable }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}</Text>
    <View style={styles.detailValueRow}>
      {icon && <Ionicons name={icon} size={16} color="#6B7280" style={{ marginRight: 6 }} />}
      <Text style={[styles.detailValue, isDescription && { fontSize: 14, color: "#4B5563" }]}>
        {value}
      </Text>
    </View>
  </View>
);

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

  /* ── Transaction Items ──────────────────────────────────────── */
  txList: {
    gap: 2,
  },
  txRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#F5F5F5",
  },
  txIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  txDetails: {
    flex: 1,
    marginRight: 8,
  },
  txLabel: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.semiBold,
    color: "#1F2937",
  },
  txDesc: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "#9CA3AF",
    marginTop: 2,
  },
  txRight: {
    alignItems: "flex-end",
  },
  txAmount: {
    fontSize: responsiveFontSize(1.7),
    fontFamily: FONTS.bold,
  },
  txDate: {
    fontSize: responsiveFontSize(1.2),
    fontFamily: FONTS.regular,
    color: "#9CA3AF",
    marginTop: 2,
  },
  loadMoreBtn: {
    alignItems: "center",
    paddingVertical: 16,
    marginTop: 8,
  },
  loadMoreText: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.semiBold,
    color: COLORS.primary,
  },

  /* ── Modal Styles ─────────────────────────────────────────── */
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    minHeight: responsiveHeight(50),
    maxHeight: responsiveHeight(85),
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalTitle: {
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  modalBody: {
    paddingHorizontal: 25,
    paddingTop: 20,
  },
  modalAmountBox: {
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 20,
    paddingVertical: 25,
    marginBottom: 25,
  },
  modalAmountValue: {
    fontSize: responsiveFontSize(3.5),
    fontFamily: FONTS.bold,
    marginBottom: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeText: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.bold,
    textTransform: "capitalize",
  },
  detailList: {
    gap: 20,
  },
  detailItem: {
    gap: 4,
  },
  detailLabel: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.medium,
    color: "#9CA3AF",
  },
  detailValueRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailValue: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.semiBold,
    color: "#1F2937",
    flexShrink: 1,
  },
});

export default WalletScreen;
