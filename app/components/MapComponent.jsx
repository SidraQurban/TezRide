import React, { useRef, useState, useEffect, useCallback } from "react";
import { StyleSheet, PermissionsAndroid, AppState } from "react-native";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
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

const MapComponent = ({ pickup, destination }) => {
  const { t } = useTranslation();
  const mapRef = useRef(null);
  const [hasPermission, setHasPermission] = useState(false);
  const [centeredOnUser, setCenteredOnUser] = useState(false);

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
    if (pickup && destination && mapRef.current) {
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
  }, [pickup, destination]);

  // Called by the native map when user location updates — center map once
  const handleUserLocationChange = useCallback(
    (event) => {
      if (!centeredOnUser && event?.nativeEvent?.coordinate) {
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
    [centeredOnUser]
  );

  return (
    <MapView
      ref={mapRef}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={DEFAULT_REGION}
      showsUserLocation={hasPermission}
      showsMyLocationButton={hasPermission}
      onUserLocationChange={handleUserLocationChange}
    >
      {pickup && destination && (
        <MapViewDirections
          origin={{ latitude: pickup.latitude, longitude: pickup.longitude }}
          destination={{ latitude: destination.latitude, longitude: destination.longitude }}
          apikey={GOOGLE_MAPS_API_KEY}
          strokeWidth={4}
          strokeColor={COLORS.primary}
          onReady={(result) => {
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
      )}
      {pickup && (
        <Marker
          coordinate={{ latitude: pickup.latitude, longitude: pickup.longitude }}
          title={t("pickup")}
          description={pickup.address}
          pinColor="green"
        />
      )}
      {destination && (
        <Marker
          coordinate={{ latitude: destination.latitude, longitude: destination.longitude }}
          title={t("destination")}
          description={destination.address}
          pinColor="red"
        />
      )}
    </MapView>
  );
};

const styles = StyleSheet.create({
  map: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default MapComponent;
