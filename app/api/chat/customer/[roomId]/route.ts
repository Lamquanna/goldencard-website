/**
 * Customer Chat Room API - Get messages and send replies
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch messages for a customer chat room
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100');
    const before = searchParams.get('before'); // For pagination
    
    const messages = await prisma.chatMessage.findMany({
      where: {
        roomId,
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
      },
    });
    
    return NextResponse.json({
      success: true,
      messages: messages.reverse(),
      hasMore: messages.length === limit,
    });
  } catch (error) {
    console.error('Error fetching customer chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

// POST - Send message (from customer or admin reply)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { senderId, content, type = 'TEXT', parentId } = body;
    
    if (!senderId || !content) {
      return NextResponse.json(
        { error: 'senderId and content are required' },
        { status: 400 }
      );
    }
    
    // Verify room exists
    const room = await prisma.chatRoom.findUnique({
      where: { id: roomId },
    });
    
    if (!room) {
      return NextResponse.json(
        { error: 'Chat room not found' },
        { status: 404 }
      );
    }
    
    // Create message
    const message = await prisma.chatMessage.create({
      data: {
        roomId,
        senderId,
        content,
        type,
        parentId,
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
      },
    });
    
    // Update room last message time
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() },
    });
    
    // TODO: Send notification to customer or admin
    // TODO: Trigger SSE/WebSocket event for real-time update
    
    return NextResponse.json({
      success: true,
      message: {
        id: message.id,
        content: message.content,
        type: message.type,
        sender: message.sender,
        createdAt: message.createdAt,
        parentId: message.parentId,
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

// PATCH - Update room (archive, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    const body = await request.json();
    const { isArchived, name } = body;
    
    const room = await prisma.chatRoom.update({
      where: { id: roomId },
      data: {
        ...(typeof isArchived === 'boolean' && { isArchived }),
        ...(name && { name }),
      },
    });
    
    return NextResponse.json({
      success: true,
      room: {
        id: room.id,
        name: room.name,
        isArchived: room.isArchived,
      },
    });
  } catch (error) {
    console.error('Error updating chat room:', error);
    return NextResponse.json(
      { error: 'Failed to update chat room' },
      { status: 500 }
    );
  }
}
