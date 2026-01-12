/**
 * Internal Chat API - Enhanced with mentions, edit, delete, read receipts
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch messages with read status
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const roomId = searchParams.get('roomId');
    const userId = searchParams.get('userId'); // Current user
    const limit = parseInt(searchParams.get('limit') || '100');
    const before = searchParams.get('before');
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      );
    }
    
    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId,
        isDeleted: false,
        ...(before ? { createdAt: { lt: new Date(before) } } : {}),
      },
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    // Get read receipts for each message
    const messagesWithReads = await Promise.all(
      messages.map(async (msg: any) => {
        const readBy = await prisma.$queryRaw<Array<{ userId: string; readAt: Date }>>`
          SELECT "userId", "readAt" 
          FROM "ChatReadReceipt" 
          WHERE "messageId" = ${msg.id}
        `;
        
        const readByUsers = await prisma.user.findMany({
          where: {
            id: { in: readBy.map((r: any) => r.userId) },
          },
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        });
        
        return {
          ...msg,
          readBy: readByUsers,
          readCount: readByUsers.length,
          isReadByCurrentUser: userId ? readBy.some((r: any) => r.userId === userId) : false,
        };
      })
    );
    
    return NextResponse.json({
      success: true,
      messages: messagesWithReads.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send message with mentions
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      roomId, 
      senderId, 
      content, 
      type = 'TEXT',
      parentId, // For replies
      mentions = [], // Array of user IDs mentioned
    } = body;
    
    if (!roomId || !senderId || !content) {
      return NextResponse.json(
        { error: 'roomId, senderId, and content are required' },
        { status: 400 }
      );
    }
    
    // Extract @mentions from content
    const mentionRegex = /@\[([^\]]+)\]\(([^)]+)\)/g;
    const extractedMentions: string[] = [];
    let match;
    
    while ((match = mentionRegex.exec(content)) !== null) {
      extractedMentions.push(match[2]); // User ID from @[Name](userId)
    }
    
    // Combine with provided mentions
    const allMentions = [...new Set([...mentions, ...extractedMentions])];
    
    // Create message with metadata for mentions
    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId,
        content,
        type,
        parentId,
        metadata: allMentions.length > 0 ? { mentions: allMentions } : undefined,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
        parent: {
          select: {
            id: true,
            content: true,
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
    
    // Update room last message time
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() },
    });
    
    // Create notifications for mentioned users
    if (allMentions.length > 0) {
      const room = await prisma.chatRoom.findUnique({
        where: { id: roomId },
        select: { workspaceId: true, name: true },
      });
      
      if (room) {
        await prisma.notification.createMany({
          data: allMentions.map(userId => ({
            workspaceId: room.workspaceId,
            userId,
            type: 'MENTION',
            title: 'Bạn được nhắc đến trong chat',
            message: `${message.sender.name} đã nhắc đến bạn trong ${room.name}`,
            entityType: 'ChatMessage',
            entityId: message.id,
            link: `/erp/chat?room=${roomId}&message=${message.id}`,
          })),
        });
      }
    }
    
    return NextResponse.json({
      success: true,
      message: {
        ...message,
        mentions: allMentions,
        readBy: [],
        readCount: 0,
      },
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

// PATCH - Edit or delete message
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { messageId, content, isDeleted, userId } = body;
    
    if (!messageId || !userId) {
      return NextResponse.json(
        { error: 'messageId and userId are required' },
        { status: 400 }
      );
    }
    
    // Verify user owns the message
    const existingMessage = await prisma.chatMessage.findUnique({
      where: { id: messageId },
    });
    
    if (!existingMessage || existingMessage.senderId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      );
    }
    
    // Update message
    const message = await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        ...(content && { 
          content,
          isEdited: true,
        }),
        ...(typeof isDeleted === 'boolean' && { 
          isDeleted,
          deletedAt: isDeleted ? new Date() : null,
        }),
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      message,
    });
  } catch (error) {
    console.error('Error updating message:', error);
    return NextResponse.json(
      { error: 'Failed to update message' },
      { status: 500 }
    );
  }
}
