import customerHub from '../api/customerHub';
import SoundService from './SoundService';

/**
 * RIDE EVENT → SOUND/ALERT CONFIG
 * Defines which WebSocket events trigger a foreground sound alert
 * and what message to show.
 */
const RIDE_SOUND_EVENTS = {
  // A driver showed interest in the ride
  driver_interested: {
    title: '👋 New Driver Offer',
    message: 'A driver is interested in your ride request. Tap to view and select.',
    playSound: true,
  },
  DriverInterested: {
    title: '👋 New Driver Offer',
    message: 'A driver is interested in your ride request. Tap to view and select.',
    playSound: true,
  },
  // A driver accepted and was assigned
  ride_assigned: {
    title: '🚗 Driver On the Way!',
    message: 'A driver has been assigned to your ride.',
    playSound: true,
  },
  RideAssigned: {
    title: '🚗 Driver On the Way!',
    message: 'A driver has been assigned to your ride.',
    playSound: true,
  },
  // Ride status updates (DriverArrived, InTransit, etc.)
  ride_status_updated: {
    getContent: (payload) => {
      const status = payload?.status?.toLowerCase?.() || '';
      if (status.includes('arrived')) {
        return { title: '📍 Driver Arrived!', message: 'Your driver is waiting at the pickup point.', playSound: true };
      }
      if (status.includes('transit') || status.includes('started')) {
        return { title: '🚀 Trip Started!', message: 'You are now on your way to the destination.', playSound: true };
      }
      return null; // No alert for other statuses
    },
  },
  RideStatusUpdated: {
    getContent: (payload) => {
      const status = payload?.status?.toLowerCase?.() || '';
      if (status.includes('arrived')) {
        return { title: '📍 Driver Arrived!', message: 'Your driver is waiting at the pickup point.', playSound: true };
      }
      if (status.includes('transit') || status.includes('started')) {
        return { title: '🚀 Trip Started!', message: 'You are now on your way to the destination.', playSound: true };
      }
      return null;
    },
  },
  // Trip completed with fare
  ride_completed: {
    title: '✅ Trip Completed',
    message: 'You have arrived at your destination. Tap to rate your driver.',
    playSound: true,
    soundKey: 'completed',
  },
  RideCompleted: {
    title: '✅ Trip Completed',
    message: 'You have arrived at your destination. Tap to rate your driver.',
    playSound: true,
    soundKey: 'completed',
  },
  // No driver found after all waves exhausted
  no_drivers_found: {
    title: '😔 No Drivers Found',
    message: 'We could not find a driver nearby. Please try again.',
    playSound: true,
  },
  NoDriversFound: {
    title: '😔 No Drivers Found',
    message: 'We could not find a driver nearby. Please try again.',
    playSound: true,
  },
  // Ride was cancelled (by driver or system)
  RideCancelled: {
    title: '❌ Ride Cancelled',
    message: 'Your ride has been cancelled.',
    playSound: true,
  },
};

/**
 * RideNotificationBridge
 * Bridges WebSocket (CustomerHub) events to foreground sound alerts.
 * When the app is in the background, FCM push notifications handle delivery.
 */
const RideNotificationBridge = {
  _handlers: {},
  _alertCallback: null,

  /**
   * Start listening to CustomerHub WebSocket events.
   * @param {function} showAlertFn - Callback to display an in-app banner.
   *   Signature: showAlertFn({ title, message, type })
   */
  start: (showAlertFn) => {
    RideNotificationBridge._alertCallback = showAlertFn;

    Object.keys(RIDE_SOUND_EVENTS).forEach((event) => {
      const config = RIDE_SOUND_EVENTS[event];

      const handler = async (payload) => {
        // Resolve content — static or dynamic
        let content;
        if (typeof config.getContent === 'function') {
          content = config.getContent(payload);
        } else {
          content = { title: config.title, message: config.message, playSound: config.playSound };
        }

        if (!content) return; // Event has no alert configured for this payload

        // Play sound
        if (content.playSound) {
          SoundService.play(config.soundKey || 'notification').catch(() => {});
        }

        // Show in-app toast/alert
        if (RideNotificationBridge._alertCallback) {
          RideNotificationBridge._alertCallback({
            title: content.title,
            message: content.message,
            type: 'info',
          });
        }
      };

      // Register on the hub
      customerHub.on(event, handler);
      // Keep a reference for cleanup
      RideNotificationBridge._handlers[event] = handler;
    });

    console.log('[RideNotificationBridge] Started — listening to ride events.');
  },

  /**
   * Stop listening and clean up all handlers.
   */
  stop: () => {
    Object.entries(RideNotificationBridge._handlers).forEach(([event, handler]) => {
      customerHub.off(event, handler);
    });
    RideNotificationBridge._handlers = {};
    RideNotificationBridge._alertCallback = null;
    console.log('[RideNotificationBridge] Stopped.');
  },
};

export default RideNotificationBridge;
