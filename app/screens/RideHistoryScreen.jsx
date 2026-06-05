import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  Modal,
  TouchableOpacity,
  ScrollView,
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
import AppHeader from "../components/AppHeader";

const RideHistoryScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const isRTL = false; // RTL disabled — layout is always LTR
  const [selectedRide, setSelectedRide] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = async (page = 1) => {
    try {
      if (page === 1) setLoading(true);
      const response = await customerService.getRideHistory(page, 10);
      if (response.succeeded && response.data) {
        const processedRides = response.data;

        if (page === 1) {
          setRides(processedRides);
        } else {
          // Filter out duplicates if any (safety check)
          setRides((prev) => {
             const existingIds = new Set(prev.map(r => r.id));
             const newRides = processedRides.filter(r => !existingIds.has(r.id));
             return [...prev, ...newRides];
          });
        }
        
        setHasMore(response.hasNextPage);
        setPageIndex(page);
      }
    } catch (error) {
      console.error("Error fetching ride history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(1);
  }, []);

  const getStatusText = (status) => {
    switch (status) {
      case 1: return t("assigned", "Assigned");
      case 2: return t("driver_arrived", "Arrived");
      case 3: return t("in_transit", "In Transit");
      case 4: return t("completed", "Completed");
      case 5: return t("cancelled_by_customer", "Cancelled");
      case 6: return t("cancelled_by_driver", "Cancelled by Driver");
      default: return t("unknown", "Unknown");
    }
  };

  const openRideDetails = (ride) => {
    setSelectedRide(ride);
    setModalVisible(true);
  };

  const RideDetailModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t("ride_details", "Ride Details")}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color={COLORS.black} />
            </TouchableOpacity>
          </View>

          {selectedRide && (
            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Status & Price Banner */}
              <View style={styles.detailBanner}>
                <View>
                  <Text style={styles.detailLabel}>{t("status", "Status")}</Text>
                  <Text style={[styles.detailValue, { 
                    color: selectedRide.status === 4 ? COLORS.success : 
                           (selectedRide.status === 5 || selectedRide.status === 6) ? COLORS.error : COLORS.primary 
                  }]}>
                    {getStatusText(selectedRide.status)}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={styles.detailLabel}>{t("total_fare", "Total Fare")}</Text>
                  <Text style={styles.detailPrice}>PKR {selectedRide.finalCost || 0}</Text>
                </View>
              </View>

              {/* Ride Path */}
              <View style={styles.detailSection}>
                <View style={styles.pathRow}>
                  <Ionicons name="location" size={20} color={COLORS.success} />
                  <View style={styles.pathTextContainer}>
                    <Text style={styles.pathLabel}>{t("pickup", "Pickup")}</Text>
                    <Text style={styles.pathValue}>{selectedRide.pickupAddress || t("unknown_location", "Unknown Location")}</Text>
                  </View>
                </View>
                
                <View style={styles.pathLine} />

                <View style={styles.pathRow}>
                  <Ionicons name="navigate" size={20} color={COLORS.error} />
                  <View style={styles.pathTextContainer}>
                    <Text style={styles.pathLabel}>{t("dropoff", "Dropoff")}</Text>
                    <Text style={styles.pathValue}>{selectedRide.dropoffAddress || t("unknown_location", "Unknown Location")}</Text>
                  </View>
                </View>
              </View>

              {/* Metrics Grid */}
              <View style={styles.metricsGrid}>
                <View style={styles.metricItem}>
                  <Ionicons name="speedometer-outline" size={20} color="#666" />
                  <Text style={styles.metricLabel}>{t("distance", "Distance")}</Text>
                  <Text style={styles.metricValue}>{selectedRide.distanceKm || 0} km</Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name="time-outline" size={20} color="#666" />
                  <Text style={styles.metricLabel}>{t("date", "Date")}</Text>
                  <Text style={styles.metricValue}>
                    {selectedRide.completedAt ? new Date(selectedRide.completedAt).toLocaleDateString() : 
                     selectedRide.assignedAt ? new Date(selectedRide.assignedAt).toLocaleDateString() : ""}
                  </Text>
                </View>
                <View style={styles.metricItem}>
                  <Ionicons name="car-outline" size={20} color="#666" />
                  <Text style={styles.metricLabel}>{t("vehicle", "Vehicle")}</Text>
                  <Text style={styles.metricValue}>{selectedRide.vehicleType?.toUpperCase()}</Text>
                </View>
              </View>

              {/* Timestamps */}
              <View style={styles.timeSection}>
                <View style={styles.timeRow}>
                  <Text style={styles.timeLabel}>{t("requested_at", "Requested at")}</Text>
                  <Text style={styles.timeValue}>
                    {selectedRide.assignedAt ? new Date(selectedRide.assignedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "--:--"}
                  </Text>
                </View>
                {selectedRide.completedAt && (
                   <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>{t("completed_at", "Completed at")}</Text>
                    <Text style={styles.timeValue}>
                      {new Date(selectedRide.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                )}
                {selectedRide.id && (
                  <View style={styles.timeRow}>
                    <Text style={styles.timeLabel}>{t("ride_id", "Ride ID")}</Text>
                    <Text style={[styles.timeValue, { fontSize: 10, color: '#ccc' }]}>{selectedRide.id}</Text>
                  </View>
                )}
              </View>

              <TouchableOpacity 
                style={styles.modalCloseButton} 
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>{t("close", "Close")}</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderRideItem = ({ item }) => (
    <TouchableOpacity 
      activeOpacity={0.7} 
      onPress={() => openRideDetails(item)}
      style={styles.rideItem}
    >
      <View style={[styles.rideHeader, { flexDirection: "row" }]}>
        <View style={[styles.vehicleInfo, { flexDirection: "row" }]}>
          <Ionicons name={item.vehicleType === 'bike' ? 'bicycle-outline' : 'car-outline'} size={24} color={COLORS.primary} />
          <Text style={[styles.vehicleText, { marginLeft: 8 }]}>{item.vehicleType?.toUpperCase() || t("ride")}</Text>
        </View>
        <Text style={[styles.ridePrice, { textAlign: "left" }]}>
          PKR {item.finalCost || item.fare || 0}
        </Text>
      </View>
      
      <View style={[styles.addressContainer, { flexDirection: "row", paddingLeft: 5 }]}>
        <View style={styles.dotLineBox}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <View style={styles.line} />
          <View style={[styles.dot, { backgroundColor: COLORS.error }]} />
        </View>
        <View style={[styles.addressBox, { marginLeft: 10, alignItems: "flex-start" }]}>
          <Text style={[styles.addressText, { textAlign: "left" }]} numberOfLines={1}>{item.pickupAddress || t("pickup_location", "Pickup Location")}</Text>
          <Text style={[styles.addressText, { textAlign: "left" }]} numberOfLines={1}>{item.dropoffAddress || item.destinationAddress || t("dropoff_location", "Dropoff Location")}</Text>
        </View>
      </View>

      <View style={[styles.rideFooter, { flexDirection: "row" }]}>
        <Text style={styles.dateText}>
          {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 
           item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : ""}
        </Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 4 ? 'rgba(0,255,0,0.1)' : 
                         (item.status === 5 || item.status === 6) ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,0,0.05)' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 4 ? '#2ecc71' : 
                   (item.status === 5 || item.status === 6) ? '#e74c3c' : '#999' 
          }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader isRtlIcon={false} />

      {/* Page title */}
      <View style={[styles.pageTitleRow, { alignItems: "flex-start" }]}>
        <Text style={[styles.pageTitle, { textAlign: "left" }]}>{t("ride_history", "Ride History")}</Text>
      </View>

      {loading && pageIndex === 1 ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (rides.length === 0 && !loading) ? (
        <View style={styles.emptyCenter}>
          <Ionicons name="car-sport-outline" size={80} color="#eee" />
          <Text style={styles.emptyText}>{t("no_rides_yet", "No rides found")}</Text>
        </View>
      ) : (
        <FlatList
          data={rides}
          renderItem={renderRideItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          onEndReached={() => {
            if (hasMore && !loading) {
              const next = pageIndex + 1;
              fetchHistory(next);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && pageIndex > 1 ? <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} /> : null}
        />
      )}

      <RideDetailModal />
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
  loadingCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  emptyText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.medium,
    color: "#ccc",
    marginTop: 10,
  },
  listContent: {
    paddingHorizontal: responsiveWidth(4),
    paddingBottom: responsiveHeight(5),
    paddingTop: 10,
  },
  rideItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  rideHeader: {
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  vehicleInfo: {
    alignItems: "center",
  },
  vehicleText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  ridePrice: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  addressContainer: {
    alignItems: "center",
    paddingLeft: 5,
  },
  dotLineBox: {
    alignItems: "center",
    width: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  line: {
    width: 1,
    height: 20,
    backgroundColor: "#eee",
    marginVertical: 4,
  },
  addressBox: {
    flex: 1,
    gap: 15,
  },
  addressText: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "#666",
  },
  rideFooter: {
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f9f9f9",
  },
  dateText: {
    fontSize: responsiveFontSize(1.4),
    color: "#999",
    fontFamily: FONTS.regular,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: responsiveFontSize(1.2),
    fontFamily: FONTS.bold,
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: "90%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  modalTitle: {
    fontSize: responsiveFontSize(2.2),
    fontFamily: FONTS.bold,
    color: COLORS.black,
  },
  closeBtn: {
    padding: 5,
  },
  detailBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 15,
    padding: 15,
    marginVertical: 20,
  },
  detailLabel: {
    fontSize: responsiveFontSize(1.4),
    color: "#999",
    fontFamily: FONTS.medium,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.bold,
  },
  detailPrice: {
    fontSize: responsiveFontSize(2),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  detailSection: {
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  pathRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  pathTextContainer: {
    marginLeft: 15,
    flex: 1,
  },
  pathLabel: {
    fontSize: responsiveFontSize(1.4),
    color: "#999",
    fontFamily: FONTS.bold,
    marginBottom: 2,
  },
  pathValue: {
    fontSize: responsiveFontSize(1.6),
    fontFamily: FONTS.regular,
    color: COLORS.black,
    lineHeight: 20,
  },
  pathLine: {
    width: 1,
    height: 30,
    backgroundColor: "#eee",
    marginLeft: 10,
    marginVertical: 2,
  },
  metricsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#eee",
    borderRadius: 15,
    padding: 15,
    marginBottom: 20,
  },
  metricItem: {
    alignItems: "center",
    flex: 1,
  },
  metricLabel: {
    fontSize: 10,
    color: "#999",
    marginTop: 5,
    fontFamily: FONTS.medium,
  },
  metricValue: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: FONTS.bold,
    marginTop: 2,
  },
  timeSection: {
    backgroundColor: "#fcfcfc",
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  timeLabel: {
    fontSize: 12,
    color: "#666",
    fontFamily: FONTS.medium,
  },
  timeValue: {
    fontSize: 12,
    color: COLORS.black,
    fontFamily: FONTS.bold,
  },
  modalCloseButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginTop: 10,
  },
  modalCloseButtonText: {
    color: COLORS.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
});

export default RideHistoryScreen;
