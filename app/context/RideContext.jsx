import React, { createContext, useState, useContext, useCallback, useMemo } from "react";

const RideContext = createContext();

export const RideProvider = ({ children }) => {
  // ── Location & Route State ───────────────────────────────────────────────
  const [pickup, setPickup] = useState(null);
  const [destination, setDestination] = useState(null);
  const [routeDetails, setRouteDetails] = useState(null);
  const [routeCoords, setRouteCoords] = useState([]);
  const [selectedService, setSelectedService] = useState("bike");

  // ── Active Ride State ────────────────────────────────────────────────────
  // Persists ride lifecycle across screen remounts.
  // shape: { rideId: string, status: string, assignedDriver: object|null, finalFare: number|null, currency: string|null }
  const [hasRestoredSession, setHasRestoredSession] = useState(false);
  const [activeRide, setActiveRideState] = useState(null);

  const updatePickup = useCallback((newPickup) => {
    if (!newPickup) return;
    setPickup((prev) => {
      if (
        prev?.latitude === newPickup.latitude &&
        prev?.longitude === newPickup.longitude
      ) {
        return prev;
      }
      setRouteCoords([]);
      // setRouteDetails(null);
      return newPickup;
    });
  }, []);

  const updateDestination = useCallback((newDest) => {
    if (!newDest) return;
    setDestination((prev) => {
      if (
        prev?.latitude === newDest.latitude &&
        prev?.longitude === newDest.longitude
      ) {
        return prev;
      }
      setRouteCoords([]);
      // setRouteDetails(null);
      return newDest;
    });
  }, []);

  /**
   * Merge partial updates into activeRide.
   * e.g. setActiveRide({ rideId: '...', status: 'searching' })
   * e.g. setActiveRide({ status: 'assigned', assignedDriver: { ... } })
   */
  const setActiveRide = useCallback((data) => {
    setActiveRideState((prev) =>
      data === null ? null : { ...prev, ...data }
    );
  }, []);

  const clearActiveRide = useCallback(() => {
    setActiveRideState(null);
  }, []);

  const clearRideData = useCallback(() => {
    setPickup(null);
    setDestination(null);
    setRouteDetails(null);
    setRouteCoords([]);
    setSelectedService("bike");
    setActiveRideState(null);
  }, []);

  const value = useMemo(
    () => ({
      // Location
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
      hasRestoredSession,
      setHasRestoredSession,
      // Active ride lifecycle
      activeRide,
      setActiveRide,
      clearActiveRide,
    }),
    [
      pickup,
      destination,
      routeDetails,
      routeCoords,
      selectedService,
      hasRestoredSession,
      activeRide,
      updatePickup,
      updateDestination,
      clearRideData,
      setActiveRide,
      clearActiveRide,
    ]
  );

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
