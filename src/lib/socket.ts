import { io, Socket } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private messageQueue: Array<{ event: string; data: any }> = [];

  private constructor() {
    this.connect();
    this.setupListeners();
  }

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  private connect() {
    if (this.socket?.connected) {
      console.log('Socket already connected');
      return;
    }

    this.socket = io(SOCKET_URL, {
      autoConnect: false,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectDelay,
      timeout: 20000,
      path: '/socket.io',
      withCredentials: true,
      forceNew: true
    });

    this.socket.connect();

    console.log('Attempting to connect to socket server at:', SOCKET_URL);
    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error details:', {
        error: error.message,
        type: error.type,
        description: error.description
      });
    });
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('Socket connected successfully');
      this.reconnectAttempts = 0;
      this.processMessageQueue();
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      if (reason === 'io server disconnect') {
        setTimeout(() => this.connect(), 5000);
      }
    });
  }

  private processMessageQueue() {
    while (this.messageQueue.length > 0) {
      const message = this.messageQueue.shift();
      if (message && this.socket?.connected) {
        this.socket.emit(message.event, message.data);
      }
    }
  }

  public disconnect() {
    if (this.socket?.connected) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  public on(event: string, callback: (...args: any[]) => void) {
    if (!this.socket) {
      console.error('Socket not initialized');
      return () => {};
    }

    this.socket.on(event, callback);
    return () => {
      if (this.socket) {
        this.socket.off(event, callback);
      }
    };
  }

  public async emit(event: string, data: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.socket?.connected) {
        console.error('Socket not connected');
        this.messageQueue.push({ event, data });
        this.connect();
        reject(new Error('Socket not connected'));
        return;
      }

      try {
        this.socket.emit(event, data, () => {
          resolve();
        });
      } catch (error) {
        console.error(`Error emitting ${event}:`, error);
        reject(error);
      }
    });
  }

  public isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketManager = SocketManager.getInstance();

export function useSocket() {
  return {
    socket: socketManager,
    isConnected: socketManager.isConnected(),
    connect: () => socketManager.connect(),
    disconnect: () => socketManager.disconnect()
  };
}