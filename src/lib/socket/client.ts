import { io, Socket } from "socket.io-client";
import { ClientToServerEvents, ServerToClientEvents } from "./server";

class SocketManager {
  private socket: Socket<ServerToClientEvents, ClientToServerEvents> | null = null;
  private token: string | null = null;

  connect(token: string) {
    if (this.socket?.connected) {
      return this.socket;
    }

    this.token = token;
    
    this.socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001", {
      auth: {
        token,
      },
      autoConnect: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }

  isConnected() {
    return this.socket?.connected || false;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    this.socket.on("disconnect", (reason) => {
      console.log("Disconnected from socket server:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  // Chat methods
  joinChat(chatId: string) {
    this.socket?.emit("chat:join", chatId);
  }

  leaveChat(chatId: string) {
    this.socket?.emit("chat:leave", chatId);
  }

  sendMessage(message: any) {
    this.socket?.emit("message:send", message);
  }

  // Typing methods
  startTyping(chatId: string) {
    this.socket?.emit("typing:start", { chatId });
  }

  stopTyping(chatId: string) {
    this.socket?.emit("typing:stop", { chatId });
  }

  // Event listeners
  onMessageReceive(callback: (message: any) => void) {
    this.socket?.on("message:receive", callback);
  }

  onUserOnline(callback: (userId: string) => void) {
    this.socket?.on("user:online", callback);
  }

  onUserOffline(callback: (userId: string) => void) {
    this.socket?.on("user:offline", callback);
  }

  onTypingStart(callback: (data: { userId: string; chatId: string; userName: string }) => void) {
    this.socket?.on("typing:start", callback);
  }

  onTypingStop(callback: (data: { userId: string; chatId: string }) => void) {
    this.socket?.on("typing:stop", callback);
  }

  onChatCreated(callback: (chat: any) => void) {
    this.socket?.on("chat:created", callback);
  }

  // Remove event listeners
  offMessageReceive(callback?: (message: any) => void) {
    this.socket?.off("message:receive", callback);
  }

  offUserOnline(callback?: (userId: string) => void) {
    this.socket?.off("user:online", callback);
  }

  offUserOffline(callback?: (userId: string) => void) {
    this.socket?.off("user:offline", callback);
  }

  offTypingStart(callback?: (data: { userId: string; chatId: string; userName: string }) => void) {
    this.socket?.off("typing:start", callback);
  }

  offTypingStop(callback?: (data: { userId: string; chatId: string }) => void) {
    this.socket?.off("typing:stop", callback);
  }

  offChatCreated(callback?: (chat: any) => void) {
    this.socket?.off("chat:created", callback);
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;

