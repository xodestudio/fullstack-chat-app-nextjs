"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";
import { fetchChats, setActiveChat } from "@/store/slices/chatSlice";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatDistanceToNow } from "date-fns";
import { MessageCircle, Users } from "lucide-react";

export const ChatSidebar: React.FC = () => {
  const dispatch = useDispatch();
  const { chats, activeChat, isLoading } = useSelector((state: RootState) => state.chat);

  useEffect(() => {
    dispatch(fetchChats());
  }, [dispatch]);

  const handleChatSelect = (chat: any) => {
    dispatch(setActiveChat(chat));
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatTime = (date: string | Date) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch {
      return "";
    }
  };

  const getChatName = (chat: any, currentUserId: string) => {
    if (chat.participants.length === 2) {
      const otherUser = chat.participants.find((p: any) => p._id !== currentUserId);
      return otherUser?.name || "Unknown User";
    }
    return `Group (${chat.participants.length})`;
  };

  const getChatAvatar = (chat: any, currentUserId: string) => {
    if (chat.participants.length === 2) {
      const otherUser = chat.participants.find((p: any) => p._id !== currentUserId);
      return otherUser?.avatar;
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center">
        <MessageCircle className="h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
        <p className="text-sm text-gray-500">
          Start a new conversation to begin chatting
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-2">
        {chats.map((chat) => {
          const isActive = activeChat?._id === chat._id;
          const chatName = getChatName(chat, "current-user-id"); // Replace with actual user ID
          const chatAvatar = getChatAvatar(chat, "current-user-id");
          const lastMessage = chat.lastMessage;

          return (
            <div
              key={chat._id}
              onClick={() => handleChatSelect(chat)}
              className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                isActive
                  ? "bg-blue-50 border border-blue-200"
                  : "hover:bg-gray-50"
              }`}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={chatAvatar || ""} />
                  <AvatarFallback className="bg-gray-200 text-gray-700">
                    {chat.participants.length === 2 ? (
                      getInitials(chatName)
                    ) : (
                      <Users className="h-6 w-6" />
                    )}
                  </AvatarFallback>
                </Avatar>
                {/* Online indicator */}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {chatName}
                  </h4>
                  {lastMessage && (
                    <span className="text-xs text-gray-500">
                      {formatTime(lastMessage.createdAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate">
                    {lastMessage ? (
                      <>
                        {lastMessage.type === "text" ? (
                          lastMessage.content
                        ) : (
                          <span className="flex items-center">
                            <MessageCircle className="h-3 w-3 mr-1" />
                            {lastMessage.type === "image" && "Photo"}
                            {lastMessage.type === "video" && "Video"}
                            {lastMessage.type === "audio" && "Audio"}
                            {lastMessage.type === "document" && "Document"}
                            {lastMessage.type === "file" && "File"}
                          </span>
                        )}
                      </>
                    ) : (
                      "No messages yet"
                    )}
                  </p>
                  
                  {/* Unread count badge */}
                  <Badge variant="secondary" className="bg-blue-600 text-white text-xs">
                    2
                  </Badge>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
};

