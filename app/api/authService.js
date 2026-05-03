import apiClient from './apiClient';
import storage from '../utils/storage';

/**
 * Authentication service
 *
 * Storage keys used:
 *   jwToken         – Bearer access token
 *   refreshToken    – Opaque refresh token
 *   userId          – Authenticated user's UUID
 *   userRole        – Always "Customer" for this app
 *   customerName    – Display name (username from response)
 *   customerGender  – gender field from response (may be null)
 */
const authService = {
  /**
   * Step 1 — Send OTP to the user's phone number.
   * POST /api/Account/send-otp?phoneNumber=...
   *
   * @param {string} phoneNumber – E.164 format e.g. "+923001234567"
   * @returns {{ succeeded: boolean, message: string, data: boolean }}
   */
  sendOTP: async (phoneNumber) => {
    return apiClient.post(
      `/api/Account/send-otp?phoneNumber=${encodeURIComponent(phoneNumber)}`
    );
  },

  /**
   * Step 2 — Verify OTP and receive access + refresh tokens.
   * POST /api/Account/verify-otp?phoneNumber=...&otp=...&role=Customer
   *
   * On success, persists jwToken, refreshToken, userId, userRole,
   * customerName, and customerGender to AsyncStorage.
   *
   * @param {string} phoneNumber
   * @param {string} otp
   * @param {string} [role="Customer"]
   * @returns {{ succeeded: boolean, message: string, data: AuthDto }}
   */
  verifyOTP: async (phoneNumber, otp, role = 'Customer') => {
    const response = await apiClient.post(
      `/api/Account/verify-otp?phoneNumber=${encodeURIComponent(phoneNumber)}&otp=${encodeURIComponent(otp)}&role=${encodeURIComponent(role)}`
    );

    if (response.succeeded && response.data?.jwToken) {
      await authService._persistSession(response.data);
    }

    return response;
  },

  /**
   * Step 3 — Exchange a refresh token for a new access token.
   * POST /api/Account/refresh-token?refreshToken=...
   *
   * Called automatically by apiClient's 401 interceptor.
   *
   * @returns {string} New jwToken
   * @throws {Error} If refresh fails (triggers logout)
   */
  refreshToken: async () => {
    const storedRefreshToken = await storage.getItem('refreshToken');
    if (!storedRefreshToken) {
      throw new Error('No refresh token stored. Please log in again.');
    }

    const response = await apiClient.post(
      `/api/Account/refresh-token?refreshToken=${encodeURIComponent(storedRefreshToken)}`
    );

    if (response.succeeded && response.data?.jwToken) {
      await authService._persistSession(response.data);
      return response.data.jwToken;
    }

    throw new Error('Token refresh failed. Please log in again.');
  },

  /**
   * Clears all auth data from storage and disconnects the SignalR hub.
   */
  logout: async () => {
    await storage.removeItem('jwToken');
    await storage.removeItem('refreshToken');
    await storage.removeItem('userId');
    await storage.removeItem('userRole');
    await storage.removeItem('customerName');
    await storage.removeItem('customerGender');

    // Disconnect SignalR hub on logout to prevent stale connections
    try {
      const { default: customerHub } = require('./customerHub');
      await customerHub.stop();
    } catch (_) {
      // Hub may already be disconnected
    }

    console.log('[Auth] User logged out. All tokens cleared.');
  },

  /**
   * Returns true if a valid (non-expired) access token exists in storage.
   */
  isAuthenticated: async () => {
    const token = await storage.getItem('jwToken');
    return !!token;
  },

  // ── Internal helpers ────────────────────────────────────────────────────

  /**
   * Persists the full auth session from a successful login or token refresh.
   * Also reconnects the SignalR hub with the new token.
   *
   * @param {AuthDto} data  – The `data` field from the API response
   */
  _persistSession: async (data) => {
    await storage.setItem('jwToken', data.jwToken);
    await storage.setItem('refreshToken', data.refreshToken);
    await storage.setItem('userId', data.id);
    await storage.setItem('userRole', 'Customer');

    // Persist display fields used by ride requests
    if (data.username) {
      await storage.setItem('customerName', data.username);
    }
    if (data.gender !== null && data.gender !== undefined) {
      await storage.setItem('customerGender', String(data.gender));
    }

    console.log('[Auth] Session persisted. userId:', data.id);

    // Start (or restart) the SignalR hub with the fresh token
    try {
      const { default: customerHub } = require('./customerHub');
      // Stop any existing connection first so registerListeners isn't called twice
      await customerHub.stop();
      await customerHub.start();
    } catch (_) {
      // Hub start failures are handled inside customerHub.start()
    }
  },
};

export { authService };
export default authService;
