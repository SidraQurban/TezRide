import React, { createContext, useState, useContext, useCallback, useMemo } from "react";

const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedService, setSelectedService] = useState("bike");

  const updatePickup = useCallback((newPickup) => {
    if (!newPickup) return;
    setPickup((prev) => {
      // Deep check latitude/longitude to avoid unnecessary clearing of route
      if (prev?.latitude === newPickup.latitude && prev?.longitude === newPickup.longitude) {
        return prev;
      }
      // If location actually changed, clear the route
      setRouteCoords([]);
      setRouteDetails(null);
      return newPickup;
    });
  }, []);

  const updateDestination = useCallback((newDest) => {
    if (!newDest) return;
    setDestination((prev) => {
      if (prev?.latitude === newDest.latitude && prev?.longitude === newDest.longitude) {
        return prev;
      }
      setRouteCoords([]);
      setRouteDetails(null);
      return newDest;
    });
  }, []);

  const clearRideData = useCallback(() => {
    setPickup(null);
    setDestination(null);
    setRouteDetails(null);
    setRouteCoords([]);
    setSelectedService("bike");
  }, []);

  const value = useMemo(() => ({
    pickup,
    setPickup: updatePickup,
    destination,
    setDestination: updateDestination,
    routeDetails,
    setRouteDetails,
    routeCoords,
    setRouteCoords,
    selectedService,
    setSelectedService,
    clearRideData,
  }), [pickup, destination, routeDetails, routeCoords, selectedService, updatePickup, updateDestination, clearRideData]);

  return (
    <RideContext.Provider value={value}>
      {children}
    </RideContext.Provider>
  );
};

export const useRide = () => {
  const context = useContext(RideContext);
  if (!context) {
    throw new Error("useRide must be used within a RideProvider");
  }
  return context;
};
