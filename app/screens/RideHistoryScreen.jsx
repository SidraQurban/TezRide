import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTranslation } from "react-i18next";
import { DrawerActions } from "@react-navigation/native";
import {
  responsiveFontSize,
  responsiveHeight,
  responsiveWidth,
} from "react-native-responsive-dimensions";
import { COLORS, FONTS } from "../constants";
import customerService from "../api/customerService";

const RideHistoryScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = async (page = 1) => {
    try {
      const response = await customerService.getRideHistory(page, 10);
      if (response.succeeded) {
        if (page === 1) {
          setRides(response.data);
        } else {
          setRides((prev) => [...prev, ...response.data]);
        }
        setHasMore(response.hasNextPage);
      }
    } catch (error) {
      console.error("Error fetching ride history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
      <View style={styles.rideHeader}>
        <View style={styles.vehicleInfo}>
          <Ionicons name="car-outline" size={24} color={COLORS.primary} />
          <Text style={styles.vehicleText}>{item.vehicleType || t("ride")}</Text>
        </View>
        <Text style={styles.ridePrice}>
          {item.currency} {item.fare}
        </Text>
      </View>
      
      <View style={styles.addressContainer}>
        <View style={styles.dotLineBox}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <View style={styles.line} />
          <View style={[styles.dot, { backgroundColor: COLORS.error }]} />
        </View>
        <View style={styles.addressBox}>
          <Text style={styles.addressText} numberOfLines={1}>{item.pickupAddress}</Text>
          <Text style={styles.addressText} numberOfLines={1}>{item.destinationAddress}</Text>
        </View>
      </View>

      <View style={styles.rideFooter}>
        <Text style={styles.dateText}>{item.createdAt ? new Date(item.createdAt).toLocaleDateString() : ""}</Text>
        <View style={[styles.statusBadge, { backgroundColor: item.status === 'Completed' ? 'rgba(0,255,0,0.1)' : 'rgba(255,0,0,0.1)' }]}>
          <Text style={[styles.statusText, { color: item.status === 'Completed' ? '#2ecc71' : '#e74c3c' }]}>
            {item.status}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}>
          <Ionicons name="menu-outline" size={30} color={COLORS.black} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t("ride_history", "Ride History")}</Text>
        <View style={{ width: 30 }} />
      </View>

      {loading && pageIndex === 1 ? (
        <View style={styles.loadingCenter}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : rides.length === 0 ? (
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
              setPageIndex(prev => prev + 1);
              fetchHistory(pageIndex + 1);
            }
          }}
          onEndReachedThreshold={0.5}
          ListFooterComponent={loading && <ActivityIndicator color={COLORS.primary} style={{ margin: 20 }} />}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  vehicleInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  vehicleText: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.bold,
    marginLeft: 8,
    color: COLORS.black,
  },
  ridePrice: {
    fontSize: responsiveFontSize(1.8),
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  addressContainer: {
    flexDirection: "row",
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
    marginLeft: 10,
    gap: 15,
  },
  addressText: {
    fontSize: responsiveFontSize(1.4),
    fontFamily: FONTS.regular,
    color: "#666",
  },
  rideFooter: {
    flexDirection: "row",
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
});

export default RideHistoryScreen;
