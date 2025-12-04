/**
 * Chat Rooms API
 * Manage chat rooms
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch chat rooms for current user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const type = searchParams.get('type'); // Filter by type
    
    // In a real implementation, this would query the database
    // based on current user's memberships
    const rooms = [
      {
        id: 'room-1',
        name: 'General Chat',
        type: 'channel',
        description: 'General discussion channel',
        isPrivate: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        unreadCount: 0,
        lastMessage: null
      },
      {
        id: 'room-2',
        name: 'Project Discussion',
        type: 'project',
        projectId: 'project-1',
        isPrivate: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        unreadCount: 2,
        lastMessage: {
          content: 'Latest message here',
          createdAt: new Date(),
          sender: {
            username: 'admin'
          }
        }
      }
    ];
    
    return NextResponse.json({
      rooms: type ? rooms.filter(r => r.type === type) : rooms
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rooms' },
      { status: 500 }
    );
  }
}

// POST - Create a new chat room
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, projectId, leadId, members, isPrivate = true } = body;
    
    if (!type) {
      return NextResponse.json(
        { error: 'type is required' },
        { status: 400 }
      );
    }
    
    // Validate type
    const validTypes = ['direct', 'group', 'channel', 'project', 'support'];
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { error: `Invalid type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }
    
    // For direct messages, check if room already exists
    // For group/channel, create new room
    
    const room = {
      id: 'new-room-id',
      name: name || 'New Chat',
      type,
      projectId: projectId || null,
      leadId: leadId || null,
      isPrivate,
      createdBy: 'current-user-id',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // TODO: Save to database
    // await createChatRoom(room);
    
    // TODO: Add members
    // if (members && members.length > 0) {
    //   await addRoomMembers(room.id, members);
    // }
    
    return NextResponse.json({
      success: true,
      room
    });
  } catch (error) {
    console.error('Error creating room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
