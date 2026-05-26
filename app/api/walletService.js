import apiClient from './apiClient';

/**
 * Wallet related API endpoints
 * Spec: https://api.tezride.pk
 */
export const walletService = {
  /**
   * Retrieves current wallet balance and recent transactions.
   * GET /api/customer/wallet/balance
   */
  getBalance: async () => {
    return apiClient.get('/api/customer/rides/balance');
  },

  /**
   * Requests to top up wallet balance.
   * POST /api/customer/wallet/topup
   * @param {number} amount
   */
  topup: async (amount) => {
    return apiClient.post('/api/customer/wallet/topup', { amount });
  },
};

export default walletService;
