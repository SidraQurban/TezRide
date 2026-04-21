import React, { useRef, useState, useEffect, useCallback, memo } from "react";
import { StyleSheet, PermissionsAndroid, AppState, Animated, View } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker, Polyline } from "react-native-maps";
import { useTranslation } from "react-i18next";
import MapViewDirections from "react-native-maps-directions";
import { GOOGLE_MAPS_API_KEY } from "../../config/keys";
import { COLORS } from "../constants";
import { responsiveHeight, responsiveWidth } from "react-native-responsive-dimensions";

const DEFAULT_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapComponent = memo(({ pickup, destination, showMarkers = true, animateZoomOut = false, showPickupMarker = false }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [centeredOnUser, setCenteredOnUser] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);
  const [visibleCoords, setVisibleCoords] = useState([]);
  const drawAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
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
    } else {
      setVisibleCoords([]);
    }
  }, [routeCoords]);

  // Check if location permission is already granted
  const checkPermission = useCallback(async () => {
    try {
      const granted = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION
      );
      setHasPermission(granted);
      // Reset centering so if permission was just granted, map re-centers
      if (granted) setCenteredOnUser(false);
    } catch (e) {
      setHasPermission(false);
    }
  }, []);

  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Re-check permission whenever the app comes back to foreground
  // (covers both the OS permission dialog and returning from Settings)
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
    // If no route directions, fallback to fitting markers
    if (showMarkers && pickup && destination && mapRef.current) {
      // fitToCoordinates will be handled by MapViewDirections onReady if possible,
      // but we keep this as fallback
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
    }
  }, [pickup, destination, showMarkers]);

  useEffect(() => {
    if (animateZoomOut && pickup && mapRef.current) {
      // Step 1: Snap to pickup instantly
      mapRef.current.animateToRegion({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      }, 100); // Very fast 100ms transition instead of 0 for stability

      // Step 2: Continuous slow zoom out (like InDrive)
      const timer = setTimeout(() => {
        mapRef.current.animateToRegion({
          latitude: pickup.latitude,
          longitude: pickup.longitude,
          latitudeDelta: 0.1, 
          longitudeDelta: 0.1,
        }, 30000); 
      }, 300); // Start slow zoom out almost immediately (300ms delay)

      return () => clearTimeout(timer);
    } else if (!showMarkers && pickup && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: pickup.latitude,
        longitude: pickup.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 1000);
    }
  }, [pickup, showMarkers, animateZoomOut]);

  // Called by the native map when user location updates — center map once
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
          800
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
      onUserLocationChange={handleUserLocationChange}
    >
      {showMarkers && pickup && destination && (
        <>
          <MapViewDirections
            origin={{ latitude: pickup.latitude, longitude: pickup.longitude }}
            destination={{ latitude: destination.latitude, longitude: destination.longitude }}
            apikey={GOOGLE_MAPS_API_KEY}
            strokeWidth={0} // Hide default line
            strokeColor={COLORS.primary}
            onReady={(result) => {
              setRouteCoords(result.coordinates);
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
