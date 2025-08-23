import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { connectDB } from "@/lib/db/mongodb";
import { Chat } from "@/models/Chat";
import { Message, SendMessageSchema } from "@/models/Message";

// POST /api/chat/messages - Send a new message
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = SendMessageSchema.parse(body);
    const { chatId, content, type, fileUrl, fileName, fileSize, fileMimeType } = validatedData;

    await connectDB();

    // Verify user is a participant in this chat
    const chat = await Chat.findOne({
      _id: chatId,
      participants: session.user.id,
    });

    if (!chat) {
      return NextResponse.json(
        { message: "Chat not found or access denied" },
        { status: 404 }
      );
    }

    // Create message
    const message = await Message.create({
      chatId,
      senderId: session.user.id,
      content,
      type: type || "text",
      fileUrl,
      fileName,
      fileSize,
      fileMimeType,
      readBy: [{ userId: session.user.id, readAt: new Date() }],
    });

    // Update chat's last message
    chat.lastMessage = message._id;
    chat.updatedAt = new Date();
    await chat.save();

    // Populate the message with sender info
    const populatedMessage = await Message.findById(message._id)
      .populate("senderId", "name email avatar");

    return NextResponse.json({ message: populatedMessage }, { status: 201 });
  } catch (error: any) {
    console.error("Send message error:", error);
    
    if (error.name === "ZodError") {
      return NextResponse.json(
        { message: "Invalid input data", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

