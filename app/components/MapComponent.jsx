import React, { useRef, useState, useEffect, useCallback } from "react";
import { StyleSheet, PermissionsAndroid } from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";

const DEFAULT_REGION = {
  latitude: 24.8607,
  longitude: 67.0011,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const MapComponent = () => {
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
    />
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
