"use client";

import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

export function getSocket(token: string) {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_APP_URL || "", {
      path: "/api/socketio",
      auth: { token },
      autoConnect: false,
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
