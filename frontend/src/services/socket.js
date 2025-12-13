import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

let socket = null;

export const initializeSocket = (userId, isAdmin = false) => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('✅ Connected to Socket.io server');
      
      if (isAdmin) {
        socket.emit('join_admin');
      } else {
        socket.emit('join', userId);
      }
    });

    socket.on('disconnect', () => {
      console.log('❌ Disconnected from Socket.io server');
    });
  }

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};