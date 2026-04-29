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

const MapComponent = memo(({ pickup: propPickup, destination: propDestination, showMarkers = true, animateZoomOut = false, showPickupMarker = false, onRouteReady }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const { routeCoords, setRouteCoords, pickup: ctxPickup, destination: ctxDestination } = useRide();
  
  const pickup = propPickup || ctxPickup;
  const destination = propDestination || ctxDestination;

  const [hasPermission, setHasPermission] = useState(false);
  const [centeredOnUser, setCenteredOnUser] = useState(false);
  const [visibleCoords, setVisibleCoords] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const [lastRouteHash, setLastRouteHash] = useState("");
  const drawAnim = useRef(new Animated.Value(0)).current;

  // Clear routes immediately when locations change (deep check)
  useEffect(() => {
    if (routeCoords.length > 0 || visibleCoords.length > 0) {
      setRouteCoords([]);
      setVisibleCoords([]);
      setLastRouteHash("");
    }
  }, [pickup?.latitude, pickup?.longitude, destination?.latitude, destination?.longitude, setRouteCoords]);

  // Handle animation of polyline
  useEffect(() => {
    if (routeCoords && routeCoords.length > 1) {
      // If returning to a screen with already calculated route, show it immediately
      if (visibleCoords.length === routeCoords.length && routeCoords.length > 0) {
        return;
      }
      
      // If we already have coordinates but visible is empty, set it (this happens on back navigation)
      if (visibleCoords.length === 0) {
        setVisibleCoords(routeCoords);
        return;
      }

      // Normal animation for new routes
      setVisibleCoords([]);
      drawAnim.setValue(0);
      const animation = Animated.timing(drawAnim, {
        toValue: 1,
        duration: 2000,
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
  }, [routeCoords]);

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
      if (
        appState.current.match(/inactive|background/) &&
        nextState === "active"
      ) {
        checkPermission();
      }
      appState.current = nextState;
    });
    return () => subscription.remove();
  }, [checkPermission]);

  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (showMarkers && pickup && destination) {
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
  }, [mapReady, pickup, destination, showMarkers]);

  const handleUserLocationChange = useCallback(
    (event) => {
      if (!centeredOnUser && event?.nativeEvent?.coordinate && !pickup) {
        const { latitude, longitude } = event.nativeEvent.coordinate;
        setCenteredOnUser(true);
        mapRef.current?.animateToRegion(
          {
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          },
          500
        );
      }
    },
    [centeredOnUser, pickup]
  );

  return (
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
      {showMarkers && pickup && destination && (
        <>
          <MapViewDirections
            origin={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            destination={{ latitude: destination.latitude, longitude: destination.longitude }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={0} 
            strokeColor="transparent"
            onReady={(result) => {
              const routeHash = `${result.coordinates.length}-${result.coordinates[0]?.latitude}-${result.coordinates[result.coordinates.length-1]?.latitude}`;
              if (routeHash !== lastRouteHash) {
                setRouteCoords(result.coordinates);
                setLastRouteHash(routeHash);
              }
              if (onRouteReady) {
                onRouteReady(result);
              }
              mapRef.current?.fitToCoordinates(result.coordinates, {
                edgePadding: {
                  right: responsiveWidth(10),
                  bottom: responsiveHeight(25),
                  left: responsiveWidth(10),
                  top: responsiveHeight(15),
                },
              });
            }}
          />
          {visibleCoords && visibleCoords.length > 1 && (
            <Polyline
              key={`route-${routeCoords?.length || 0}-${routeCoords?.[0]?.latitude || 0}`}
              coordinates={visibleCoords}
              strokeWidth={4}
              strokeColor={COLORS.primary}
              lineCap="round"
              lineJoin="round"
            />
          )}
        </>
      )}
      {(showMarkers || showPickupMarker) && pickup && (
        <Marker
          coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
          title={t("pickup")}
          description={pickup.address}
          pinColor="green"
        />
      )}
      {showMarkers && destination && (
        <Marker
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title={t("destination")}
          description={destination.address}
          pinColor="red"
        />
      )}
    </MapView>
  );
});

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default MapComponent;
