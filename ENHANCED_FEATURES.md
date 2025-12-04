# Enhanced ERP Features Documentation

This document describes the new features added to the GoldenCard ERP system, including chat functionality, video calling, and company settings management.

## 🆕 New Features

### 1. Enhanced Chat & Messaging System

#### Overview
A comprehensive real-time chat system with support for:
- **Group chats** - Team communication in shared rooms
- **Direct messages** - 1-on-1 conversations
- **Video calls** - Built-in video conferencing
- **File sharing** - Share documents and images
- **Message reactions** - React to messages with emojis
- **Read receipts** - Track message read status
- **Online presence** - See who's available

#### Database Schema
The messaging system is backed by a complete database schema (`database/migrations/008_chat_messaging.sql`) including:

- `chat_rooms` - Chat room/channel management
- `chat_room_members` - Room membership and permissions
- `chat_messages` - Message storage with support for attachments
- `message_read_receipts` - Track who has read messages
- `video_call_sessions` - Video call session management
- `video_call_participants` - Call participant tracking
- `user_presence` - Online/offline/away status
- `chat_notifications` - Push notification management
- `chat_file_uploads` - File attachment metadata

#### UI Components

**EnhancedChatWidget** (`components/EnhancedChatWidget.tsx`)
- Fixed bottom-right floating chat button
- Expandable chat window with multiple views:
  - **Room List** - All available chat rooms with search
  - **Chat View** - Message thread with reactions and replies
  - **Video Call View** - Video conferencing interface
- Features:
  - Unread message counter with pulse animation
  - Online user list with status indicators
  - Message search within rooms
  - File attachment and emoji buttons
  - Minimizable window
  - Video call controls (mute, video off, screen share)

#### Usage

The chat widget is automatically available in all ERP pages via the layout:

```tsx
// app/erp/layout.tsx
import EnhancedChatWidget from "@/components/EnhancedChatWidget";

// Widget is rendered at the bottom of the layout
<EnhancedChatWidget />
```

**Starting a Chat:**
1. Click the floating chat button in bottom-right corner
2. Select a room from the room list or search for one
3. Type your message and press Enter or click Send

**Video Calling:**
1. Open a chat room
2. Click the Video icon in the chat header
3. Wait for participants to join
4. Use controls to mute/unmute, toggle video, or share screen
5. Click the red phone icon to end the call

### 2. Company Settings Management

#### Overview
Centralized management of company information, ensuring consistency across all system touchpoints.

#### Page: `/erp/settings`

**Features:**
- **Three main tabs:**
  1. **General Info** - Company name, tax code, business type, etc.
  2. **Addresses** - Headquarters, representative office, warehouse
  3. **Contact** - Phone numbers, emails, website, social media

**Address Management:**
- Updates to the headquarters address automatically propagate to:
  - Contact page on website
  - Website footer
  - Invoices and quotes
  - Automated customer emails
  - All company documents

#### UI Features
- Clean tabbed interface
- Form validation
- Save confirmation with success message
- Visual guidance about where data is used
- Mobile responsive design

#### Data Storage
Currently saves to localStorage with API-ready structure:
```typescript
localStorage.setItem('company_settings', JSON.stringify(settings));
```

**Future Enhancement:** Connect to backend API endpoint:
```typescript
POST /api/erp/company-settings
{
  name: string,
  headquarterAddress: string,
  hotline: string,
  // ... other fields
}
```

### 3. Database Enhancements

#### New Migration: `008_chat_messaging.sql`

Comprehensive schema for chat and video calling:

**Chat Rooms:**
- Support for direct, group, and channel types
- Customizable settings (video calls, file sharing, max members)
- Archive functionality

**Messages:**
- Text, image, file, video, audio, and system message types
- Reply threading
- Reactions and mentions
- Edit and delete tracking

**Video Calls:**
- Session management with unique codes
- Participant tracking
- Duration calculation
- Recording support (optional)

**User Presence:**
- Real-time online/offline/away/busy status
- Custom status messages
- Last seen tracking
- Device information

**Triggers & Functions:**
- Auto-update timestamps
- Calculate call/participant duration
- Update last seen on message read
- Maintain denormalized counts

**Views:**
- `v_unread_messages` - Unread count per room per user
- `v_active_video_calls` - Currently active calls with participants

## 📋 How to Use the System

### For Administrators

#### Setting Up Company Information
1. Log in to ERP with admin credentials
2. Navigate to **Settings** (if added to nav, or go to `/erp/settings`)
3. Update company details in each tab:
   - **General**: Company name, tax code, business info
   - **Addresses**: Update all three addresses as needed
   - **Contact**: Phone, email, social media links
4. Click **Save Changes**

#### Managing Chat Access
- All users automatically join the "Phòng chat chung" (General Chat)
- Create additional rooms for teams/departments
- Set room permissions (owner, admin, member)
- Archive inactive rooms

### For End Users

