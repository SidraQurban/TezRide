import apiClient from './apiClient';
import storage from '../utils/storage';

/**
 * Authentication related API endpoints
 */
export const authService = {
  /**
   * Sends an OTP to the specified phone number.
   * @param {string} phoneNumber - The user's phone number
   */
  sendOTP: async (phoneNumber) => {
    // For development, we always return success
    return {
      succeeded: true,
      message: "OTP sent successfully (Mock)"
    };
    // return apiClient.post(`/api/Account/send-otp?phoneNumber=${encodeURIComponent(phoneNumber)}`);
  },

  /**
   * Verifies the OTP and logs in the user.
   * @param {string} phoneNumber - The user's phone number
   * @param {string} otp - The OTP received
   * @param {string} role - The user's role (Customer or Rider)
   */
  verifyOTP: async (phoneNumber, otp, role = 'Customer') => {
    // Static OTP for testing
    if (otp === '000000') {
      const mockResponse = {
        succeeded: true,
        data: {
          jwToken: "mock-dev-token",
          refreshToken: "mock-refresh-token",
          id: "dev-user-id",
        }
      };
      await storage.setItem('jwToken', mockResponse.data.jwToken);
      await storage.setItem('refreshToken', mockResponse.data.refreshToken);
      await storage.setItem('userId', mockResponse.data.id);
      await storage.setItem('userRole', role);
      return mockResponse;
    }

    const response = await apiClient.post(`/api/Account/verify-otp?phoneNumber=${encodeURIComponent(phoneNumber)}&otp=${otp}&role=${role}`);
    
    if (response.succeeded && response.data.jwToken) {
      await storage.setItem('jwToken', response.data.jwToken);
      await storage.setItem('refreshToken', response.data.refreshToken);
      await storage.setItem('userId', response.data.id);
      await storage.setItem('userRole', role);
    }
    
    return response;
  },

  /**
   * Refreshes the access token using the stored refresh token.
   */
  refreshToken: async () => {
    const refreshToken = await storage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    try {
      const response = await apiClient.post('/api/Account/refresh-token', { refreshToken });
      if (response.succeeded && response.data.jwToken) {
        await storage.setItem('jwToken', response.data.jwToken);
        await storage.setItem('refreshToken', response.data.refreshToken);
        return response.data.jwToken;
      }
      throw new Error('Token refresh failed');
    } catch (error) {
      await authService.logout();
      throw error;
    }
  },

  /**
   * Logs out the user by clearing the stored tokens.
   */
  logout: async () => {
    await storage.removeItem('jwToken');
    await storage.removeItem('refreshToken');
    await storage.removeItem('userId');
    await storage.removeItem('userRole');
  },

  /**
   * Checks if the user is currently authenticated.
   */
  isAuthenticated: async () => {
    const token = await storage.getItem('jwToken');
    return !!token;
  }
};

export default authService;
