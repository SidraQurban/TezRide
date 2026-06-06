import { Audio } from 'expo-av';

/**
 * SoundService
 * Manages multiple notification sounds for the application.
 */

const SOUNDS = {
  notification: require('../../assets/notification_alert.mp3'),
  completed: require('../../assets/completed_ride_alert.mp3'),
};

let loadedSounds = {};

const SoundService = {
  /**
   * Preloads all notification sounds into memory.
   */
  preload: async () => {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: false,
        shouldDuckAndroid: false,
      });

      for (const [key, source] of Object.entries(SOUNDS)) {
        if (!loadedSounds[key]) {
          const { sound } = await Audio.Sound.createAsync(source);
          loadedSounds[key] = sound;
        }
      }
      console.log('[SoundService] All sounds preloaded.');
    } catch (error) {
      console.warn('[SoundService] Preload failed:', error?.message);
    }
  },

  /**
   * Plays a specific sound by key.
   * @param {string} key - 'notification' or 'completed'
   */
  play: async (key = 'notification') => {
    try {
      const sound = loadedSounds[key];
      if (sound) {
        await sound.setPositionAsync(0);
        await sound.playAsync();
      } else {
        // Effort to load on demand if not preloaded
        const { sound: newSound } = await Audio.Sound.createAsync(SOUNDS[key]);
        loadedSounds[key] = newSound;
        await newSound.playAsync();
      }
    } catch (error) {
      console.warn(`[SoundService] Play failed for ${key}:`, error?.message);
    }
  },

  /**
   * Release all sound objects.
   */
  unload: async () => {
    try {
      for (const key in loadedSounds) {
        await loadedSounds[key].unloadAsync();
      }
      loadedSounds = {};
      console.log('[SoundService] All sounds unloaded.');
    } catch (error) {
      console.warn('[SoundService] Unload failed:', error?.message);
    }
  },
};

export default SoundService;
