import apiClient from './apiClient';

/**
 * Pricing API
 * GET /api/pricing/estimates
 */
const pricingService = {
  /**
   * Fetches real-time estimated fares for all vehicle types.
   *
   * @param {Object} params
   * @param {number} params.pickupLat
   * @param {number} params.pickupLon
   * @param {number} params.dropoffLat
   * @param {number} params.dropoffLon
   * @param {number} [params.estimatedDistanceKm]   - optional hint from Google Maps Directions
   * @param {number} [params.estimatedDurationMinutes] - optional hint from Google Maps Directions
   *
   * @returns {Promise<Object>}  API envelope { succeeded, data: EstimateDto[] }
   * EstimateDto: { vehicleTypeSlug, estimatedFare, estimatedDistanceKm, currency, surgeFactor }
   */
  getEstimates: async ({
    pickupLat,
    pickupLon,
    dropoffLat,
    dropoffLon,
    estimatedDistanceKm,
    estimatedDurationMinutes,
  }) => {
    const params = new URLSearchParams({
      pickupLat,
      pickupLon,
      dropoffLat,
      dropoffLon,
    });

    if (estimatedDistanceKm != null) {
      params.append('estimatedDistanceKm', estimatedDistanceKm);
    }
    if (estimatedDurationMinutes != null) {
      params.append('estimatedDurationMinutes', estimatedDurationMinutes);
    }

    return apiClient.get(`/api/pricing/estimates?${params.toString()}`);
  },
};

export default pricingService;
