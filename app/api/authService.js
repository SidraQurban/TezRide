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
    // Format: 92xxxxxxxxxx (strip '+' if present)
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;
    
    return apiClient.post(
      `/api/Account/send-otp?phoneNumber=${encodeURIComponent(formattedNumber)}`
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
    // Format: 92xxxxxxxxxx (strip '+' if present)
    const formattedNumber = phoneNumber.startsWith('+') ? phoneNumber.substring(1) : phoneNumber;

    const response = await apiClient.post('/api/Account/verify-otp', {
      phoneNumber: formattedNumber,
      otp,
      role,
    });

    if (response.succeeded && response.data?.jwToken) {
      await authService._persistSession(response.data);
    }

    return response;
  },

  /**
   * Safe and robust helper to parse JWT token expiration.
   */
  isTokenExpired: (token) => {
    if (!token) return true;
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return true;
      const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
      
      let jsonPayload = '';
      if (typeof atob === 'function') {
        jsonPayload = atob(payloadBase64);
      } else {
        // Safe character-by-character base64 decoding fallback for cross-platform compliance
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        const str = payloadBase64.replace(/=+$/, '');
        let buffer = 0;
        let bits = 0;
        for (let i = 0; i < str.length; i++) {
          const idx = chars.indexOf(str.charAt(i));
          if (idx === -1) continue;
          buffer = (buffer << 6) | idx;
          bits += 6;
          if (bits >= 8) {
            bits -= 8;
            jsonPayload += String.fromCharCode((buffer >> bits) & 0xff);
          }
        }
      }
      
      const decoded = JSON.parse(jsonPayload);
      if (!decoded || !decoded.exp) return true;
      
      // Use a 60-second early expiry safety cushion
      const currentTime = Math.floor(Date.now() / 1000);
      return decoded.exp < (currentTime + 60);
    } catch (e) {
      return true;
    }
  },

  /**
   * Ensures the stored access token is valid and fresh.
   * If expired, silently refreshes using the refresh token.
   */
  ensureValidToken: async () => {
    try {
      const token = await storage.getItem('jwToken');
      if (!token) return false;

      if (authService.isTokenExpired(token)) {
        console.log('[Auth] Token is expired, performing silent refresh...');
        const refreshedToken = await authService.refreshToken();
        return !!refreshedToken;
      }
      return true;
    } catch (error) {
      console.warn('[Auth] Silent startup token validation/refresh failed:', error);
      await authService.logout();
      return false;
    }
  },

  /**
   * Refreshes the access token using the stored refresh token.
   */
  refreshToken: async () => {
    const token = await storage.getItem('jwToken');
    const refreshToken = await storage.getItem('refreshToken');
    if (!refreshToken) throw new Error('No refresh token available');

    try {
      // Shared backend expects both expired token and refresh token
      const response = await apiClient.post(`/api/Account/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`);
      if (response.succeeded && response.data.jwToken) {
        await authService._persistSession(response.data, false);
        return response.data.jwToken;
      }
      throw new Error('Token refresh failed');
    } catch (error) {
      await authService.logout();
      throw error;
    }
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
    await storage.removeItem('customerPhone');
    await storage.removeItem('customerGender');
    await storage.removeItem('customerStatus');
    await storage.removeItem('riderStatus');
    await storage.removeItem('profilePictureUrl');

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

  /**
   * Fetches full user profile details.
   * GET /api/user/{id}
   */
  getUserProfile: async (userId) => {
    return apiClient.get(`/api/user/${userId}`);
  },

  /**
   * Update user profile details.
   * PUT /api/user/profile
   */
  updateProfile: async (profileData) => {
    return apiClient.put('/api/user/profile', profileData);
  },

  /**
   * Submits customer verification data.
   * POST /api/user/verify/customer
   * formData must be multipart/form-data
   */
  submitCustomerVerification: async (formData) => {
    return apiClient.post('/api/user/verify/customer', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },

  // ── Internal helpers ────────────────────────────────────────────────────

  /**
   * Persists the full auth session from a successful login or token refresh.
   * Also reconnects the SignalR hub with the new token.
   *
   * @param {AuthDto} data  – The `data` field from the API response
   */
  _persistSession: async (data, shouldRestartHub = true) => {
    if (data.jwToken) await storage.setItem('jwToken', data.jwToken);
    if (data.refreshToken) await storage.setItem('refreshToken', data.refreshToken);
    if (data.id) await storage.setItem('userId', data.id);
    
    // Default or provided values
    await storage.setItem('userRole', data.roles?.[0] || 'Customer');

    // Persist display fields used by ride requests
    if (data.username) {
      await storage.setItem('customerName', data.username);
    }
    if (data.gender !== null && data.gender !== undefined) {
      await storage.setItem('customerGender', String(data.gender));
    }
    if (data.customerStatus) {
      await storage.setItem('customerStatus', data.customerStatus);
    }
    if (data.riderStatus) {
      await storage.setItem('riderStatus', data.riderStatus);
    }

    console.log('[Auth] Session persisted. userId:', data.id || 'preserved');

    // Only restart the hub if explicitly requested (e.g., on initial login)
    // Background refreshes should NOT restart the hub as the HubConnection
    // handles token retrieval via accessTokenFactory.
    if (shouldRestartHub) {
      try {
        const { default: customerHub } = require('./customerHub');
        await customerHub.stop();
        await customerHub.start();
      } catch (_) {
        // Hub start failures are handled inside customerHub.start()
      }
    }
  },
};

export { authService };
export default authService;
