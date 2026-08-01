import type { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { verifyToken } from "./auth";
import { prisma } from "./prisma";

let io: SocketServer | null = null;

export function initSocketServer(httpServer: HttpServer) {
  io = new SocketServer(httpServer, {
    path: "/api/socketio",
    addTrailingSlash: false,
    cors: {
      origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token as string | undefined;
    if (!token) {
      return next(new Error("Authentication required"));
    }

    const payload = verifyToken(token);
    if (!payload) {
      return next(new Error("Invalid token"));
    }

    socket.data.userId = payload.userId;
    next();
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId as string;
    socket.join(`user:${userId}`);

    socket.on("join_conversation", (conversationId: string) => {
      socket.join(`conversation:${conversationId}`);
    });

    socket.on(
      "send_message",
      async (data: {
        conversationId: string;
        content: string;
        receiverId: string;
        listingId: string;
      }) => {
        try {
          const message = await prisma.message.create({
            data: {
              conversationId: data.conversationId,
              senderId: userId,
              receiverId: data.receiverId,
              listingId: data.listingId,
              content: data.content.trim(),
            },
            include: {
              sender: { select: { id: true, name: true } },
            },
          });

          io?.to(`conversation:${data.conversationId}`).emit(
            "new_message",
            message
          );
          io?.to(`user:${data.receiverId}`).emit("message_notification", {
            conversationId: data.conversationId,
            message,
          });
        } catch (error) {
          console.error("Socket message error:", error);
          socket.emit("message_error", { error: "Failed to send message" });
        }
      }
    );

    socket.on("disconnect", () => {
      socket.leave(`user:${userId}`);
    });
  });

  return io;
}

export function getIO() {
  return io;
}
