/**
 * Online Users API
 * Get list of currently online users
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would query the database
    // For now, return mock data
    const onlineUsers = [
      {
        id: '1',
        username: 'admin',
        fullName: 'System Administrator',
        avatar: null,
        status: 'online',
        lastSeen: new Date(),
        lastActivity: new Date()
      },
      {
        id: '2',
        username: 'sales1',
        fullName: 'Trần Thị Sales',
        avatar: null,
        status: 'online',
        lastSeen: new Date(),
        lastActivity: new Date()
      }
    ];
    
    return NextResponse.json(onlineUsers);
  } catch (error) {
    console.error('Error fetching online users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch online users' },
      { status: 500 }
    );
  }
}
