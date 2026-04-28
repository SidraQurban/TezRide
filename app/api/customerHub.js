import * as signalR from '@microsoft/signalr';
import storage from '../utils/storage';

const HUB_URL = 'https://api.tezride.pk/hubs/customers';

class CustomerHub {
  constructor() {
    this.connection = null;
    this.callbacks = {};
  }

  async start() {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = await storage.getItem('jwToken');
    
    if (!token || token === "mock-dev-token") {
      this.isMock = (token === "mock-dev-token");
      return;
    }
    
    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Register event listeners
    this.registerListeners();

    try {
      await this.connection.start();
      console.log('SignalR CustomerHub connected.');
    } catch (err) {
      console.error('SignalR Connection Error: ', err);
      // Only retry if we still have a token
      const currentToken = await storage.getItem('jwToken');
      if (currentToken) {
        setTimeout(() => this.start(), 5000); // Retry after 5s
      }
    }
  }

  registerListeners() {
    // A driver accepted the ride
    this.connection.on('driver_interested', (payload) => {
      this.trigger('driver_interested', payload);
    });

    // Customer confirmed a driver
    this.connection.on('ride_assigned', (payload) => {
      this.trigger('ride_assigned', payload);
    });

    // Search failed (all waves exhausted OR timeout)
    this.connection.on('no_drivers_found', (payload) => {
      this.trigger('no_drivers_found', payload);
    });

    // Response to SelectDriver (success)
    this.connection.on('DriverSelected', (payload) => {
      this.trigger('DriverSelected', payload);
    });

    // Response to SelectDriver (failure)
    this.connection.on('SelectDriverFailed', (payload) => {
      this.trigger('SelectDriverFailed', payload);
    });

    // Response to CancelRide
    this.connection.on('RideCancelled', (payload) => {
      this.trigger('RideCancelled', payload);
    });
  }

  // Client-to-Server Methods
  async selectDriver(rideId, driverId) {
    if (this.connection) {
      return this.connection.invoke('SelectDriver', rideId, driverId);
    }
  }

  async cancelRide(rideId) {
    if (this.connection) {
      return this.connection.invoke('CancelRide', rideId);
    }
  }

  // Event Management
  on(event, callback) {
    if (!this.callbacks[event]) {
      this.callbacks[event] = [];
    }
    this.callbacks[event].push(callback);
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  trigger(event, payload) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(callback => callback(payload));
    }
  }

  async stop() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

const customerHub = new CustomerHub();
export default customerHub;
