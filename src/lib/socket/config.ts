import { SocketConfig } from './types';

export const SOCKET_CONFIG: SocketConfig = {
  url: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  options: {
    autoConnect: false,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
    timeout: 10000,
    transports: ['websocket'],
    path: '/socket.io/',
    withCredentials: true,
    forceNew: true
  }
};