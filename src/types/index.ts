export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Chat {
  _id: string;
  participants: User[];
  lastMessage?: Message;
  createdAt: Date;
  updatedAt: Date;
}

export interface Message {
  _id: string;
  chatId: string;
  senderId: string;
  sender: User;
  content: string;
  type: 'text' | 'file' | 'image' | 'video' | 'audio' | 'document';
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface ChatState {
  chats: Chat[];
  activeChat: Chat | null;
  messages: Message[];
  isLoading: boolean;
  error: string | null;
}

export interface SocketEvents {
  'user:join': (userId: string) => void;
  'user:leave': (userId: string) => void;
  'message:send': (message: Message) => void;
  'message:receive': (message: Message) => void;
  'typing:start': (data: { userId: string; chatId: string }) => void;
  'typing:stop': (data: { userId: string; chatId: string }) => void;
}

export interface FileUploadResponse {
  url: string;
  publicId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
}

