import apiClient from './apiClient';

const driverHireService = {
  requestDriver: async (hireData) => {
    try {
      const response = await apiClient.post('/api/customer/DriverHire/request', hireData);
      return response;
    } catch (error) {
      throw error;
    }
  },

  getSettings: async () => {
    try {
      const response = await apiClient.get('/api/customer/DriverHire/settings');
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getHireStatus: async (requestId) => {
    try {
      const response = await apiClient.get(`/api/customer/DriverHire/request/${requestId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default driverHireService;
