import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { StyleSheet, PermissionsAndroid, AppState, Animated, View, Image } from "react-native";
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
  onRouteReady 
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const isFocused = useIsFocused();
  const { routeCoords, setRouteCoords, pickup: ctxPickup, destination: ctxDestination } = useRide();
  
  // Use context as the source of truth for better persistence, but respect explicit nulls
  const pickup = propPickup !== undefined ? propPickup : ctxPickup;
  const destination = propDestination !== undefined ? propDestination : ctxDestination;

  const [hasPermission, setHasPermission] = useState(false);
  const [centeredOnUser, setCenteredOnUser] = useState(false);
  const [visibleCoords, setVisibleCoords] = useState([]);
  const [mapReady, setMapReady] = useState(false);
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
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      setHasPermission(granted);
      if (granted) setCenteredOnUser(false);
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
      if (!centeredOnUser && event?.nativeEvent?.coordinate && !pickup) {
        const { latitude, longitude } = event.nativeEvent.coordinate;
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

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        initialRegion={DEFAULT_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        onMapReady={() => setMapReady(true)}
        onUserLocationChange={handleUserLocationChange}
      >
        {(showMarkers || showPickupMarker) && pickup && (
          <Marker
            key={`marker-pickup-${pickup.latitude}-${pickup.longitude}`}
            coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            title={t("pickup")}
            description={pickup.address}
            pinColor="green"
            tracksViewChanges={false}
          />
        )}
        
        {showMarkers && destination && (
          <Marker
            key={`marker-dest-${destination.latitude}-${destination.longitude}`}
            coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
            title={t("destination")}
            description={destination.address}
            pinColor="red"
            tracksViewChanges={false}
          />
        )}

        {driverLocation && driverAnimRegion.current && (
          <Marker.Animated
            key="driver-marker"
            coordinate={driverAnimRegion.current}
            title={t("driver")}
            anchor={{ x: 0.5, y: 0.5 }}
            tracksViewChanges={false}
          >
            <View style={{
              backgroundColor: '#FFF',
              padding: 4,
              borderRadius: 20,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 2 },
              shadowOpacity: 0.25,
              shadowRadius: 3.84,
              elevation: 5
            }}>
              <Image 
                source={require("../../assets/auto.png")} 
                style={{ width: 28, height: 28, resizeMode: 'contain' }} 
              />
            </View>
          </Marker.Animated>
        )}

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
});

export default MapComponent;