#### Using Chat
1. **Access Chat**: Click the chat bubble icon in bottom-right
2. **Select Room**: Choose from room list or search
3. **Send Messages**: Type and press Enter
4. **View Online Users**: Click online count in header
5. **Start Video Call**: Click video icon in chat header

#### Video Call Controls
- **Mic Button**: Mute/unmute audio
- **Video Button**: Turn camera on/off
- **Screen Button**: Share your screen
- **Settings Button**: Adjust call settings
- **End Call**: Red phone button

#### Notifications
- Unread badge shows total unread messages
- Pulse animation for new messages
- Desktop notifications (when implemented)

## 🔧 Technical Implementation

### Frontend Components

**Chat Widget Architecture:**
```
EnhancedChatWidget
├── Chat Button (floating)
├── Chat Window
│   ├── Header (with controls)
│   ├── Online Users Panel (collapsible)
│   ├── View Switcher
│   │   ├── Room List View
│   │   ├── Chat View
│   │   └── Video Call View
│   └── Input Area
└── Animations (Framer Motion)
```

**State Management:**
- Local React state for UI
- Future: Zustand/Redux for global state
- Real-time updates via WebSocket (to be implemented)

### Backend Integration (Future)

**Required API Endpoints:**
```
POST   /api/erp/chat/rooms              - Create room
GET    /api/erp/chat/rooms              - List rooms
POST   /api/erp/chat/messages           - Send message
GET    /api/erp/chat/messages/:roomId   - Get messages
PUT    /api/erp/chat/messages/:id/read  - Mark as read
POST   /api/erp/chat/video/start        - Start video call
POST   /api/erp/chat/video/:id/join     - Join call
DELETE /api/erp/chat/video/:id          - End call

POST   /api/erp/company-settings        - Save settings
GET    /api/erp/company-settings        - Get settings
```

**WebSocket Events:**
```
socket.on('message:new', handleNewMessage)
socket.on('message:read', handleMessageRead)
socket.on('user:online', handleUserOnline)
socket.on('user:offline', handleUserOffline)
socket.on('call:started', handleCallStarted)
socket.on('call:participant:joined', handleParticipantJoined)
```

### Video Call Technology Stack

**Recommended:**
- **WebRTC** - Peer-to-peer video/audio
- **Socket.io** - Signaling server
- **Simple-peer** - WebRTC wrapper
- **MediaSoup** - SFU for group calls (optional)

**Alternative:**
- **Twilio Video** - Managed service
- **Agora** - Video SDK
- **Jitsi Meet** - Open source solution

## 🚀 Future Enhancements

### Short Term
- [ ] Connect chat to real backend API
- [ ] Implement WebSocket for real-time updates
- [ ] Add WebRTC for actual video calling
- [ ] File upload functionality
- [ ] Message search across all rooms
- [ ] Emoji picker integration

### Medium Term
- [ ] Desktop notifications
- [ ] Mobile push notifications
- [ ] Screen sharing implementation
- [ ] Call recording
- [ ] Chat history export
- [ ] Message pinning
- [ ] Typing indicators
- [ ] Message forwarding

### Long Term
- [ ] End-to-end encryption
- [ ] Voice messages
- [ ] Video messages
- [ ] Chat bots and automation
- [ ] Integration with external tools (Slack, Teams)
- [ ] Analytics dashboard for chat usage
- [ ] AI-powered message suggestions

## 🔒 Security Considerations

### Current Implementation
- Client-side validation
- Sanitized user inputs
- No sensitive data in localStorage

### Production Requirements
- [ ] Server-side validation
- [ ] Message encryption in transit (HTTPS)
- [ ] Message encryption at rest
- [ ] File upload virus scanning
- [ ] Rate limiting on message sending
- [ ] XSS prevention
- [ ] CSRF protection
- [ ] Session management
- [ ] Proper authentication/authorization

## 📊 Database Migration

To apply the chat database schema:

```sql
-- Run the migration
psql -U your_user -d your_database -f database/migrations/008_chat_messaging.sql

-- Verify tables created
\dt chat_*
\dt video_*
\dt user_presence

-- Check sample data
SELECT * FROM chat_rooms LIMIT 5;
SELECT * FROM chat_messages LIMIT 10;
```

## 🎨 Styling

The chat widget uses:
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **Lucide React** - Icon set
- **Gradients** - Blue to purple brand colors
- **Responsive Design** - Works on all screen sizes

## 📞 Support

For questions or issues:
1. Check tooltips in the UI
2. Review this documentation
3. Contact development team
4. Submit GitHub issue

## 🔄 Changelog

### Version 2.0.0 (Current)
- ✨ NEW: Enhanced chat widget with video calling
- ✨ NEW: Company settings page
- ✨ NEW: Complete messaging database schema
- 🔧 FIX: Google Fonts build issue (temporary system fonts)
- 📦 Updated ERP layout with new chat widget

### Version 1.0.0
- Initial ERP modules (tasks, leads, projects, etc.)
- Basic chat widget
- User management
- Attendance tracking
- Inventory management

---

**Last Updated**: December 2024  
**Version**: 2.0.0  
**Status**: Beta - Ready for testing
