import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as ExpoLocation from "expo-location";
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
  const isRTL = i18n.language?.startsWith("ur");
  const [loading, setLoading] = useState(true);
  const [rides, setRides] = useState([]);
  const [pageIndex, setPageIndex] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchHistory = async (page = 1) => {
    try {
      setLoading(true);
      const response = await customerService.getRideHistory(page, 10);
      if (response.succeeded && response.data) {
        // Reverse geocode addresses if they are missing (null) from the API
        const processedRides = await Promise.all(
          response.data.map(async (ride) => {
            const updatedRide = { ...ride };
            
            // If addresses are null, convert coordinates
            if (!updatedRide.pickupAddress && updatedRide.pickupLat && updatedRide.pickupLon) {
              try {
                const geo = await ExpoLocation.reverseGeocodeAsync({
                  latitude: updatedRide.pickupLat,
                  longitude: updatedRide.pickupLon,
                });
                if (geo && geo.length > 0) {
                  const first = geo[0];
                  updatedRide.pickupAddress = [first.street, first.name, first.district, first.city].filter(Boolean).join(", ");
                }
              } catch (e) {
                updatedRide.pickupAddress = "Unknown Location";
              }
            }

            if (!updatedRide.dropoffAddress && updatedRide.dropoffLat && updatedRide.dropoffLon) {
              try {
                const geo = await ExpoLocation.reverseGeocodeAsync({
                  latitude: updatedRide.dropoffLat,
                  longitude: updatedRide.dropoffLon,
                });
                if (geo && geo.length > 0) {
                  const first = geo[0];
                  updatedRide.dropoffAddress = [first.street, first.name, first.district, first.city].filter(Boolean).join(", ");
                }
              } catch (e) {
                updatedRide.dropoffAddress = "Unknown Location";
              }
            }

            return updatedRide;
          })
        );

        if (page === 1) {
          setRides(processedRides);
        } else {
          setRides((prev) => [...prev, ...processedRides]);
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
      case 0: return "Requested";
      case 1: return "Accepted";
      case 2: return "Arrived";
      case 3: return "Started";
      case 4: return "Completed";
      case 5: return "Cancelled";
      default: return "Unknown";
    }
  };

  const renderRideItem = ({ item }) => (
    <View style={styles.rideItem}>
      <View style={[styles.rideHeader, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <View style={[styles.vehicleInfo, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
          <Ionicons name={item.vehicleType === 'bike' ? 'bicycle-outline' : 'car-outline'} size={24} color={COLORS.primary} />
          <Text style={[styles.vehicleText, { [isRTL ? "marginRight" : "marginLeft"]: 8 }]}>{item.vehicleType?.toUpperCase() || t("ride")}</Text>
        </View>
        <Text style={[styles.ridePrice, { textAlign: isRTL ? "right" : "left" }]}>
          PKR {item.finalCost || item.fare || 0}
        </Text>
      </View>
      
      <View style={[styles.addressContainer, { flexDirection: isRTL ? "row-reverse" : "row", paddingLeft: isRTL ? 0 : 5, paddingRight: isRTL ? 5 : 0 }]}>
        <View style={styles.dotLineBox}>
          <View style={[styles.dot, { backgroundColor: COLORS.success }]} />
          <View style={styles.line} />
          <View style={[styles.dot, { backgroundColor: COLORS.error }]} />
        </View>
        <View style={[styles.addressBox, { [isRTL ? "marginRight" : "marginLeft"]: 10, alignItems: isRTL ? "flex-end" : "flex-start" }]}>
          <Text style={[styles.addressText, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>{item.pickupAddress || "Fetching address..."}</Text>
          <Text style={[styles.addressText, { textAlign: isRTL ? "right" : "left" }]} numberOfLines={1}>{item.dropoffAddress || item.destinationAddress || "Fetching address..."}</Text>
        </View>
      </View>

      <View style={[styles.rideFooter, { flexDirection: isRTL ? "row-reverse" : "row" }]}>
        <Text style={styles.dateText}>
          {item.completedAt ? new Date(item.completedAt).toLocaleDateString() : 
           item.assignedAt ? new Date(item.assignedAt).toLocaleDateString() : ""}
        </Text>
        <View style={[styles.statusBadge, { 
          backgroundColor: item.status === 4 ? 'rgba(0,255,0,0.1)' : 
                         item.status === 5 ? 'rgba(255,0,0,0.1)' : 'rgba(0,0,0,0.05)' 
        }]}>
          <Text style={[styles.statusText, { 
            color: item.status === 4 ? '#2ecc71' : 
                   item.status === 5 ? '#e74c3c' : '#999' 
          }]}>
            {getStatusText(item.status)}
          </Text>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <AppHeader isRtlIcon={true} />

      {/* Page title */}
      <View style={[styles.pageTitleRow, { alignItems: isRTL ? "flex-end" : "flex-start" }]}>
        <Text style={[styles.pageTitle, { textAlign: isRTL ? "right" : "left" }]}>{t("ride_history", "Ride History")}</Text>
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
