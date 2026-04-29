import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { StyleSheet, PermissionsAndroid, AppState, Animated, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import { COLORS } from "../constants";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import * as ExpoLocation from "expo-location";
import { useRide } from "../context/RideContext";

const DEFAULT_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapComponent = memo(({ 
  pickup: propPickup, 
  destination: propDestination, 
  showMarkers = true, 
  showRoute = true,
  animateZoomOut = false, 
  showPickupMarker = false, 
  onRouteReady 
}) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
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

  // Clear local visual route only if global coordinates are empty
  useEffect(() => {
    if (routeCoords.length === 0) {
      setVisibleCoords([]);
      setLastRouteHash("");
    }
  }, [routeCoords]);

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

  // Fit to coordinates when map is ready or locations change
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (showRoute && pickup && destination) {
      mapRef.current.fitToCoordinates(
        [
          { latitude: pickup.latitude, longitude: pickup.longitude },
          { latitude: destination.latitude, longitude: destination.longitude },
        ],
        {
          edgePadding: { top: 100, right: 100, bottom: 100, left: 100 },
          animated: true,
        }
      );
    } else if (pickup) {
      mapRef.current.animateToRegion({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 600);
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

        {showRoute && pickup && destination && (
          <MapViewDirections
            origin={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            destination={{ latitude: destination.latitude, longitude: destination.longitude }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={0} 
            strokeColor="transparent"
            onReady={(result) => {
              const routeHash = `${result.coordinates.length}-${result.coordinates[0]?.latitude.toFixed(4)}-${result.coordinates[result.coordinates.length-1]?.latitude.toFixed(4)}`;
              if (routeHash !== lastRouteHash) {
                setRouteCoords(result.coordinates);
                setLastRouteHash(routeHash);
              }
              if (onRouteReady) {
                onRouteReady(result);
              }
            }}
          />
        )}

        {showRoute && visibleCoords.length > 1 && (
          <Polyline
            key={`route-${visibleCoords.length}-${pickup?.latitude}-${destination?.latitude}`}
            coordinates={visibleCoords}
            strokeWidth={4}
            strokeColor={COLORS.primary}
            lineCap="round"
            lineJoin="round"
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
