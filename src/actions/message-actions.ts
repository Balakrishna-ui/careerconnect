"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";

// Get current user session
async function getSession() {
  return await getServerSession(authOptions);
}

/**
 * 1. Get or Create a Conversation
 */
export async function getOrCreateConversation(mentorUserId: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUserId = session.user.id;

  if (currentUserId === mentorUserId) {
    throw new Error("You cannot message yourself");
  }

  // Check if conversation already exists (User1 = current, User2 = mentor) OR (User1 = mentor, User2 = current)
  let conversation = await prisma.conversation.findFirst({
    where: {
      OR: [
        { user1Id: currentUserId, user2Id: mentorUserId },
        { user1Id: mentorUserId, user2Id: currentUserId }
      ]
    }
  });

  // If not, create it
  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        user1Id: currentUserId,
        user2Id: mentorUserId
      }
    });
  }

  return { conversationId: conversation.id };
}

/**
 * 2. Get all conversations for the current user
 */
export async function getUserConversations() {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUserId = session.user.id;

  const conversations = await prisma.conversation.findMany({
    where: {
      OR: [
        { user1Id: currentUserId },
        { user2Id: currentUserId }
      ]
    },
    include: {
      user1: { select: { id: true, name: true, image: true, role: true, mentorProfile: { select: { company: true, role: true } } } },
      user2: { select: { id: true, name: true, image: true, role: true, mentorProfile: { select: { company: true, role: true } } } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1
      },
      _count: {
        select: {
          messages: {
            where: {
              read: false,
              NOT: { senderId: currentUserId }
            }
          }
        }
      }
    },
    orderBy: {
      updatedAt: "desc"
    }
  });

  // Map and format for frontend
  return conversations.map((conv: any) => {
    const isUser1 = conv.user1Id === currentUserId;
    const otherUser = isUser1 ? conv.user2 : conv.user1;
    const lastMessage = conv.messages[0];
    
    // Formatting the role string based on mentor profile
    let roleStr = "Job Seeker";
    if (otherUser.role === "MENTOR" || otherUser.mentorProfile) {
      roleStr = `${otherUser.mentorProfile?.role || 'Mentor'} @ ${otherUser.mentorProfile?.company || 'Company'}`;
    }

    return {
      id: conv.id,
      otherUser: {
        id: otherUser.id,
        name: otherUser.name || "Unknown",
        image: otherUser.image,
        role: roleStr
      },
      lastMessage: lastMessage ? {
        content: lastMessage.content,
        createdAt: lastMessage.createdAt,
        senderId: lastMessage.senderId
      } : null,
      unreadCount: conv._count.messages
    };
  });
}

/**
 * 3. Get messages for a specific conversation
 */
export async function getMessages(conversationId: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUserId = session.user.id;

  // Verify access
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId }
  });

  if (!conversation) throw new Error("Conversation not found");
  if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
    throw new Error("Unauthorized to view these messages");
  }

  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: "asc" }
  });

  return messages;
}

/**
 * 4. Send a new message
 */
export async function sendMessage(conversationId: string, content: string) {
  const session = await getSession();
  if (!session?.user?.id) throw new Error("Unauthorized");
  
  const currentUserId = session.user.id;

  // Verify access
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { user1: true, user2: true }
  });

  if (!conversation) throw new Error("Conversation not found");
  if (conversation.user1Id !== currentUserId && conversation.user2Id !== currentUserId) {
    throw new Error("Unauthorized to send messages in this conversation");
  }

  const receiverId = conversation.user1Id === currentUserId ? conversation.user2Id : conversation.user1Id;
  const senderName = conversation.user1Id === currentUserId ? conversation.user1?.name : conversation.user2?.name;

  // Save to DB
  const newMessage = await prisma.message.create({
    data: {
      content,
      senderId: currentUserId,
      conversationId
    }
  });

  // Update conversation updatedAt so it floats to top of list
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { updatedAt: new Date() }
  });

  // Create unread notification for the receiver
  await prisma.notification.create({
    data: {
      userId: receiverId,
      type: "NEW_MESSAGE",
      message: `New message from ${senderName || "someone"}`,
      actionUrl: `/dashboard/messages?conversationId=${conversationId}` 
    }
  });

  // Trigger Pusher event for real-time delivery
  try {
    await pusherServer.trigger(`conversation-${conversationId}`, "new-message", newMessage);
    // Trigger global event for receiver to update conversation list/unread badge
    await pusherServer.trigger(`user-${receiverId}`, "conversations-updated", {});
  } catch (err) {
    console.error("Failed to trigger Pusher event:", err);
  }

  return newMessage;
}

/**
 * 5. Mark messages as read
 */
export async function markAsRead(conversationId: string) {
  const session = await getSession();
  if (!session?.user?.id) return { success: false };
  
  const currentUserId = session.user.id;

  await prisma.message.updateMany({
    where: {
      conversationId,
      senderId: { not: currentUserId }, 
      read: false
    },
    data: { read: true }
  });
  
  try {
    await pusherServer.trigger(`user-${currentUserId}`, "conversations-updated", {});
  } catch (err) {}

  return { success: true };
}
