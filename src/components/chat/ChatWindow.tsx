"use client";

import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSession } from "next-auth/react";
import { RootState } from "@/store";
import { fetchMessages, sendMessage } from "@/store/slices/chatSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FileUpload } from "./FileUpload";
import { FilePreview } from "./FilePreview";
import { useSocket } from "@/hooks/useSocket";
import { useFileUpload } from "@/hooks/useFileUpload";
import {
  Send,
  Paperclip,
  Smile,
  MoreVertical,
  Phone,
  Video,
  Info,
  X,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { toast } from "sonner";

export const ChatWindow: React.FC = () => {
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const { activeChat, messages, typingUsers } = useSelector((state: RootState) => state.chat);
  const { sendMessage: sendSocketMessage, startTyping, stopTyping } = useSocket();
  
  const [messageText, setMessageText] = useState("");
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    if (activeChat) {
      dispatch(fetchMessages(activeChat._id));
    }
  }, [activeChat, dispatch]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!messageText.trim() || !activeChat || !session?.user?.id) return;

    const messageData = {
      chatId: activeChat._id,
      content: messageText.trim(),
      type: "text",
    };

    try {
      const result = await dispatch(sendMessage(messageData));
      if (sendMessage.fulfilled.match(result)) {
        sendSocketMessage(result.payload);
        setMessageText("");
        stopTyping(activeChat._id);
        setIsTyping(false);
      }
    } catch (error) {
      toast.error("Failed to send message");
    }
  };

  const handleFileUploaded = async (fileData: {
    url: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
  }) => {
    if (!activeChat || !session?.user?.id) return;

    const { formatFileSize, getFileType } = useFileUpload();

    const messageData = {
      chatId: activeChat._id,
      content: fileData.fileName,
      type: getFileType(fileData.mimeType),
      fileUrl: fileData.url,
      fileName: fileData.fileName,
      fileSize: fileData.fileSize,
      fileMimeType: fileData.mimeType,
    };

    try {
      const result = await dispatch(sendMessage(messageData));
      if (sendMessage.fulfilled.match(result)) {
        sendSocketMessage(result.payload);
        setShowFileUpload(false);
      }
    } catch (error) {
      toast.error("Failed to send file");
    }
  };

  const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);

    if (!activeChat) return;

    if (!isTyping) {
      setIsTyping(true);
      startTyping(activeChat._id);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      stopTyping(activeChat._id);
    }, 1000);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatMessageTime = (date: string | Date) => {
    const messageDate = new Date(date);
    const now = new Date();
    const diffInHours = (now.getTime() - messageDate.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return format(messageDate, "HH:mm");
    } else if (diffInHours < 168) { // 7 days
      return format(messageDate, "EEE HH:mm");
    } else {
      return format(messageDate, "MMM dd, HH:mm");
    }
  };

  const getChatName = (chat: any) => {
    if (chat.participants.length === 2) {
      const otherUser = chat.participants.find((p: any) => p._id !== session?.user?.id);
      return otherUser?.name || "Unknown User";
    }
    return `Group (${chat.participants.length})`;
  };

  if (!activeChat) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-50">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Send className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-xl font-medium text-gray-900 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500">
            Choose a conversation from the sidebar to start messaging
          </p>
        </div>
      </div>
    );
  }

  const chatName = getChatName(activeChat);
  const typingUsersList = typingUsers[activeChat._id] || [];

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b bg-white">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className="bg-blue-600 text-white">
              {getInitials(chatName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{chatName}</h2>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-500">Online</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Info className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => {
            const isOwnMessage = message.senderId === session?.user?.id;
            
            return (
              <div
                key={message._id}
                className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
              >
                <div className={`flex space-x-2 max-w-xs lg:max-w-md ${isOwnMessage ? "flex-row-reverse space-x-reverse" : ""}`}>
                  {!isOwnMessage && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={message.sender?.avatar || ""} />
                      <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                        {message.sender?.name ? getInitials(message.sender.name) : "U"}
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div className={`rounded-lg p-3 ${
                    isOwnMessage
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-900"
                  }`}>
                    {message.type === "text" ? (
                      <p className="text-sm">{message.content}</p>
                    ) : (
                      <div className="space-y-2">
                        <FilePreview
                          fileUrl={message.fileUrl!}
                          fileName={message.fileName!}
                          fileSize={message.fileSize!}
                          fileMimeType={message.fileMimeType!}
                          className="max-w-none"
                          showDownload={true}
                        />
                      </div>
                    )}
                    
                    <div className={`text-xs mt-1 ${
                      isOwnMessage ? "text-blue-100" : "text-gray-500"
                    }`}>
                      {formatMessageTime(message.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          
          {/* Typing Indicator */}
          {typingUsersList.length > 0 && (
            <div className="flex justify-start">
              <div className="flex space-x-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gray-200 text-gray-700 text-xs">
                    T
                  </AvatarFallback>
                </Avatar>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* File Upload Modal */}
      {showFileUpload && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Upload File</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFileUpload(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <FileUpload
              onFileUploaded={handleFileUploaded}
              onCancel={() => setShowFileUpload(false)}
            />
          </div>
        </div>
      )}

      {/* Message Input */}
      <div className="p-4 border-t bg-white">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setShowFileUpload(true)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <div className="flex-1 relative">
            <Input
              value={messageText}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="pr-10"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2"
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
          
          <Button type="submit" disabled={!messageText.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};

