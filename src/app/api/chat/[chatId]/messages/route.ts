import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { connectDB } from "@/lib/db/mongodb";
import { Chat } from "@/models/Chat";
import { Message } from "@/models/Message";

// GET /api/chat/[chatId]/messages - Get messages for a specific chat
export async function GET(
  request: NextRequest,
  { params }: { params: { chatId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { chatId } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const skip = (page - 1) * limit;

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

    // Get messages with pagination
    const messages = await Message.find({ chatId })
      .populate("senderId", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Reverse to get chronological order
    messages.reverse();

    // Get total count for pagination
    const totalMessages = await Message.countDocuments({ chatId });
    const totalPages = Math.ceil(totalMessages / limit);

    return NextResponse.json({
      messages,
      pagination: {
        currentPage: page,
        totalPages,
        totalMessages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    }, { status: 200 });
  } catch (error) {
    console.error("Get messages error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

