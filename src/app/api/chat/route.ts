import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/auth.config";
import { connectDB } from "@/lib/db/mongodb";
import { Chat, CreateChatSchema } from "@/models/Chat";
import { User } from "@/models/User";

// GET /api/chat - Get all chats for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { message: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const chats = await Chat.find({
      participants: session.user.id,
    })
      .populate("participants", "name email avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId",
          select: "name email avatar",
        },
      })
      .sort({ updatedAt: -1 });

    return NextResponse.json({ chats }, { status: 200 });
  } catch (error) {
    console.error("Get chats error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chat - Create a new chat
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
    const validatedData = CreateChatSchema.parse(body);
    const { participants } = validatedData;

    // Add current user to participants if not already included
    if (!participants.includes(session.user.id)) {
      participants.push(session.user.id);
    }

    await connectDB();

    // Check if chat already exists with these participants
    const existingChat = await Chat.findOne({
      participants: { $all: participants, $size: participants.length },
    });

    if (existingChat) {
      const populatedChat = await Chat.findById(existingChat._id)
        .populate("participants", "name email avatar")
        .populate({
          path: "lastMessage",
          populate: {
            path: "senderId",
            select: "name email avatar",
          },
        });

      return NextResponse.json({ chat: populatedChat }, { status: 200 });
    }

    // Verify all participants exist
    const users = await User.find({ _id: { $in: participants } });
    if (users.length !== participants.length) {
      return NextResponse.json(
        { message: "One or more participants not found" },
        { status: 400 }
      );
    }

    // Create new chat
    const chat = await Chat.create({ participants });
    const populatedChat = await Chat.findById(chat._id)
      .populate("participants", "name email avatar")
      .populate({
        path: "lastMessage",
        populate: {
          path: "senderId",
          select: "name email avatar",
        },
      });

    return NextResponse.json({ chat: populatedChat }, { status: 201 });
  } catch (error: any) {
    console.error("Create chat error:", error);
    
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

