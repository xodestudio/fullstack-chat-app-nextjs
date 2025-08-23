import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// Zod validation schemas
export const SendMessageSchema = z.object({
  chatId: z.string(),
  content: z.string().min(1, "Message content is required"),
  type: z.enum(["text", "file", "image", "video", "audio", "document"]).default("text"),
  fileUrl: z.string().optional(),
  fileName: z.string().optional(),
  fileSize: z.number().optional(),
  fileMimeType: z.string().optional(),
});

// TypeScript interface
export interface IMessage extends Document {
  _id: mongoose.Types.ObjectId;
  chatId: mongoose.Types.ObjectId;
  senderId: mongoose.Types.ObjectId;
  content: string;
  type: "text" | "file" | "image" | "video" | "audio" | "document";
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  fileMimeType?: string;
  readBy: {
    userId: mongoose.Types.ObjectId;
    readAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const MessageSchema = new Schema<IMessage>(
  {
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "Chat",
      required: true,
    },
    senderId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "file", "image", "video", "audio", "document"],
      default: "text",
    },
    fileUrl: {
      type: String,
      default: null,
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    fileMimeType: {
      type: String,
      default: null,
    },
    readBy: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        readAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Create indexes
MessageSchema.index({ chatId: 1, createdAt: -1 });
MessageSchema.index({ senderId: 1 });
MessageSchema.index({ createdAt: -1 });

export const Message = mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);

