/**
 * Customer Chat API - Website visitors
 * Lưu tin nhắn khách hàng vào database
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

// GET - Fetch customer chat rooms (for admin)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status') || 'all'; // all, active, archived
    const limit = parseInt(searchParams.get('limit') || '50');
    
    const where: any = {
      type: 'CUSTOMER_SUPPORT',
    };
    
    if (status === 'active') {
      where.isArchived = false;
    } else if (status === 'archived') {
      where.isArchived = true;
    }
    
    const rooms = await prisma.chatRoom.findMany({
      where,
      take: limit,
      orderBy: { lastMessageAt: 'desc' },
      include: {
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
          select: {
            content: true,
            createdAt: true,
            sender: {
              select: {
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            messages: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      rooms: rooms.map((room: any) => ({
        id: room.id,
        name: room.name || 'Khách hàng',
        lastMessage: room.messages[0],
        messageCount: room._count.messages,
        lastMessageAt: room.lastMessageAt,
        isArchived: room.isArchived,
        createdAt: room.createdAt,
      })),
    });
  } catch (error) {
    console.error('Error fetching customer chat rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat rooms' },
      { status: 500 }
    );
  }
}

// POST - Create customer chat session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      customerName, 
      customerPhone, 
      customerEmail, 
      message, 
      isAnonymous = true 
    } = body;
    
    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }
    
    // Get default workspace (or create logic to determine workspace)
    const workspace = await prisma.workspace.findFirst({
      where: { isActive: true },
    });
    
    if (!workspace) {
      return NextResponse.json(
        { error: 'No active workspace found' },
        { status: 404 }
      );
    }
    
    // Create or find customer user
    let customerUser;
    
    if (!isAnonymous && customerEmail) {
      // Try to find existing user
      customerUser = await prisma.user.findUnique({
        where: { email: customerEmail },
      });
      
      // Create user if not exists
      if (!customerUser) {
        customerUser = await prisma.user.create({
          data: {
            email: customerEmail,
            name: customerName || 'Khách hàng',
            phone: customerPhone,
            isActive: true,
          },
        });
      }
      
      // Also create/update Lead in CRM
      await prisma.lead.upsert({
        where: {
          workspaceId_email: {
            workspaceId: workspace.id,
            email: customerEmail,
          },
        },
        update: {
          phone: customerPhone,
          lastContactAt: new Date(),
        },
        create: {
          workspaceId: workspace.id,
          name: customerName || 'Khách hàng',
          email: customerEmail,
          phone: customerPhone,
          source: 'WEBSITE',
          status: 'NEW',
          createdById: customerUser.id,
        },
      });
    } else {
      // Anonymous customer - create temporary user
      customerUser = await prisma.user.create({
        data: {
          email: `anonymous_${Date.now()}@temp.local`,
          name: `Khách ẩn danh ${Date.now()}`,
          phone: customerPhone,
          isActive: true,
        },
      });
    }
    
    // Create chat room
    const room = await prisma.chatRoom.create({
      data: {
        workspaceId: workspace.id,
        type: 'CUSTOMER_SUPPORT',
        name: customerName || 'Khách hàng',
        description: isAnonymous ? 'Chat ẩn danh' : `Email: ${customerEmail}`,
        lastMessageAt: new Date(),
        members: {
          create: {
            userId: customerUser.id,
            role: 'MEMBER',
          },
        },
      },
    });
    
    // Create first message
    const chatMessage = await prisma.chatMessage.create({
      data: {
        roomId: room.id,
        senderId: customerUser.id,
        content: message,
        type: 'TEXT',
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });
    
    return NextResponse.json({
      success: true,
      roomId: room.id,
      messageId: chatMessage.id,
      message: {
        id: chatMessage.id,
        content: chatMessage.content,
        sender: chatMessage.sender,
        createdAt: chatMessage.createdAt,
      },
    });
  } catch (error) {
    console.error('Error creating customer chat:', error);
    return NextResponse.json(
      { error: 'Failed to create chat session' },
      { status: 500 }
    );
  }
}
