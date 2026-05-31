import apiClient from './apiClient';

const logisticsService = {
  createDelivery: async (deliveryData) => {
    try {
      const response = await apiClient.post('/api/customer/Logistics/delivery', deliveryData);
      return response;
    } catch (error) {
      throw error;
    }
  },
  
  getDeliveryStatus: async (orderId) => {
    try {
      const response = await apiClient.get(`/api/customer/Logistics/delivery/${orderId}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
};

export default logisticsService;
