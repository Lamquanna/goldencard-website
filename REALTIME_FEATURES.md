# Real-Time Features Documentation

## Overview

This document describes the real-time features implemented for the GoldenCard ERP system, including chat, notifications, online presence tracking, and visitor analytics.

## Architecture

### Database Schema

The real-time features are built on a comprehensive PostgreSQL database schema with the following key components:

#### Core Tables

1. **user_presence** - Track user online status
2. **chat_rooms** - Chat room definitions
3. **chat_room_members** - Room membership and permissions
4. **chat_messages** - Chat messages with threading support
5. **chat_typing_indicators** - Real-time typing indicators
6. **notifications** - User notifications
7. **notification_preferences** - Per-user notification settings
8. **visitor_sessions** - Website visitor tracking
9. **page_views** - Page view tracking
10. **visitor_events** - Custom event tracking
11. **activity_feed** - System-wide activity feed

### Real-Time Communication

The system uses **Server-Sent Events (SSE)** for real-time updates from server to client. This provides:

- Automatic reconnection handling
- Lower overhead than WebSocket for server-to-client updates
- Simple HTTP-based protocol
- Works through most firewalls and proxies

For production with bidirectional communication needs, consider upgrading to WebSocket.

## Features

### 1. Online Presence Tracking

Track which users are currently online and their status.

**Statuses:**
- `online` - User is actively using the system
- `away` - User is idle
- `busy` - User is busy (do not disturb)
- `offline` - User is not connected

**API Endpoints:**
- `GET /api/realtime/online-users` - Get list of online users
- `POST /api/realtime/presence` - Update user status

**Database Tables:**
- `user_presence` - Current presence status
- `v_online_users` - View of currently online users

### 2. Real-Time Chat

Full-featured chat system with support for:

- Direct messages (1-on-1)
- Group chats
- Channels (broadcast channels)
- Project-based chats
- Support chats (linked to leads)

**Features:**
- Message threading (replies)
- File attachments
- User mentions (@username)
- Message reactions (emoji)
- Typing indicators
- Read receipts
- Message editing and deletion

**API Endpoints:**
- `GET /api/chat/rooms` - List chat rooms
- `POST /api/chat/rooms` - Create chat room
- `GET /api/chat/messages?roomId=X` - Get messages
- `POST /api/chat/messages` - Send message
- `POST /api/chat/rooms/{roomId}/read` - Mark as read
- `POST /api/chat/typing` - Send typing indicator

**Database Tables:**
- `chat_rooms` - Room definitions
- `chat_room_members` - Room memberships
- `chat_messages` - Messages
- `chat_typing_indicators` - Typing status
- `v_unread_message_counts` - Unread counts per user/room

### 3. Notifications

Flexible notification system with multiple channels.

**Notification Types:**
- Task notifications (assigned, due, completed)
- Project updates and milestones
- Lead activity
- Chat messages and mentions
- Approval requests
- System alerts
- Inventory alerts

**Channels:**
- In-app notifications
- Email notifications
- Push notifications (browser)
- SMS notifications (optional)

**Features:**
- Priority levels (low, normal, high, urgent)
- Rich notifications with action buttons
- Quiet hours support
- Notification preferences per type
- Digest mode (hourly, daily, weekly)

**API Endpoints:**
- `GET /api/notifications` - Get notifications
- `POST /api/notifications` - Create notification
- `POST /api/notifications/{id}/read` - Mark as read

**Database Tables:**
- `notifications` - Notification records
- `notification_preferences` - User preferences
- `v_notification_summary` - Summary per user

### 4. Visitor Tracking & Analytics

Track website visitors and user behavior.

**Tracked Data:**
- Page views
- Session duration
- Bounce rate
- Geographic location (from IP)
- Device type and browser
- Referral sources
- UTM parameters
- Custom events

**Features:**
- Anonymous visitor tracking
- Session tracking
- Event tracking
- Funnel analysis support
- Geographic analytics
- Device and browser statistics

**API Endpoints:**
- `POST /api/analytics/pageview` - Track page view
- `POST /api/analytics/event` - Track custom event

**Database Tables:**
- `visitor_sessions` - Visitor sessions
- `page_views` - Page views
- `visitor_events` - Custom events
- `v_visitor_analytics` - Analytics summary
- `v_popular_pages` - Popular pages view

### 5. Activity Feed

System-wide activity feed showing recent actions.

**Tracked Activities:**
- Task creation and updates
- Project milestones
- Lead conversions
- File uploads
- Comments
- Status changes

**Visibility Levels:**
- `public` - Visible to all users
- `team` - Visible to team members
- `private` - Visible only to specific users

**Database Tables:**
- `activity_feed` - Activity records
- `v_recent_activity` - Recent activity view

