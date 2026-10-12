import { io } from "socket.io-client";

let socket = null;

export const connectSocket = (token) => {
  if (!token) return null;

  if (socket?.connected) {
    return socket;
  }

  socket = io(
    import.meta.env.VITE_SOCKET_URL || "https://chat-application-6fgd.onrender.com",
    {
      auth: {
        token,
      },
      transports: ["websocket"],
    }
  );

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};