import apiClient from "./apiClient";

const customerService = {
  /**
   * Get customer wallet balance
   * GET /api/customer/rides/balance
   */
  getBalance: async () => {
    try {
      const response = await apiClient.get("/api/customer/rides/balance");
      return response;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Get customer ride history
   * GET /api/customer/rides/history
   * Params: PageIndex, PageSize
   */
  getRideHistory: async (pageIndex = 1, pageSize = 10) => {
    try {
      const response = await apiClient.get("/api/customer/rides/history", {
        params: { PageIndex: pageIndex, PageSize: pageSize },
      });
      return response;
    } catch (error) {
      throw error;
    }
  },
};

export default customerService;
