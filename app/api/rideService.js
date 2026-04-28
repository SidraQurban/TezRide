import apiClient from './apiClient';
import storage from '../utils/storage';

/**
 * Ride related API endpoints
 */
export const rideService = {
  /**
   * Starts a new ride search.
   * @param {Object} data - Ride request details {pickup, dropoff, vehicleType, genderPreference, minRating}
   */
  requestRide: async (data) => {
    const token = await storage.getItem('jwToken');
    if (token === "mock-dev-token") {
      return {
        succeeded: true,
        data: {
          rideId: "mock-ride-" + Math.floor(Math.random() * 10000),
          status: "Searching"
        }
      };
    }
    return apiClient.post('/api/rides/request', data);
  },

  /**
   * Gets the current status of a ride.
   * @param {string} rideId - The unique ID of the ride
   */
  getRideStatus: async (rideId) => {
    const token = await storage.getItem('jwToken');
    if (token === "mock-dev-token" || rideId.startsWith("mock-ride-")) {
      return {
        succeeded: true,
        data: {
          rideId: rideId,
          status: "Searching"
        }
      };
    }
    return apiClient.get(`/api/rides/${rideId}`);
  },
};

export default rideService;
