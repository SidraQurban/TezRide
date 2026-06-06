import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../api/apiClient';

/**
 * NotificationService
 * Handlers for Expo Push Notifications
 */

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

const PUSH_TOKEN_KEY = 'expo_push_token';

export const NotificationService = {
  /**
   * Registers for push notifications and returns the token
   * Recommended to call this on login or app startup
   */
  registerForPushNotifications: async (userId, userType) => {
    let token;

    if (!Device.isDevice) {
      console.log('Must use physical device for Push Notifications');
      return null;
    }

    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Failed to get push token for push notification!');
        return null;
      }

      // Get the token
      token = (await Notifications.getExpoPushTokenAsync({
        projectId: '3757b012-d00a-4c03-9e38-189c26489153', // From app.json
      })).data;

      console.log('Expo Push Token:', token);

      // Save locally
      await AsyncStorage.setItem(PUSH_TOKEN_KEY, token);

      // Send to backend if userId is provided
      if (userId && token) {
        await NotificationService.sendTokenToBackend(userId, token, userType);
      }

      // Setup Android Channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('ride-requests', {
          name: 'ride-requests',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF5C00',
          sound: 'notification_alert.mp3', // Corresponds to the name in app.json plugins
        });
      }

      return token;
    } catch (error) {
      console.error('Error in registerForPushNotifications:', error);
      return null;
    }
  },

  /**
   * Sends the push token to our backend API
   */
  sendTokenToBackend: async (userId, token, userType) => {
    try {
      const deviceId = Device.osInternalBuildId || Device.modelName || 'Unknown Device';
      
      const payload = {
        userId: userId,
        deviceId: deviceId,
        pushToken: token,
        userType: userType, // 'Customer' or 'Rider'
        devicePlatform: Platform.OS === 'android' ? 'Android' : 'iOS'
      };

      const response = await apiClient.post('/api/notifications/register-device', payload);
      console.log('Token registered on backend:', response.data?.message);
      return response.data?.succeeded;
    } catch (error) {
      console.error('Failed to send push token to backend:', error);
      return false;
    }
  },

  /**
   * Retrieves the stored token or fetches a new one
   */
  getPushToken: async () => {
    return await AsyncStorage.getItem(PUSH_TOKEN_KEY);
  },

  /**
   * Setup listeners for incoming notifications
   */
  setupNotificationListeners: (navigation) => {
    // Listener for notifications received while the app is foregrounded
    const foregroundSubscription = Notifications.addNotificationReceivedListener(notification => {
      console.log('Notification Received (Foreground):', notification.request.content.data);
      // You can handle foreground logic here, like showing a custom toast
    });

    // Listener for when a user taps on a notification
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      console.log('Notification Tapped:', data);

      if (data && data.type) {
        NotificationService.handleNotificationNavigation(navigation, data);
      }
    });

    return {
      foregroundSubscription,
      responseSubscription
    };
  },

  /**
   * Handle navigation based on notification type
   */
  handleNotificationNavigation: (navigation, data) => {
    const { type, rideId } = data;

    switch (type) {
      case 'NEW_RIDE_REQUEST':
        // For Riders (Partner app logic would go here, but since this is customer app we handle customer types)
        break;
      case 'DRIVER_ARRIVED':
      case 'TRIP_STARTED':
      case 'DRIVER_ASSIGNED':
        if (rideId) {
          navigation.navigate('SearchingDirection', { rideId });
        }
        break;
      case 'TRIP_COMPLETED':
        navigation.navigate('RideHistory');
        break;
      case 'RIDE_CANCELLED':
        navigation.navigate('MainDrawer');
        break;
      default:
        console.log('Unknown notification type:', type);
    }
  },

  /**
   * Clean up listeners
   */
  unregisterNotificationListeners: (subscriptions) => {
    if (subscriptions.foregroundSubscription) {
      subscriptions.foregroundSubscription.remove();
    }
    if (subscriptions.responseSubscription) {
      subscriptions.responseSubscription.remove();
    }
  }
};

export default NotificationService;
