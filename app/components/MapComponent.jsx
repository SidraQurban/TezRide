import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { StyleSheet, PermissionsAndroid, AppState, Animated, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import { COLORS } from "../constants";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";
import * as ExpoLocation from "expo-location";

const DEFAULT_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapComponent = memo(({ pickup, destination, showMarkers = true, animateZoomOut = false, showPickupMarker = false, onRouteReady }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [centeredOnUser, setCenteredOnUser] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [visibleCoords, setVisibleCoords] = useState([]);
  const [mapReady, setMapReady] = useState(false);
  const drawAnim = useRef(new Animated.Value(0)).current;

  // Clear routes immediately when locations change (e.g., on swap)
  useEffect(() => {
    setRouteCoords([]);
    setVisibleCoords([]);
  }, [pickup, destination]);

  useEffect(() => {
    setVisibleCoords([]);
    if (routeCoords.length > 1) {
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

  // Re-check permission whenever the app comes back to foreground
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

  // ── Single animation effect, gated on mapReady ──────────────────────────────
  // Only runs after onMapReady fires, so mapRef.current is always valid.
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;

    if (showMarkers && pickup && destination) {
      // ConfirmRide: fit both pickup + destination markers into view
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
      // Searching screens: smooth 600 ms pan to the pickup marker
      mapRef.current.animateToRegion({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 600);
    } else {
      // No pickup yet — center on last-known device position instantly
      (async () => {
        try {
          const { status } = await ExpoLocation.requestForegroundPermissionsAsync();
          if (status !== "granted") return;
          const last = await ExpoLocation.getLastKnownPositionAsync({});
          if (last && mapRef.current) {
            mapRef.current.animateToRegion({
              latitude: last.coords.latitude,
              longitude: last.coords.longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }, 400);
          }
        } catch (_) {}
      })();
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
          500 // faster than 800ms
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
              setRouteCoords(result.coordinates);
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
          {visibleCoords.length > 1 && (
            <Polyline
              key={`route-${routeCoords.length}-${routeCoords[0]?.latitude}-${routeCoords[0]?.longitude}`}
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
