/**
 * Notifications API
 */

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// GET - Fetch notifications for current user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const isRead = searchParams.get('isRead');
    const type = searchParams.get('type');
    const limit = parseInt(searchParams.get('limit') || '50');
    
    // In a real implementation, this would query the database
    const notifications = [
      {
        id: 'notif-1',
        userId: 'current-user-id',
        type: 'task_assigned',
        title: 'New Task Assigned',
        message: 'You have been assigned to "Install Solar Panels"',
        icon: '📋',
        link: '/erp/tasks/123',
        entityType: 'task',
        entityId: '123',
        isRead: false,
        isArchived: false,
        priority: 'normal',
        createdAt: new Date(),
        actions: [
          {
            label: 'View Task',
            link: '/erp/tasks/123'
          }
        ]
      },
      {
        id: 'notif-2',
        userId: 'current-user-id',
        type: 'chat_message',
        title: 'New Message',
        message: 'Admin sent you a message',
        icon: '💬',
        link: '/chat/room-1',
        entityType: 'chat_message',
        entityId: 'msg-1',
        isRead: true,
        readAt: new Date(),
        isArchived: false,
        priority: 'normal',
        createdAt: new Date(Date.now() - 3600000)
      }
    ];
    
    let filtered = notifications;
    
    if (isRead !== null) {
      filtered = filtered.filter(n => n.isRead === (isRead === 'true'));
    }
    
    if (type) {
      filtered = filtered.filter(n => n.type === type);
    }
    
    return NextResponse.json({
      notifications: filtered.slice(0, limit),
      total: filtered.length,
      unreadCount: notifications.filter(n => !n.isRead).length
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notifications' },
      { status: 500 }
    );
  }
}

// POST - Create a new notification
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      userId,
      type,
      title,
      message,
      icon,
      link,
      entityType,
      entityId,
      priority = 'normal',
      actions
    } = body;
    
    if (!userId || !type || !title) {
      return NextResponse.json(
        { error: 'userId, type, and title are required' },
        { status: 400 }
      );
    }
    
    const notification = {
      id: 'new-notif-id',
      userId,
      type,
      title,
      message: message || null,
      icon: icon || null,
      link: link || null,
      entityType: entityType || null,
      entityId: entityId || null,
      isRead: false,
      isArchived: false,
      priority,
      actions: actions || [],
      createdAt: new Date()
    };
    
    // TODO: Save to database
    // await createNotification(notification);
    
    // TODO: Broadcast to user via SSE
    // sendToUser(userId, 'notification', { notification });
    
    // TODO: Send push notification if enabled
    // await sendPushNotification(userId, notification);
    
    return NextResponse.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Error creating notification:', error);
    return NextResponse.json(
      { error: 'Failed to create notification' },
      { status: 500 }
    );
  }
}
