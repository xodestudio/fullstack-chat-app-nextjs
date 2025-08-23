import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useDispatch } from "react-redux";
import socketManager from "@/lib/socket/client";
import { addMessage, setTypingUsers } from "@/store/slices/chatSlice";
import jwt from "jsonwebtoken";

export const useSocket = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const typingTimeoutRef = useRef<{ [chatId: string]: NodeJS.Timeout }>({});

  useEffect(() => {
    if (session?.user?.id) {
      // Generate JWT token for socket authentication
      const token = jwt.sign(
        { userId: session.user.id },
        process.env.NEXT_PUBLIC_JWT_SECRET || "development-jwt-secret",
        { expiresIn: "24h" }
      );

      // Connect to socket
      const socket = socketManager.connect(token);

      // Set up event listeners
      socket.on("connect", () => {
        setIsConnected(true);
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
      });

      // Message events
      socketManager.onMessageReceive((message) => {
        dispatch(addMessage(message));
      });

      // User presence events
      socketManager.onUserOnline((userId) => {
        setOnlineUsers((prev) => [...prev.filter(id => id !== userId), userId]);
      });

      socketManager.onUserOffline((userId) => {
        setOnlineUsers((prev) => prev.filter(id => id !== userId));
      });

      // Typing events
      socketManager.onTypingStart((data) => {
        dispatch(setTypingUsers({
          chatId: data.chatId,
          users: [data.userId], // Simplified - in real app, you'd manage multiple typing users
        }));

        // Clear typing after 3 seconds
        if (typingTimeoutRef.current[data.chatId]) {
          clearTimeout(typingTimeoutRef.current[data.chatId]);
        }

        typingTimeoutRef.current[data.chatId] = setTimeout(() => {
          dispatch(setTypingUsers({
            chatId: data.chatId,
            users: [],
          }));
        }, 3000);
      });

      socketManager.onTypingStop((data) => {
        if (typingTimeoutRef.current[data.chatId]) {
          clearTimeout(typingTimeoutRef.current[data.chatId]);
        }
        dispatch(setTypingUsers({
          chatId: data.chatId,
          users: [],
        }));
      });

      return () => {
        // Clean up timeouts
        Object.values(typingTimeoutRef.current).forEach(timeout => {
          clearTimeout(timeout);
        });

        // Remove event listeners
        socketManager.offMessageReceive();
        socketManager.offUserOnline();
        socketManager.offUserOffline();
        socketManager.offTypingStart();
        socketManager.offTypingStop();
      };
    }

    return () => {
      socketManager.disconnect();
      setIsConnected(false);
    };
  }, [session?.user?.id, dispatch]);

  const joinChat = (chatId: string) => {
    socketManager.joinChat(chatId);
  };

  const leaveChat = (chatId: string) => {
    socketManager.leaveChat(chatId);
  };

  const sendMessage = (message: any) => {
    socketManager.sendMessage(message);
  };

  const startTyping = (chatId: string) => {
    socketManager.startTyping(chatId);
  };

  const stopTyping = (chatId: string) => {
    socketManager.stopTyping(chatId);
  };

  return {
    isConnected,
    onlineUsers,
    joinChat,
    leaveChat,
    sendMessage,
    startTyping,
    stopTyping,
  };
};

