/**
 * Mark Room as Read API
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ roomId: string }> }
) {
  try {
    const { roomId } = await params;
    
    if (!roomId) {
      return NextResponse.json(
        { error: 'roomId is required' },
        { status: 400 }
      );
    }
    
    // In a real implementation, this would:
    // 1. Update last_read_at for the user in chat_room_members
    // 2. Update last_read_message_id to the latest message
    
    // TODO: Update database
    // await markRoomAsRead(userId, roomId);
    
    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.error('Error marking room as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark room as read' },
      { status: 500 }
    );
  }
}
