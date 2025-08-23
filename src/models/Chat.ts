import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// Zod validation schemas
export const CreateChatSchema = z.object({
  participants: z.array(z.string()).min(2, "Chat must have at least 2 participants"),
});

// TypeScript interface
export interface IChat extends Document {
  _id: mongoose.Types.ObjectId;
  participants: mongoose.Types.ObjectId[];
  lastMessage?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// Mongoose schema
const ChatSchema = new Schema<IChat>(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],
    lastMessage: {
      type: Schema.Types.ObjectId,
      ref: "Message",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Create indexes
ChatSchema.index({ participants: 1 });
ChatSchema.index({ updatedAt: -1 });

export const Chat = mongoose.models.Chat || mongoose.model<IChat>("Chat", ChatSchema);

