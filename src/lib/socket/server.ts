import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { NextApiRequest, NextApiResponse } from "next";
import jwt from "jsonwebtoken";
import { connectDB } from "@/lib/db/mongodb";
import { User } from "@/models/User";

interface SocketWithAuth extends Socket {
  userId?: string;
  user?: any;
}

export interface ServerToClientEvents {
  "message:receive": (message: any) => void;
  "user:online": (userId: string) => void;
  "user:offline": (userId: string) => void;
  "typing:start": (data: { userId: string; chatId: string; userName: string }) => void;
  "typing:stop": (data: { userId: string; chatId: string }) => void;
  "chat:created": (chat: any) => void;
}

export interface ClientToServerEvents {
  "user:join": (data: { token: string }) => void;
  "user:leave": () => void;
  "message:send": (message: any) => void;
  "typing:start": (data: { chatId: string }) => void;
  "typing:stop": (data: { chatId: string }) => void;
  "chat:join": (chatId: string) => void;
  "chat:leave": (chatId: string) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId: string;
  user: any;
}

let io: SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>;

const connectedUsers = new Map<string, string>(); // userId -> socketId
const userSockets = new Map<string, string>(); // socketId -> userId

export const initializeSocket = (server: HTTPServer) => {
  io = new SocketIOServer<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
    cors: {
      origin: process.env.NEXTAUTH_URL || "http://localhost:3000",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  // Authentication middleware
  io.use(async (socket: any, next) => {
    try {
      const token = socket.handshake.auth.token;
      
      if (!token) {
        return next(new Error("Authentication token required"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      
      await connectDB();
      const user = await User.findById(decoded.userId).select("-password");
      
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.userId = user._id.toString();
      socket.user = user;
      next();
    } catch (error) {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket: any) => {
    console.log(`User connected: ${socket.user.name} (${socket.userId})`);

    // Store user connection
    connectedUsers.set(socket.userId, socket.id);
    userSockets.set(socket.id, socket.userId);

    // Notify others that user is online
    socket.broadcast.emit("user:online", socket.userId);

    // Join user to their personal room
    socket.join(`user:${socket.userId}`);

    // Handle joining chat rooms
    socket.on("chat:join", (chatId: string) => {
      socket.join(`chat:${chatId}`);
      console.log(`User ${socket.user.name} joined chat: ${chatId}`);
    });

    // Handle leaving chat rooms
    socket.on("chat:leave", (chatId: string) => {
      socket.leave(`chat:${chatId}`);
      console.log(`User ${socket.user.name} left chat: ${chatId}`);
    });

    // Handle message sending
    socket.on("message:send", (message: any) => {
      // Broadcast to all users in the chat except sender
      socket.to(`chat:${message.chatId}`).emit("message:receive", message);
    });

    // Handle typing indicators
    socket.on("typing:start", (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit("typing:start", {
        userId: socket.userId,
        chatId: data.chatId,
        userName: socket.user.name,
      });
    });

    socket.on("typing:stop", (data: { chatId: string }) => {
      socket.to(`chat:${data.chatId}`).emit("typing:stop", {
        userId: socket.userId,
        chatId: data.chatId,
      });
    });

    // Handle disconnection
    socket.on("disconnect", () => {
      console.log(`User disconnected: ${socket.user.name} (${socket.userId})`);
      
      // Remove user from connected users
      connectedUsers.delete(socket.userId);
      userSockets.delete(socket.id);

      // Notify others that user is offline
      socket.broadcast.emit("user:offline", socket.userId);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

export const getConnectedUsers = () => {
  return Array.from(connectedUsers.keys());
};

export const isUserOnline = (userId: string) => {
  return connectedUsers.has(userId);
};

export const emitToUser = (userId: string, event: string, data: any) => {
  const socketId = connectedUsers.get(userId);
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

export const emitToChat = (chatId: string, event: string, data: any) => {
  if (io) {
    io.to(`chat:${chatId}`).emit(event, data);
  }
};

