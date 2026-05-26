import apiClient from './apiClient';

/**
 * User Preferences API
 */
const preferenceService = {
  /**
   * Gets all preferences for the current user.
   */
  getPreferences: async () => {
    return apiClient.get('/api/users/preferences');
  },

  /**
   * Saves a preference (Home, Office, etc.)
   * @param {string} key - e.g., 'Home'
   * @param {string} value - Address string or JSON
   * @param {string} category - e.g., 'Location'
   */
  savePreference: async (key, value, category = 'Location', icon = null) => {
    return apiClient.post('/api/users/preferences', {
      key,
      value,
      category,
      icon
    });
  },

  /**
   * Deletes a preference by key.
   * @param {string} key 
   */
  deletePreference: async (key) => {
    return apiClient.delete(`/api/users/preferences/${key}`);
  }
};

export default preferenceService;
