import * as signalR from '@microsoft/signalr';
import storage from '../utils/storage';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.tezride.pk';
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const HUB_URL = `${BASE_URL}/hubs/customers`;

// Maximum network-error retries (does NOT apply to auth failures)
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 5000;

class CustomerHub {
  constructor() {
    this.connection = null;
    this.callbacks = {};
    this._retryCount = 0;
  }

  async start() {
    // Already connected — nothing to do
    if (
      this.connection &&
      this.connection.state === signalR.HubConnectionState.Connected
    ) {
      return;
    }

    const token = await storage.getItem('jwToken');

    if (!token) {
      console.warn('[CustomerHub] No auth token found — hub will not connect.');
      return;
    }

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => storage.getItem('jwToken'),
        // Force WebSockets and skip negotiation for better reliability in production
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          if (retryContext.previousRetryCount < 3) return 2000;
          if (retryContext.previousRetryCount < 10) return 5000;
          return null; // stop after 10 attempts
        },
      })
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Register all server → client event listeners
    this._registerListeners();

    try {
      await this.connection.start();
      this._retryCount = 0; // reset on successful connect
      console.log('[CustomerHub] Connected.');
    } catch (err) {
      const errMsg = err?.message || String(err);

      // 401 = token rejected by server — do NOT retry, token is invalid
      if (errMsg.includes('401') || errMsg.includes('Unauthorized')) {
        console.warn(
          '[CustomerHub] 401 Unauthorized — token invalid or expired. Not retrying.'
        );
        this.connection = null;
        return;
      }

      // Network / transient error — retry with cap
      if (this._retryCount < MAX_RETRIES) {
        this._retryCount++;
        console.warn(
          `[CustomerHub] Connection failed (attempt ${this._retryCount}/${MAX_RETRIES}). Retrying in ${RETRY_DELAY_MS / 1000}s...`
        );
        setTimeout(() => this.start(), RETRY_DELAY_MS);
      } else {
        console.error(
          '[CustomerHub] Max retries reached. Hub will not reconnect automatically.'
        );
        this._retryCount = 0;
        this.connection = null;
      }
    }
  }

  _registerListeners() {
    // ── Server → Client Events ─────────────────────────────────────────────

    // A driver accepted the wave request.
    // Payload: { rideId, driverInfo: NearbyDriverDto }
    this.connection.on('driver_interested', (payload) => {
      console.log('[CustomerHub] driver_interested:', payload);
      this._trigger('driver_interested', payload);
    });

    // Final confirmation of the chosen driver.
    // Payload: { rideId, driverId }
    this.connection.on('ride_assigned', (payload) => {
      console.log('[CustomerHub] ride_assigned:', payload);
      this._trigger('ride_assigned', payload);
    });

    // Live driver coordinates update.
    // Payload: { driverId, lat, lon }
    this.connection.on('driver_location_changed', (payload) => {
      console.log('[CustomerHub] driver_location_changed:', payload);
      this._trigger('driver_location_changed', payload);
    });

    // Ride finalized with fare receipt.
    // Payload: { rideId, finalFare, currency }
    this.connection.on('ride_completed', (payload) => {
      console.log('[CustomerHub] ride_completed:', payload);
      this._trigger('ride_completed', payload);
    });

    // Real-time status update (DriverArrived, InTransit, etc)
    // Payload: { event: "ride_status_updated", rideId, status }
    this.connection.on('ride_status_updated', (payload) => {
      console.log('[CustomerHub] ride_status_updated:', payload);
      this._trigger('ride_status_updated', payload);
    });

    // All waves exhausted — no driver found.
    // Payload: { rideId }
    this.connection.on('no_drivers_found', (payload) => {
      console.log('[CustomerHub] no_drivers_found:', payload);
      this._trigger('no_drivers_found', payload);
    });

    // New H3 wave search started.
    // Payload: { rideId, currentWave, maxWaves, minRing, maxRing }
    this.connection.on('search_progress', (payload) => {
      console.log('[CustomerHub] search_progress:', payload);
      this._trigger('search_progress', payload);
    });

    // Response to SelectDriver (success).
    // Payload: { rideId, driverId, success: true }
    this.connection.on('DriverSelected', (payload) => {
      console.log('[CustomerHub] DriverSelected:', payload);
      this._trigger('DriverSelected', payload);
    });

    // Response to SelectDriver (failure).
    // Payload: { rideId, reason }
    this.connection.on('SelectDriverFailed', (payload) => {
      console.log('[CustomerHub] SelectDriverFailed:', payload);
      this._trigger('SelectDriverFailed', payload);
    });

    // Response to CancelRide.
    // Payload: { rideId, success: true }
    this.connection.on('RideCancelled', (payload) => {
      console.log('[CustomerHub] RideCancelled:', payload);
      this._trigger('RideCancelled', payload);
    });

    // Wave drivers update during search.
    // Payload: { rideId, waveNumber, drivers: [...] }
    this.connection.on('wave_drivers', (payload) => {
      console.log('[CustomerHub] wave_drivers:', payload);
      this._trigger('wave_drivers', payload);
    });
  }

  // ── Client → Server Methods ──────────────────────────────────────────────

  /**
   * Finalises the choice of driver.
   * @param {string} rideId
   * @param {string} driverId
   */
  async selectDriver(rideId, driverId) {
    if (!this.isConnected()) {
      console.warn('[CustomerHub] selectDriver: not connected.');
      return;
    }
    return this.connection.invoke('SelectDriver', rideId, driverId);
  }

  /**
   * Fetches the nearby idle drivers before booking.
   */
  async getNearbyDrivers(vehicleType, lat, lon, gender) {
    if (!this.isConnected()) {
      return [];
    }
    try {
      return await this.connection.invoke('GetNearbyDrivers', vehicleType, lat, lon, gender || 'male');
    } catch (e) {
      console.warn('[CustomerHub] getNearbyDrivers failed:', e);
      return [];
    }
  }

  /**
   * Aborts an active searching process.
   * @param {string} rideId
   */
  async cancelRide(rideId) {
    if (!this.isConnected()) {
      // Throw so callers (e.g. confirmCancelRide) can catch and run their offline fallback path.
      throw new Error('CustomerHub is not connected. Cannot send CancelRide.');
    }
    return this.connection.invoke('CancelRide', rideId);
  }

  /**
   * Explicitly updates/submits high-quality address names to the server.
   * @param {string} rideId 
   * @param {string} pickupAddress 
   * @param {string} dropoffAddress 
   */
  async submitRideAddresses(rideId, pickupAddress, dropoffAddress) {
    if (!this.isConnected()) return;
    try {
      await this.connection.invoke('SubmitRideAddresses', rideId, pickupAddress, dropoffAddress);
    } catch (e) {
      console.warn('[CustomerHub] submitRideAddresses failed:', e);
    }
  }

  /** Returns true when the hub is actively connected. */
  isConnected() {
    return (
      this.connection !== null &&
      this.connection.state === signalR.HubConnectionState.Connected
    );
  }

  // ── Event Management ─────────────────────────────────────────────────────

  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(
        (cb) => cb !== callback
      );
    }
  }

  _trigger(event, payload) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach((cb) => cb(payload));
    }
  }

  async stop() {
    if (this.connection) {
      try {
        await this.connection.stop();
      } catch (_) {
        // Ignore errors when stopping
      }
      this.connection = null;
      console.log('[CustomerHub] Disconnected.');
    }
    this._retryCount = 0;
  }
}

const customerHub = new CustomerHub();
export default customerHub;
