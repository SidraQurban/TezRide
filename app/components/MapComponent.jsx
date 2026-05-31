import React, { useRef, useState, useEffect, useCallback, useMemo, memo } from "react";
import {
  StyleSheet, PermissionsAndroid, AppState, Animated,
  View, Image, Platform, TouchableOpacity, Text,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { PROVIDER_GOOGLE, Marker, AnimatedRegion } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import { COLORS } from "../constants";
import { responsiveFontSize, responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import * as ExpoLocation from "expo-location";
import { useRide } from "../context/RideContext";

const SILVER_MAP_STYLE = [
  { featureType: "administrative", elementType: "geometry.fill", stylers: [{ color: "#d6e2e6" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#cfd4d5" }] },
  { featureType: "administrative", elementType: "labels.text.fill", stylers: [{ color: "#7492a8" }] },
  { featureType: "landscape.man_made", elementType: "geometry.fill", stylers: [{ color: "#dde2e3" }] },
  { featureType: "landscape.natural", elementType: "geometry.fill", stylers: [{ color: "#dde2e3" }] },
  { featureType: "poi", elementType: "geometry.fill", stylers: [{ color: "#dde2e3" }] },
  { featureType: "poi", elementType: "labels.icon", stylers: [{ saturation: -100 }] },
  { featureType: "poi.park", elementType: "geometry.fill", stylers: [{ color: "#a9de83" }] },
  { featureType: "road", elementType: "labels.text.fill", stylers: [{ color: "#41626b" }] },
  { featureType: "road.arterial", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "road.highway", elementType: "geometry.fill", stylers: [{ color: "#c1d1d6" }] },
  { featureType: "road.highway", elementType: "geometry.stroke", stylers: [{ color: "#a6b5bb" }] },
  { featureType: "road.local", elementType: "geometry.fill", stylers: [{ color: "#ffffff" }] },
  { featureType: "water", elementType: "geometry.fill", stylers: [{ color: "#a6cbe3" }] },
];

const DEFAULT_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

/**
 * Mathematically computes the EXACT region needed so that both pickup and
 * destination are always visible above the bottom sheet.
 *
 * Key insight:
 *   - The bottom sheet covers ~40% of the map height.
 *   - Visible map area = top 60%.
 *   - We expand latDelta so the route fills 55% of the visible 60%.
 *   - We shift the centre SOUTH (decrease lat) so the route appears in
 *     the upper (visible) portion of the screen.
 *
 * This uses only animateToRegion — the only API that is 100% reliable
 * on both Android and iOS.
 */
const computeRegion = (pickup, destination) => {
  const minLat = Math.min(pickup.latitude, destination.latitude);
  const maxLat = Math.max(pickup.latitude, destination.latitude);
  const minLon = Math.min(pickup.longitude, destination.longitude);
  const maxLon = Math.max(pickup.longitude, destination.longitude);

  const rawLatSpan = maxLat - minLat;
  const rawLonSpan = maxLon - minLon;
  const MIN_SPAN   = 0.008;

  // 60% of map is visible (40% hidden by bottom sheet)
  const VISIBLE    = 0.60;
  // Route fills 55% of the visible area → comfortable padding
  const FILL       = 0.55;

  const latDelta = Math.max(rawLatSpan / (VISIBLE * FILL), MIN_SPAN * 3);
  const lonDelta = Math.max(rawLonSpan * 2.5, latDelta * 0.55, MIN_SPAN * 3);

  // Shift centre southward: shift = latDelta × (0.5 − VISIBLE/2)
  const shift = latDelta * (0.5 - VISIBLE / 2); // = latDelta × 0.20

  return {
    latitude:       (minLat + maxLat) / 2 - shift,
    longitude:      (minLon + maxLon) / 2,
    latitudeDelta:  latDelta,
    longitudeDelta: lonDelta,
  };
};

const MapComponent = memo(({
  pickup: propPickup,
  destination: propDestination,
  driverLocation,
  rideStatus,
  showMarkers      = true,
  showRoute        = true,
  showPickupMarker = false,
  useGlobalState   = false,
  onRouteReady,
  onPickupDragEnd,
  onDestinationDragEnd,
  waveDrivers      = [],
  selectedCategory = "bike",
  isSelectionMode  = false,
  selectionType    = "pickup",
  onLocationSelected,
  onEditPickup,
  onEditDestination,
  forcedRegion,
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const { routeCoords, pickup: ctxPickup, destination: ctxDestination } = useRide();

  const pickup      = propPickup      !== undefined ? propPickup      : (useGlobalState ? ctxPickup      : null);
  const destination = propDestination !== undefined ? propDestination : (useGlobalState ? ctxDestination : null);

  const [hasPermission,  setHasPermission]  = useState(false);
  const [centeredOnUser, setCenteredOnUser] = useState(false);
  const [mapReady,       setMapReady]       = useState(false);
  const [userLocation,   setUserLocation]   = useState(null);

  const isHeadingToPickup = rideStatus === "assigned" || rideStatus === "driver_selected" || rideStatus === "driver_arrived";

  // ─── Permission ──────────────────────────────────────────────────────────
  const checkPermission = useCallback(async () => {
    try {
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION);
        setHasPermission(granted);
      } else {
        setHasPermission(true);
      }
    } catch { setHasPermission(false); }
  }, []);

  useEffect(() => { checkPermission(); }, [checkPermission]);

  useEffect(() => {
    const sub = AppState.addEventListener("change", next => {
      if (next === "active") checkPermission();
    });
    return () => sub.remove();
  }, [checkPermission]);

  // ─── Core zoom: guaranteed animateToRegion ────────────────────────────────
  const fitBothPoints = useCallback(() => {
    if (!mapRef.current || isSelectionMode) return;
    if (pickup?.latitude && destination?.latitude) {
      const region = computeRegion(pickup, destination);
      mapRef.current.animateToRegion(region, 700);
    } else if (pickup?.latitude) {
      mapRef.current.animateToRegion({
        latitude:       pickup.latitude,
        longitude:      pickup.longitude,
        latitudeDelta:  0.015,
        longitudeDelta: 0.015,
      }, 600);
    }
  }, [pickup?.latitude, pickup?.longitude, destination?.latitude, destination?.longitude, isSelectionMode]);

  // Trigger zoom whenever map is ready OR either point changes OR forcedRegion changes
  useEffect(() => {
    if (!mapReady) return;
    if (forcedRegion) {
        mapRef.current?.animateToRegion(forcedRegion, 600);
        return;
    }
    const id = setTimeout(fitBothPoints, 150); // slight delay so markers render first
    return () => clearTimeout(id);
  }, [mapReady, fitBothPoints, forcedRegion]);

  // ─── User location ────────────────────────────────────────────────────────
  const handleUserLocationChange = useCallback(event => {
    const coords = event?.nativeEvent?.coordinate;
    if (coords) setUserLocation(coords);
    if (!centeredOnUser && coords && !pickup) {
      setCenteredOnUser(true);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.01, longitudeDelta: 0.01 }, 500);
    }
  }, [centeredOnUser, pickup]);

  // ─── Driver animated marker ───────────────────────────────────────────────
  const driverAnimRegion = useRef(null);
  useEffect(() => {
    if (!driverLocation) return;
    if (!driverAnimRegion.current) {
      driverAnimRegion.current = new AnimatedRegion({
        latitude:       driverLocation.latitude,
        longitude:      driverLocation.longitude,
        latitudeDelta:  0.01,
        longitudeDelta: 0.01,
      });
    } else {
      driverAnimRegion.current.timing({
        latitude:  driverLocation.latitude,
        longitude: driverLocation.longitude,
        duration:  1500,
        useNativeDriver: false,
      }).start();
    }
  }, [driverLocation?.latitude, driverLocation?.longitude]);

  // Memoize coordinates to avoid MapViewDirections re-renders
  const originLoc = useMemo(() => {
    if (!pickup?.latitude) return null;
    return { latitude: pickup.latitude, longitude: pickup.longitude };
  }, [pickup?.latitude, pickup?.longitude]);

  const destLoc = useMemo(() => {
    if (!destination?.latitude) return null;
    return { latitude: destination.latitude, longitude: destination.longitude };
  }, [destination?.latitude, destination?.longitude]);

  const vehicleImage = selectedCategory === "bike"
    ? require("../../assets/bike.png")
    : selectedCategory === "rickshaw" || selectedCategory === "auto"
      ? require("../../assets/rickshaw.png")
      : require("../../assets/car.png");

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        customMapStyle={SILVER_MAP_STYLE}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onMapReady={() => setMapReady(true)}
        onUserLocationChange={handleUserLocationChange}
        onRegionChangeComplete={region => {
          if (isSelectionMode && onLocationSelected) onLocationSelected(region);
        }}
      >
        {/* User GPS dot */}
        {hasPermission && userLocation && (
          <Marker coordinate={userLocation} anchor={{ x: 0.5, y: 0.5 }}>
            <View style={styles.userMarker}>
              <Ionicons name="navigate" size={14} color="#FFF" />
            </View>
          </Marker>
        )}

        {/* Pickup marker */}
        {(showMarkers || showPickupMarker) && pickup && (!isSelectionMode || selectionType === "destination") && (
          <Marker
            identifier="pickup-marker"
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            draggable={!!onPickupDragEnd}
            onDragEnd={(e) => {
              if (onPickupDragEnd) onPickupDragEnd(e.nativeEvent.coordinate);
            }}
          >
            <View style={styles.markerWrap}>
              <View style={[styles.iconCircle, { backgroundColor: COLORS.primary }]}>
                <Ionicons name="person" size={18} color="#FFF" />
              </View>
              <View style={[styles.markerTip, { borderTopColor: COLORS.primary }]} />
            </View>
          </Marker>
        )}

        {/* Destination marker */}
        {showMarkers && destination && (!isSelectionMode || selectionType === "pickup") && (
          <Marker
            identifier="dest-marker"
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            anchor={{ x: 0.5, y: 1 }}
            draggable={!!onDestinationDragEnd}
            onDragEnd={(e) => {
              if (onDestinationDragEnd) onDestinationDragEnd(e.nativeEvent.coordinate);
            }}
          >
            <View style={styles.markerWrap}>
              <View style={[styles.iconCircle, { backgroundColor: "#FF3B30" }]}>
                <Ionicons name="flag" size={18} color="#FFF" />
              </View>
              <View style={[styles.markerTip, { borderTopColor: "#FF3B30" }]} />
            </View>
          </Marker>
        )}

        {/* Animated driver marker */}
        {driverLocation && driverAnimRegion.current && (
          <Marker.Animated
            coordinate={driverAnimRegion.current}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.driverBubble}>
              <Image source={vehicleImage} style={{ width: 26, height: 26, resizeMode: "contain" }} />
            </View>
          </Marker.Animated>
        )}

        {/* Nearby wave drivers */}
        {waveDrivers.filter(d => d.vehicleType === selectedCategory).map(driver => (
          <Marker
            key={`wave-${driver.driverId}`}
            coordinate={{ latitude: driver.lat, longitude: driver.lon }}
            anchor={{ x: 0.5, y: 0.5 }}
          >
            <View style={styles.driverBubble}>
              <Image source={vehicleImage} style={{ width: 22, height: 22, resizeMode: "contain" }} />
            </View>
          </Marker>
        ))}

        {/* Route: driver → pickup */}
        {showRoute && isHeadingToPickup && driverLocation && originLoc && (
          <MapViewDirections
            origin={driverLocation}
            destination={originLoc}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4}
            strokeColor={COLORS.primary}
            onReady={result => { if (onRouteReady) onRouteReady(result); }}
          />
        )}

        {/* Route: pickup → destination */}
        {showRoute && originLoc && destLoc && (
          <MapViewDirections
            origin={originLoc}
            destination={destLoc}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={isHeadingToPickup ? 3 : 4}
            strokeColor={isHeadingToPickup ? "#B0B0B0" : COLORS.primary}
            lineDashPattern={isHeadingToPickup ? [10, 10] : null}
            onReady={result => {
              if (!isHeadingToPickup && onRouteReady) onRouteReady(result);
              // Re-fit after route renders to ensure best framing
              setTimeout(fitBothPoints, 400);
            }}
          />
        )}
      </MapView>

      {/* ── Floating location edit bar (Uber-style) ───────────────── */}
      {!isSelectionMode && pickup && destination && (onEditPickup || onEditDestination) && (
        <View style={styles.floatingBar}>
          {/* Pickup row */}
          <TouchableOpacity style={styles.editRow} onPress={onEditPickup} activeOpacity={0.8}>
            <View style={styles.dotPickup} />
            <Text style={styles.editAddr} numberOfLines={1}>
              {pickup.name || pickup.address || "Pickup"}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#999" />
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.barDivider}>
            <View style={styles.barDividerLine} />
          </View>

          {/* Destination row */}
          <TouchableOpacity style={styles.editRow} onPress={onEditDestination} activeOpacity={0.8}>
            <Ionicons name="location-sharp" size={14} color={COLORS.primary} style={{ marginRight: 8 }} />
            <Text style={styles.editAddr} numberOfLines={1}>
              {destination.name || destination.address || "Destination"}
            </Text>
            <Ionicons name="chevron-down" size={14} color="#999" />
          </TouchableOpacity>
        </View>
      )}

      {/* ── Centre crosshair for selection mode ───────────────────── */}
      {isSelectionMode && (
        <View style={styles.crosshairWrap} pointerEvents="none">
          <View style={styles.markerWrap}>
            <View style={[styles.iconCircle, {
              backgroundColor: selectionType === "pickup" ? COLORS.primary : "#FF3B30",
            }]}>
              <Ionicons name={selectionType === "pickup" ? "person" : "flag"} size={18} color="#FFF" />
            </View>
            <View style={[styles.markerTip, {
              borderTopColor: selectionType === "pickup" ? COLORS.primary : "#FF3B30",
            }]} />
          </View>
        </View>
      )}

      {/* ── Re-centre button ────────────────────────────────────────── */}
      {!isSelectionMode && pickup && destination && (
        <TouchableOpacity style={styles.recenterBtn} onPress={() => fitBothPoints()}>
          <Ionicons name="expand-outline" size={20} color="#444" />
        </TouchableOpacity>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: { flex: 1, overflow: "hidden" },
  map:       { flex: 1, width: "100%", height: "100%" },

  // Markers
  markerWrap:   { alignItems: "center" },
  iconCircle: {
  width: 36,
  height: 36,
  borderRadius: 18,
  justifyContent: "center",
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 3 },
  shadowOpacity: 0.25,
  shadowRadius: 4,
  elevation: 5,
},
 markerTip: {
    width: 0, height: 0,
    borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 9,
    borderLeftColor: "transparent", borderRightColor: "transparent",
    marginTop: -1,
  },
  driverBubble: {
    backgroundColor: "#FFF", padding: 5, borderRadius: 24,
    borderWidth: 1.5, borderColor: COLORS.primary,
    elevation: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2, shadowRadius: 4,
  },
  userMarker: {
    backgroundColor: COLORS.primary, padding: 5, borderRadius: 18,
    borderWidth: 2, borderColor: "#FFF", elevation: 4,
  },

  // Floating edit bar
  floatingBar: {
    position: "absolute",
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 4,
    paddingHorizontal: 14,
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  editRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  dotPickup: {
    width: 10, height: 10, borderRadius: 5,
    backgroundColor: "#FF6B00",
    marginRight: 10,
  },
  editAddr: {
    flex: 1,
    fontSize: responsiveFontSize(1.6),
    color: "#1F2937",
    fontWeight: "600",
    marginRight: 6,
  },
  barDivider: { paddingLeft: 14 },
  barDividerLine: { height: 1, backgroundColor: "#F3F4F6" },

  // Crosshair
  crosshairWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 20,
    marginBottom: 24,
  },

  // Re-centre
  recenterBtn: {
    position: "absolute",
    right: 14,
    bottom: responsiveHeight(3),
    backgroundColor: "#FFF",
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    elevation: 5,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15, shadowRadius: 4,
  },
});

export default MapComponent;