## Client-Side Usage

### React/Next.js Integration

```typescript
import { useRealtimeStore, realtimeManager } from '@/lib/realtime';
import { useEffect } from 'react';

function MyComponent() {
  const { 
    isConnected, 
    onlineUsers, 
    notifications, 
    unreadNotificationCount 
  } = useRealtimeStore();
  
  useEffect(() => {
    // Connect to real-time service
    realtimeManager.connect(userId);
    
    // Cleanup on unmount
    return () => {
      realtimeManager.disconnect();
    };
  }, [userId]);
  
  return (
    <div>
      <p>Status: {isConnected ? 'Connected' : 'Disconnected'}</p>
      <p>Online Users: {onlineUsers.length}</p>
      <p>Unread Notifications: {unreadNotificationCount}</p>
    </div>
  );
}
```

### Sending Messages

```typescript
import { sendChatMessage } from '@/lib/realtime';

async function sendMessage(roomId: string, content: string) {
  const message = await sendChatMessage(roomId, content);
  if (message) {
    console.log('Message sent:', message);
  }
}
```

### Tracking Page Views

```typescript
import { trackPageView } from '@/lib/realtime';

useEffect(() => {
  trackPageView({
    pageUrl: window.location.href,
    pageTitle: document.title,
    referrer: document.referrer
  });
}, []);
```

## Database Migrations

The database schema is defined in:

- `database/migrations/000_users_auth.sql` - Users and authentication
- `database/migrations/008_realtime_features.sql` - Real-time features

To apply migrations:

```bash
# Using Node.js
npm run db:migrate

# Or directly with psql
psql -d your_database < database/migrations/000_users_auth.sql
psql -d your_database < database/migrations/008_realtime_features.sql
```

## Security Considerations

1. **Authentication**: All API endpoints should verify user authentication
2. **Authorization**: Check user permissions before allowing access to rooms/notifications
3. **Rate Limiting**: Implement rate limiting to prevent abuse
4. **Input Validation**: Validate all user inputs
5. **XSS Protection**: Sanitize message content before displaying
6. **CSRF Protection**: Use CSRF tokens for state-changing operations
7. **IP Anonymization**: Consider anonymizing IP addresses for privacy

## Performance Optimization

1. **Indexes**: All frequently queried columns have indexes
2. **Denormalization**: Read counts and thread counts are denormalized
3. **Pagination**: Use cursor-based pagination for messages
4. **Cleanup Jobs**: Regular cleanup of expired data
5. **Caching**: Consider caching online users list
6. **Connection Pooling**: Use connection pooling for database

## Cleanup Jobs

Run these periodically (via cron or scheduled tasks):

```sql
-- Clean up expired typing indicators (run every minute)
DELETE FROM chat_typing_indicators WHERE expires_at < NOW();

-- Clean up old visitor sessions (keep 90 days)
DELETE FROM visitor_sessions WHERE started_at < NOW() - INTERVAL '90 days';

-- Clean up old notifications
DELETE FROM notifications 
WHERE is_read = TRUE AND read_at < NOW() - INTERVAL '30 days';

-- Clean up expired sessions
DELETE FROM user_sessions WHERE expires_at < NOW();
```

## Future Enhancements

1. **WebSocket Support**: Upgrade from SSE to WebSocket for bidirectional communication
2. **Voice/Video Calls**: Add WebRTC support for calls
3. **Screen Sharing**: Implement screen sharing for support
4. **Message Search**: Full-text search across messages
5. **Message Encryption**: End-to-end encryption for sensitive chats
6. **Read Receipts UI**: Show who has read each message
7. **Presence Broadcasting**: Broadcast cursor positions for collaboration
8. **Advanced Analytics**: Machine learning for visitor behavior prediction
9. **A/B Testing**: Built-in A/B testing framework
10. **Heat Maps**: Visual heat maps of user interactions

## Troubleshooting

### Connection Issues

If real-time connection fails:
1. Check server logs for errors
2. Verify SSE endpoint is accessible
3. Check for CORS issues
4. Verify user authentication
5. Check firewall/proxy settings

### Missing Notifications

If notifications aren't appearing:
1. Check notification preferences
2. Verify user is subscribed to notification type
3. Check quiet hours settings
4. Verify notification was created in database
5. Check browser notification permissions

### High Database Load

If database performance degrades:
1. Check for missing indexes
2. Run VACUUM ANALYZE on large tables
3. Consider partitioning large tables
4. Implement query caching
5. Use read replicas for queries

## Support

For issues or questions about real-time features:
- Check the code comments in `lib/realtime.ts`
- Review the database schema in migration files
- Refer to this documentation
- Contact the development team

## License

Copyright © 2024 GoldenCard Energy. All rights reserved.
