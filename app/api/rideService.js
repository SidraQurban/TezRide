import apiClient from './apiClient';
import storage from '../utils/storage';

/**
 * Ride related API endpoints
 * Spec: https://api.tezride.pk
 */
export const rideService = {
  /**
   * Initiates a new ride search.
   * POST /api/rides/request
   * @param {Object} data - Partial ride request details (pickup, dropoff, vehicleType, etc.)
   */
  requestRide: async (data) => {
    // Read authenticated customer info from storage
    const userId = await storage.getItem('userId');
    const customerName = await storage.getItem('customerName') || 'Customer';
    const customerProfilePicUrl = await storage.getItem('customerProfilePicUrl') || '';

    const body = {
      customerId: userId,
      customerName,
      customerProfilePicUrl,
      vehicleType: data.vehicleType,
      pickup: data.pickup,   // { lat, lon }
      dropoff: data.dropoff, // { lat, lon }
      genderPreference: data.genderPreference || 'any',
      minRating: data.minRating ?? 0,
      offeredFare: data.estimatedFare || 0,
      estimatedDistanceKm: data.estimatedDistance || 0,
      estimatedDurationMinutes: data.estimatedDuration || 0,
    };

    return apiClient.post('/api/customer/rides/request', body);
  },

  /**
   * Returns the current status of a ride (from Redis or Postgres).
   * GET /api/customer/rides/{rideId}
   * @param {string} rideId
   */
  getRideStatus: async (rideId) => {
    return apiClient.get(`/api/customer/rides/${rideId}`);
  },

  /**
   * (Driver only) Updates the active ride state.
   * POST /api/customer/rides/{rideId}/status
   * Status codes: 2 = Arrived, 3 = InTransit
   * @param {string} rideId
   * @param {number} status
   */
  updateRideStatus: async (rideId, status) => {
    return apiClient.post(`/api/customer/rides/${rideId}/status`, { status });
  },

  /**
   * (Driver only) Finalises the ride and flushes data to PostgreSQL.
   * POST /api/customer/rides/{rideId}/complete
   * @param {string} rideId
   * @param {number} distanceKm
   */
  completeRide: async (rideId, distanceKm) => {
    return apiClient.post(`/api/customer/rides/${rideId}/complete`, { distanceKm });
  },

  /**
   * Submits a rating for the driver or customer.
   * POST /api/ratings/submit
   */
  submitRating: async (data) => {
    return apiClient.post('/api/ratings/submit', data);
  },
};

export default rideService;
