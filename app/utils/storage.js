import AsyncStorage from '@react-native-async-storage/async-storage';

// In-memory fallback for environments where native storage is unavailable (e.g. some web configs or broken native links)
const memoryStorage = {};
let nativeModuleError = false;

const storage = {
  getItem: async (key) => {
    if (nativeModuleError) return memoryStorage[key] || null;
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      if (!nativeModuleError) {
        console.warn('AsyncStorage native module is unavailable, switching to memory fallback.');
        nativeModuleError = true;
      }
      return memoryStorage[key] || null;
    }
  },
  setItem: async (key, value) => {
    if (nativeModuleError) {
      memoryStorage[key] = value;
      return;
    }
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      if (!nativeModuleError) {
        console.warn('AsyncStorage native module is unavailable, switching to memory fallback.');
        nativeModuleError = true;
      }
      memoryStorage[key] = value;
    }
  },
  removeItem: async (key) => {
    if (nativeModuleError) {
      delete memoryStorage[key];
      return;
    }
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      nativeModuleError = true;
      delete memoryStorage[key];
    }
  },
  clear: async () => {
    if (nativeModuleError) {
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
      return;
    }
    try {
      await AsyncStorage.clear();
    } catch (e) {
      nativeModuleError = true;
      Object.keys(memoryStorage).forEach(key => delete memoryStorage[key]);
    }
  }
};

export default storage;
