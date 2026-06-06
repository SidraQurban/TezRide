import * as signalR from '@microsoft/signalr';
import storage from '../utils/storage';

const rawBaseUrl = process.env.EXPO_PUBLIC_API_URL || 'https://api.tezride.pk';
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl.slice(0, -1) : rawBaseUrl;
const HUB_URL = `${BASE_URL}/hubs/chat`;

class ChatHub {
  constructor() {
    this.connection = null;
    this.callbacks = {};
  }

  async start() {
    if (this.connection && this.connection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    const token = await storage.getItem('jwToken');
    if (!token) return;

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, {
        accessTokenFactory: () => storage.getItem('jwToken'),
        transport: signalR.HttpTransportType.WebSockets,
        skipNegotiation: true,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this._registerListeners();

    try {
      await this.connection.start();
      console.log('[ChatHub] Connected.');
    } catch (err) {
      console.error('[ChatHub] Connection failed:', err);
    }
  }

  _registerListeners() {
    this.connection.on('JoinedChat', (payload) => {
      this._trigger('JoinedChat', payload);
    });

    this.connection.on('ReceiveMessage', (payload) => {
      this._trigger('ReceiveMessage', payload);
    });

    this.connection.on('UserTyping', (payload) => {
      this._trigger('UserTyping', payload);
    });
  }

  async joinRideChat(rideId) {
    await this.start();
    if (!this.isConnected()) {
      console.warn('[ChatHub] Cannot join chat: Not connected.');
      return;
    }
    return this.connection.invoke('JoinRideChat', rideId);
  }

  async sendMessage(rideId, content) {
    await this.start();
    if (!this.isConnected()) {
      console.warn('[ChatHub] Cannot send message: Not connected.');
      return;
    }
    return this.connection.invoke('SendMessage', rideId, content);
  }

  async typing(rideId) {
    await this.start();
    if (!this.isConnected()) return;
    return this.connection.invoke('Typing', rideId);
  }

  isConnected() {
    return this.connection !== null && this.connection.state === signalR.HubConnectionState.Connected;
  }

  on(event, callback) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(callback);
  }

  off(event, callback) {
    if (this.callbacks[event]) {
      this.callbacks[event] = this.callbacks[event].filter(cb => cb !== callback);
    }
  }

  _trigger(event, payload) {
    if (this.callbacks[event]) {
      this.callbacks[event].forEach(cb => cb(payload));
    }
  }

  async stop() {
    if (this.connection) {
      await this.connection.stop();
      this.connection = null;
    }
  }
}

const chatHub = new ChatHub();
export default chatHub;
