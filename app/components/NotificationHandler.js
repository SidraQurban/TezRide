import React, { useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import NotificationService from '../utils/NotificationService';
import RideNotificationBridge from '../utils/RideNotificationBridge';
import SoundService from '../utils/SoundService';
import { useAlert } from '../context/AlertContext';
import storage from '../utils/storage';

/**
 * NotificationHandler
 * Invisible global component that manages:
 * 1. Expo push notification listeners (background tap → navigate)
 * 2. Foreground WebSocket → sound + in-app alert bridge
 * 3. Sound preloading on mount
 * 4. Push token refresh on startup
 */
const NotificationHandler = ({ children }) => {
  const navigation = useNavigation();
  const { showToast } = useAlert();
  const subscriptionsRef = useRef(null);
  const appStateRef = useRef(AppState.currentState);

  useEffect(() => {
    // 1. Preload the alert sound so it fires instantly
    SoundService.preload();

    // 2. Setup Expo push notification listeners (for background/killed → foreground taps)
    subscriptionsRef.current = NotificationService.setupNotificationListeners(navigation);

    // 3. Start the WebSocket → foreground sound bridge
    //    Pass showToast so ride events trigger a toast banner with sound
    RideNotificationBridge.start(({ title, message, type }) => {
      showToast(message, type || 'info');
    });

    // 4. Refresh push token if user is already logged in
    const refreshToken = async () => {
      const userId = await storage.getItem('userId');
      if (userId) {
        await NotificationService.registerForPushNotifications(userId, 'Customer');
      }
    };
    refreshToken();

    // 5. When app comes back to foreground, re-preload sound in case it was unloaded
    const appStateSubscription = AppState.addEventListener('change', (nextState) => {
      if (
        appStateRef.current.match(/inactive|background/) &&
        nextState === 'active'
      ) {
        SoundService.preload();
      }
      appStateRef.current = nextState;
    });

    return () => {
      // Cleanup all listeners and sound
      if (subscriptionsRef.current) {
        NotificationService.unregisterNotificationListeners(subscriptionsRef.current);
      }
      RideNotificationBridge.stop();
      SoundService.unload();
      appStateSubscription.remove();
    };
  }, [navigation]);

  return children;
};

export default NotificationHandler;
