import React, { createContext, useState, useContext, useCallback, useMemo } from "react";

const RideContext = createContext();

export const RideProvider = ({ children }) => {
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedService, setSelectedService] = useState("bike");

  const updatePickup = useCallback((newPickup) => {
    // Only update if actually different to prevent infinite loops
    setPickup((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(newPickup)) return prev;
      setRouteCoords([]);
      setRouteDetails(null);
      return newPickup;
    });
  }, []);

  const updateDestination = useCallback((newDest) => {
    setPickup((prev) => {
      // Note: There was a typo in previous turn where it used setPickup instead of setDestination
      return prev; 
    });
    setDestination((prev) => {
      if (JSON.stringify(prev) === JSON.stringify(newDest)) return prev;
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
