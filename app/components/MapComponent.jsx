import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { StyleSheet, PermissionsAndroid, AppState, Animated, View, Image, Platform, TouchableOpacity, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline, AnimatedRegion } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import { COLORS } from "../constants";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import * as ExpoLocation from "expo-location";
import { useRide } from "../context/RideContext";
import { useIsFocused } from "@react-navigation/native";

const SILVER_MAP_STYLE = [
  { "featureType": "administrative", "elementType": "geometry.fill", "stylers": [{ "color": "#d6e2e6" }] },
  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#cfd4d5" }] },
  { "featureType": "administrative", "elementType": "labels.text.fill", "stylers": [{ "color": "#7492a8" }] },
  { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#dde2e3" }] },
  { "featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{ "color": "#dde2e3" }] },
  { "featureType": "poi", "elementType": "geometry.fill", "stylers": [{ "color": "#dde2e3" }] },
  { "featureType": "poi", "elementType": "labels.icon", "stylers": [{ "saturation": -100 }] },
  { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#a9de83" }] },
  { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#41626b" }] },
  { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#c1d1d6" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#a6b5bb" }] },
  { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "#ffffff" }] },
  { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#a6cbe3" }] }
];

const DEFAULT_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapComponent = memo(({ 
  pickup: propPickup, 
  destination: propDestination, 
  driverLocation,
  rideStatus,
  showMarkers = true, 
  showRoute = true,
  animateZoomOut = false, 
  showPickupMarker = false, 
  disablePolyline = false,
  useGlobalState = false,
  onRouteReady,
  onPickupDragEnd,
  onDestinationDragEnd,
  waveDrivers = [],
  selectedCategory = "bike",
  isSelectionMode = false,
  selectionType = "pickup", // "pickup" or "destination"
  onLocationSelected
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const isFocused = useIsFocused();
  const { routeCoords, setRouteCoords, pickup: ctxPickup, destination: ctxDestination } = useRide();
  
  // Only fallback to context if explicitly allowed
  const pickup = propPickup !== undefined ? propPickup : (useGlobalState ? ctxPickup : null);
  const destination = propDestination !== undefined ? propDestination : (useGlobalState ? ctxDestination : null);

  const [hasPermission, setHasPermission] = useState(false);
  const [centeredOnUser, setCenteredOnUser] = useState(false);
  const [visibleCoords, setVisibleCoords] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [lastRouteHash, setLastRouteHash] = useState("");
  const drawAnim = useRef(new Animated.Value(0)).current;
  const initialFitDone = useRef(false);

  // Check if driver is heading to pickup
  const isHeadingToPickup = rideStatus === "assigned" || rideStatus === "driver_selected" || rideStatus === "driver_arrived";

  // Clear local visual route only if global coordinates are empty
  useEffect(() => {
    if (routeCoords.length === 0) {
      setVisibleCoords([]);
      setLastRouteHash("");
    }
  }, [routeCoords]);

  // Clear visual route immediately when pickup or destination changes
  useEffect(() => {
    setVisibleCoords([]);
  }, [pickup?.latitude, pickup?.longitude, destination?.latitude, destination?.longitude]);

  // Smooth Driver Marker Animation
  const driverAnimRegion = useRef(null);

  useEffect(() => {
    if (driverLocation) {
      if (!driverAnimRegion.current) {
        driverAnimRegion.current = new AnimatedRegion({
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else {
        driverAnimRegion.current.timing({
          latitude: driverLocation.latitude,
          longitude: driverLocation.longitude,
          duration: 1500,
          useNativeDriver: false,
        }).start();
      }
    }
  }, [driverLocation?.latitude, driverLocation?.longitude]);

  // Handle drawing animation whenever routeCoords changes or component mounts with them
  useEffect(() => {
    if (showRoute && routeCoords && routeCoords.length > 1) {
      if (visibleCoords.length === routeCoords.length) {
        return;
      }

      drawAnim.setValue(0);
      const animation = Animated.timing(drawAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: false,
      });
      
      const listener = drawAnim.addListener(({ value }) => {
        const count = Math.floor(value * routeCoords.length);
        setVisibleCoords(routeCoords.slice(0, count + 1));
      });

      animation.start();
      
      return () => {
        animation.stop();
        drawAnim.removeListener(listener);
      };
    }
  }, [routeCoords, showRoute]);

  // Check if location permission is already granted
  const checkPermission = useCallback(async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.check(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
        );
        setHasPermission(granted);
        if (granted) setCenteredOnUser(false);
      } else {
        // For iOS, assume true if we haven't implemented specific iOS checks
        // or add Expo-Location check here.
        setHasPermission(true);
      }
    } catch (e) {
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  useEffect(() => {
    const appState = { current: AppState.currentState };
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (appState.current.match(/inactive|background/) && nextState === "active") {
        checkPermission();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [checkPermission]);

  // Fit to coordinates ONLY when map is initially ready or route endpoints completely change
  // We ignore driverLocation changes to avoid continuous auto-zoom that prevents user panning
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (!initialFitDone.current) {
      if (pickup) {
        const coordsToFit = [
          { latitude: pickup.latitude, longitude: pickup.longitude }
        ];
        if (driverLocation) {
          coordsToFit.push({ latitude: driverLocation.latitude, longitude: driverLocation.longitude });
        }
        if (destination) {
          coordsToFit.push({ latitude: destination.latitude, longitude: destination.longitude });
        }

        if (coordsToFit.length > 1) {
          mapRef.current.fitToCoordinates(coordsToFit, {
            edgePadding: { top: 120, right: 120, bottom: 120, left: 120 },
            animated: true,
          });
        } else {
          mapRef.current.animateToRegion({
            latitude: pickup.latitude,
            longitude: pickup.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 600);
        }
        initialFitDone.current = true;
      }
    }
  }, [mapReady, pickup?.latitude, pickup?.longitude, destination?.latitude, destination?.longitude, showRoute]);

  const handleUserLocationChange = useCallback(
    (event) => {
      const coords = event?.nativeEvent?.coordinate;
      if (coords) setUserLocation(coords);

      if (!centeredOnUser && coords && !pickup) {
        const { latitude, longitude } = coords;
        setCenteredOnUser(true);
        mapRef.current?.animateToRegion({
          latitude,
          longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }, 500);
      }
    },
    [centeredOnUser, pickup]
  );
  
  const handleRecenter = () => {
    if (!userLocation) return;
    mapRef.current?.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    }, 600);
  };

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
        mapPadding={{ top: 0, right: 0, bottom: isSelectionMode ? 0 : responsiveHeight(10), left: 0 }}
        onMapReady={() => setMapReady(true)}
        onUserLocationChange={handleUserLocationChange}
        onRegionChangeComplete={(region) => {
          if (isSelectionMode && onLocationSelected) {
            onLocationSelected(region);
          }
        }}
      >
        {/* User's Exact GPS Location Marker */}
        {hasPermission && userLocation && (
           <Marker
             key="user-current-loc"
             coordinate={{ latitude: userLocation.latitude, longitude: userLocation.longitude }}
           >
              <View style={styles.userMarker}>
                <Ionicons name="navigate" size={16} color={COLORS.white} />
              </View>
           </Marker>
        )}
        {(showMarkers || showPickupMarker) && pickup && (
          <Marker
            key={`marker-pickup-${pickup.latitude}-${pickup.longitude}`}
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            title={t("pickup")}
            description={pickup.address}
            draggable
            onDragEnd={(e) => onPickupDragEnd && onPickupDragEnd(e.nativeEvent.coordinate)}
            tracksViewChanges={false}
          >
            <View style={styles.modernMarker}>
              <View style={[styles.markerInner, { backgroundColor: COLORS.success || "#4CAF50" }]} />
            </View>
          </Marker>
        )}
        
        {showMarkers && destination && (
          <Marker
            key={`marker-dest-${destination.latitude}-${destination.longitude}`}
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            title={t("destination")}
            description={destination.address}
            draggable
            onDragEnd={(e) => onDestinationDragEnd && onDestinationDragEnd(e.nativeEvent.coordinate)}
            tracksViewChanges={false}
          >
            <View style={styles.modernMarker}>
              <View style={[styles.markerInner, { backgroundColor: COLORS.error || "#F44336" }]} />
            </View>
          </Marker>
        )}

        {driverLocation && driverAnimRegion.current && (
           <Marker.Animated
             key="driver-marker"
             coordinate={driverAnimRegion.current}
             title={t("driver")}
             anchor={{ x: 0.5, y: 0.5 }}
             tracksViewChanges={false}
           >
             <View style={styles.driverMarkerContainer}>
               <Image 
                 source={require("../../assets/auto.png")} 
                 style={{ width: 28, height: 28, resizeMode: 'contain' }} 
               />
             </View>
           </Marker.Animated>
        )}

        {/* Real-time Wave Drivers (Filtered) */}
        {waveDrivers.filter(d => d.vehicleType === selectedCategory).map(driver => (
          <Marker
            key={`wave-driver-${driver.driverId}`}
            coordinate={{ latitude: driver.lat, longitude: driver.lon }}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={styles.driverMarkerContainer}>
              <Image 
                source={
                   selectedCategory === 'bike' ? require("../../assets/bike.png") :
                   selectedCategory === 'rickshaw' || selectedCategory === 'auto' ? require("../../assets/auto.png") :
                   selectedCategory === 'mini' || selectedCategory === 'standard' ? require("../../assets/car.png") :
                   require("../../assets/car.png")
                } 
                style={{ width: 24, height: 24, resizeMode: 'contain' }} 
              />
            </View>
          </Marker>
        ))}

        {/* LEG 1: Driver to Pickup (Visible when approaching) */}
        {showRoute && isHeadingToPickup && driverLocation && pickup && (
          <MapViewDirections
            origin={{ latitude: driverLocation.latitude, longitude: driverLocation.longitude }}
            destination={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={4} 
            strokeColor={COLORS.primary}
            onReady={(result) => {
              if (onRouteReady) onRouteReady(result);
            }}
          />
        )}

        {/* LEG 2: Pickup to Destination (Always visible if pickup and dest exist) */}
        {showRoute && pickup && destination && (
          <MapViewDirections
            origin={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            destination={{ latitude: destination.latitude, longitude: destination.longitude }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={isHeadingToPickup ? 3 : 4} 
            strokeColor={isHeadingToPickup ? '#A0A0A0' : COLORS.primary}
            lineDashPattern={isHeadingToPickup ? [10, 10] : null}
            onReady={(result) => {
              if (!isHeadingToPickup && onRouteReady) {
                onRouteReady(result);
              }
            }}
          />
        )}


      </MapView>

      {/* Floating Controls */}
      <View style={styles.floatingControls}>
        <TouchableOpacity 
          style={styles.controlButton}
          onPress={handleRecenter}
        >
          <Ionicons name="locate" size={24} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Fixed Center Pin for Selection Mode */}
      {isSelectionMode && (
        <View style={styles.centerPinContainer} pointerEvents="none">
          <View style={styles.centerPinBob}>
            <View style={[
              styles.modernMarker, 
              { borderColor: selectionType === 'pickup' ? COLORS.success : COLORS.error }
            ]}>
              <View style={[
                styles.markerInner, 
                { backgroundColor: selectionType === 'pickup' ? COLORS.success : COLORS.error }
              ]} />
            </View>
            <View style={styles.pinShadow} />
          </View>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  modernMarker: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  markerInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  driverMarkerContainer: {
    backgroundColor: '#FFF',
    padding: 5,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  userMarker: {
    backgroundColor: COLORS.primary,
    padding: 4,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: COLORS.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    top: 60,
    zIndex: 10,
  },
  controlButton: {
    backgroundColor: '#FFF',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 12,
  },
  centerPinContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  centerPinBob: {
    alignItems: 'center',
    marginBottom: 24, // Offset to point to exact center
  },
  pinShadow: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.2)',
    marginTop: 4,
  }
});

export default MapComponent;
