# 🏗️ GoldenEnergy SaaS System Architecture

## 📊 Tổng Quan Kiến Trúc

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           GOLDENENERGY SAAS PLATFORM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐              │
│  │   Next.js 15    │  │   Firebase      │  │   PostgreSQL    │              │
│  │   Frontend      │  │   Realtime      │  │   Database      │              │
│  │   + API Routes  │  │   + Storage     │  │   (Supabase)    │              │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘              │
│           │                    │                    │                        │
│  ┌────────▼─────────────────────▼─────────────────────▼────────┐             │
│  │                    API Gateway Layer                         │             │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐         │             │
│  │  │  Auth   │  │   CRM   │  │ Project │  │  Chat   │         │             │
│  │  │   API   │  │   API   │  │   API   │  │   API   │         │             │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘         │             │
│  └──────────────────────────────────────────────────────────────┘             │
│                                                                              │
│  ┌──────────────────────────────────────────────────────────────┐             │
│  │                    Service Layer                              │             │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │             │
│  │  │ Notification│  │  Analytics  │  │    File     │          │             │
│  │  │   Service   │  │   Service   │  │   Service   │          │             │
│  │  └─────────────┘  └─────────────┘  └─────────────┘          │             │
│  └──────────────────────────────────────────────────────────────┘             │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## 🔧 Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **UI Library**: Tailwind CSS + Framer Motion
- **State Management**: React Context + React Query
- **Realtime**: Firebase SDK
- **Charts**: Recharts / Chart.js

### Backend
- **API**: Next.js API Routes
- **Database**: PostgreSQL (Supabase)
- **Realtime**: Firebase Firestore
- **Storage**: Firebase Storage
- **Push Notifications**: Firebase Cloud Messaging (FCM)

### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Database**: Supabase
- **Realtime & Storage**: Firebase
- **Analytics**: Google Analytics 4 + Custom tracking

---

## 📁 Cấu Trúc Thư Mục

```
goldencard-website/
├── app/
│   ├── crm/                      # CRM Module (existing)
│   ├── projects/                 # Project Management Module
│   │   ├── page.tsx              # Projects list
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Project detail
│   │   │   ├── kanban/           # Kanban view
│   │   │   ├── gantt/            # Gantt chart
│   │   │   └── chat/             # Project chat
│   │   └── new/
│   │       └── page.tsx          # Create project
│   ├── chat/                     # Chat Module
│   │   ├── page.tsx              # Chat home
│   │   ├── [conversationId]/     # Conversation view
│   │   └── groups/               # Group management
│   ├── analytics/                # Analytics Dashboard
│   │   └── page.tsx
│   └── api/
│       ├── projects/             # Project APIs
│       ├── tasks/                # Task APIs
│       ├── chat/                 # Chat APIs (Firebase sync)
│       └── notifications/        # Notification APIs
├── components/
│   ├── Projects/                 # Project components
│   │   ├── ProjectCard.tsx
│   │   ├── KanbanBoard.tsx
│   │   ├── GanttChart.tsx
│   │   ├── TaskList.tsx
│   │   └── ProjectDashboard.tsx
│   ├── Chat/                     # Chat components
│   │   ├── ChatSidebar.tsx
│   │   ├── MessageList.tsx
│   │   ├── MessageInput.tsx
│   │   ├── UserStatus.tsx
│   │   └── GroupChat.tsx
│   ├── Notifications/            # Notification components
│   │   ├── NotificationBell.tsx
│   │   ├── NotificationList.tsx
│   │   └── NotificationToast.tsx
│   └── Analytics/                # Analytics components
│       ├── VisitorMap.tsx
│       ├── PageStats.tsx
│       └── TrafficChart.tsx
├── lib/
│   ├── firebase/                 # Firebase configuration
│   │   ├── config.ts
│   │   ├── firestore.ts
│   │   ├── storage.ts
│   │   ├── messaging.ts
│   │   └── auth.ts
│   ├── supabase/                 # Supabase (existing + new)
│   │   ├── client.ts
│   │   ├── projects.ts
│   │   └── tasks.ts
│   └── types/                    # TypeScript types
│       ├── project.ts
│       ├── chat.ts
│       └── notification.ts
├── hooks/                        # Custom React hooks
│   ├── useChat.ts
│   ├── useProjects.ts
│   ├── useNotifications.ts
│   └── useRealtime.ts
└── services/                     # Business logic services
    ├── ProjectService.ts
    ├── ChatService.ts
    ├── NotificationService.ts
    └── AnalyticsService.ts
```

---

## 🗄️ Database Schema

### PostgreSQL (Supabase) - Project Management

```sql
-- Users table (extends existing)
ALTER TABLE users ADD COLUMN IF NOT EXISTS
  department VARCHAR(100),
  position VARCHAR(100),
  avatar_url TEXT,
  fcm_token TEXT,
  online_status VARCHAR(20) DEFAULT 'offline',
  last_seen_at TIMESTAMPTZ;

-- Projects table
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'planning', -- planning, active, on_hold, completed, cancelled
  priority VARCHAR(20) DEFAULT 'medium', -- low, medium, high, urgent
  start_date DATE,
  end_date DATE,
  budget DECIMAL(15,2),
  spent_amount DECIMAL(15,2) DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  owner_id UUID REFERENCES users(id),
  client_id UUID REFERENCES leads(id), -- Link to CRM
  firebase_chat_id VARCHAR(100), -- Link to Firebase group chat
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);

-- Project Members
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(50) DEFAULT 'member', -- owner, manager, member, viewer
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, user_id)
);

-- Milestones
CREATE TABLE milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  milestone_id UUID REFERENCES milestones(id) ON DELETE SET NULL,
  parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE, -- For subtasks
  title VARCHAR(500) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo', -- todo, in_progress, review, done, cancelled
  priority VARCHAR(20) DEFAULT 'medium',
  assignee_id UUID REFERENCES users(id),
  reporter_id UUID REFERENCES users(id),
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  estimated_hours DECIMAL(6,2),
  actual_hours DECIMAL(6,2),
  order_index INTEGER DEFAULT 0,
  tags TEXT[], -- Array of tags
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Task Watchers (people who want to be notified)
CREATE TABLE task_watchers (
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  PRIMARY KEY (task_id, user_id)
);

-- Task Comments
CREATE TABLE task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  mentions UUID[], -- Array of mentioned user IDs
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Attachments (metadata, actual file in Firebase Storage)
CREATE TABLE attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  uploaded_by UUID REFERENCES users(id),
  file_name VARCHAR(255) NOT NULL,
  file_type VARCHAR(100),
  file_size INTEGER,
  firebase_path TEXT NOT NULL, -- Path in Firebase Storage
  download_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  action VARCHAR(100) NOT NULL, -- created, updated, deleted, status_changed, assigned, commented
  entity_type VARCHAR(50), -- project, task, milestone, comment
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications (SQL mirror of Firebase for querying)
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- message, mention, task_assigned, deadline, status_change
  title VARCHAR(255),
  body TEXT,
  data JSONB, -- Additional data
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_activity_logs_project ON activity_logs(project_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read_at);
```

### Firebase Firestore Structure

```javascript
// Firestore Collections Structure

// users/{uid}
{
  uid: "user123",
  email: "user@goldenenergy.vn",
  displayName: "Nguyen Van A",
  photoURL: "https://...",
  role: "manager", // admin, manager, staff
  department: "Sales",
  status: "online", // online, offline, away, busy
  lastSeen: Timestamp,
  fcmTokens: ["token1", "token2"], // Multiple devices
  settings: {
    notifications: {
      messages: true,
      mentions: true,
      taskUpdates: true,
      deadlines: true
    },
    theme: "light" // light, dark, system
  },
  createdAt: Timestamp
}

// chats/{chatId} - Direct messages
{
  type: "direct",
  participants: ["uid1", "uid2"],
  participantDetails: {
    uid1: { displayName: "...", photoURL: "..." },
    uid2: { displayName: "...", photoURL: "..." }
  },
  lastMessage: {
    text: "Hello!",
    senderId: "uid1",
    timestamp: Timestamp
  },
  unreadCount: {
    uid1: 0,
    uid2: 2
  },
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// chats/{chatId}/messages/{messageId}
{
  senderId: "uid1",
  senderName: "Nguyen Van A",
  senderPhoto: "https://...",
  text: "Hello @user2, check this file",
  type: "text", // text, image, file, system
  mentions: ["uid2"],
  attachments: [
    {
      name: "document.pdf",
      type: "application/pdf",
      size: 1024000,
      url: "https://firebasestorage.googleapis.com/..."
    }
  ],
  reactions: {
    "👍": ["uid2", "uid3"],
    "❤️": ["uid1"]
  },
  replyTo: "messageId123", // If replying to another message
  pinned: false,
  edited: false,
  editedAt: null,
  deleted: false,
  createdAt: Timestamp
}

// groups/{groupId} - Group chats
{
  name: "Sales Team",
  description: "Discussion for sales department",
  type: "group", // group, project
  projectId: "project123", // If linked to a project
  avatar: "https://...",
  owner: "uid1",
  admins: ["uid1", "uid2"],
  members: ["uid1", "uid2", "uid3", "uid4"],
  memberDetails: {
    uid1: { displayName: "...", photoURL: "...", role: "admin" },
    // ...
  },
  settings: {
    onlyAdminsCanPost: false,
    onlyAdminsCanAddMembers: true
  },
  lastMessage: {
    text: "Meeting at 3pm",
    senderId: "uid2",
    timestamp: Timestamp
  },
  pinnedMessages: ["msgId1", "msgId2"],
  createdAt: Timestamp,
  updatedAt: Timestamp
}

// groups/{groupId}/messages/{messageId}
// Same structure as chats/{chatId}/messages/{messageId}

// notifications/{uid}/items/{notificationId}
{
  type: "message", // message, mention, task_assigned, deadline, project_update
  title: "Tin nhắn mới từ Nguyen Van A",
  body: "Hello, please check the project status",
  data: {
    chatId: "chat123",
    messageId: "msg456",
    senderId: "uid1"
  },
  read: false,
  actionUrl: "/chat/chat123",
  createdAt: Timestamp
}

// typing/{chatId}/{oderId}
{
  oderId: "uid1",
  isTyping: true,
  timestamp: Timestamp
}

// presence/{uid}
{
  online: true,
  lastSeen: Timestamp,
  currentPage: "/projects/123"
}
```

---

## 🔐 Phân Quyền (RBAC)

### Roles & Permissions

| Permission | Admin | Manager | Staff |
|------------|-------|---------|-------|
| **Projects** |
| Create project | ✅ | ✅ | ❌ |
| Edit any project | ✅ | Own only | ❌ |
| Delete project | ✅ | ❌ | ❌ |
| View all projects | ✅ | ✅ | Assigned |
| **Tasks** |
| Create task | ✅ | ✅ | ✅ |
| Assign task | ✅ | ✅ | ❌ |
| Edit task | ✅ | ✅ | Own/Assigned |
| Delete task | ✅ | ✅ | ❌ |
| **Chat** |
| Create group | ✅ | ✅ | ❌ |
| Add members | ✅ | ✅ | ❌ |
| Send messages | ✅ | ✅ | ✅ |
| Delete messages | ✅ | Own only | Own only |
| **Users** |
| Manage users | ✅ | ❌ | ❌ |
| View user list | ✅ | ✅ | ✅ |
| **Analytics** |
| View dashboard | ✅ | ✅ | ❌ |
| Export data | ✅ | ❌ | ❌ |

---

## 🔄 API Endpoints

### Projects API

```
GET    /api/projects              # List all projects
POST   /api/projects              # Create project
GET    /api/projects/:id          # Get project detail
PUT    /api/projects/:id          # Update project
DELETE /api/projects/:id          # Delete project
GET    /api/projects/:id/tasks    # Get project tasks
GET    /api/projects/:id/members  # Get project members
POST   /api/projects/:id/members  # Add member
DELETE /api/projects/:id/members/:userId  # Remove member
GET    /api/projects/:id/activity # Get activity log
GET    /api/projects/:id/stats    # Get project statistics
```

### Tasks API

```
GET    /api/tasks                 # List tasks (with filters)
POST   /api/tasks                 # Create task
GET    /api/tasks/:id             # Get task detail
PUT    /api/tasks/:id             # Update task
DELETE /api/tasks/:id             # Delete task
POST   /api/tasks/:id/comments    # Add comment
GET    /api/tasks/:id/comments    # Get comments
POST   /api/tasks/:id/attachments # Upload attachment
PUT    /api/tasks/:id/status      # Update status
POST   /api/tasks/:id/watchers    # Add watcher
```

### Chat API (Firebase Sync)

```
POST   /api/chat/sync-user        # Sync user to Firebase
GET    /api/chat/conversations    # List conversations
POST   /api/chat/groups           # Create group
PUT    /api/chat/groups/:id       # Update group
POST   /api/chat/groups/:id/members  # Add members
DELETE /api/chat/groups/:id/members/:userId  # Remove member
```

### Notifications API

```
GET    /api/notifications         # List notifications
PUT    /api/notifications/:id/read # Mark as read
PUT    /api/notifications/read-all # Mark all as read
POST   /api/notifications/subscribe # Subscribe to FCM
DELETE /api/notifications/token   # Remove FCM token
```

### Analytics API

```
GET    /api/analytics/visitors    # Get visitor stats
GET    /api/analytics/pages       # Get page stats
GET    /api/analytics/geographic  # Get geographic data
GET    /api/analytics/realtime    # Get realtime visitors
```

---

## 🔔 Notification Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    NOTIFICATION SYSTEM FLOW                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────┐     ┌──────────┐     ┌──────────────────────┐     │
│  │  Event   │────▶│ Backend  │────▶│  Firebase Functions  │     │
│  │ Trigger  │     │   API    │     │  (Cloud Functions)   │     │
│  └──────────┘     └──────────┘     └──────────┬───────────┘     │
│                                                │                 │
│       Events:                                  │                 │
│       - New message                            ▼                 │
│       - @mention                    ┌──────────────────┐        │
│       - Task assigned               │   FCM Service    │        │
│       - Deadline approaching        │  (Push Notify)   │        │
│       - Project status change       └────────┬─────────┘        │
│       - File uploaded                        │                  │
│                                              │                  │
│                         ┌────────────────────┼────────────────┐ │
│                         │                    │                │ │
│                         ▼                    ▼                │ │
│              ┌──────────────────┐  ┌──────────────────┐      │ │
│              │   In-App Toast   │  │   Push Notify    │      │ │
│              │   (Realtime)     │  │   (Mobile/Web)   │      │ │
│              └──────────────────┘  └──────────────────┘      │ │
│                         │                    │                │ │
│                         └────────────────────┘                │ │
│                                    │                          │ │
│                                    ▼                          │ │
│                         ┌──────────────────┐                  │ │
│                         │  Notification    │                  │ │
│                         │  Badge Update    │                  │ │
│                         └──────────────────┘                  │ │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 💰 Tối Ưu Chi Phí

### Firebase Pricing Strategy

1. **Firestore**
   - Sử dụng batched writes cho bulk operations
   - Cache data với React Query
   - Pagination cho messages (20 per load)
   - Chỉ subscribe realtime cho active conversations

2. **Storage**
   - Compress images trước khi upload
   - Limit file size: 10MB
   - Auto-delete old files after 90 days
   - Use thumbnails for image previews

3. **FCM**
   - Batch notifications
   - Collapse similar notifications
   - Limit to 5 notifications per minute per user

### Estimated Monthly Cost

| Service | Free Tier | Estimated Usage | Est. Cost |
|---------|-----------|-----------------|-----------|
| Firestore | 50k reads/day | 200k reads/day | ~$5-10 |
| Storage | 5GB | 50GB | ~$1 |
| FCM | Unlimited | - | Free |
| Supabase | 500MB | 2GB | ~$25 |
| Vercel | 100GB bandwidth | 200GB | ~$20 |
| **Total** | | | **~$50-60/month** |

---

## 🚀 Deployment Guide

### Prerequisites

1. Firebase Project với Firestore, Storage, FCM enabled
2. Supabase Project với PostgreSQL
3. Vercel Account
4. Domain configured

### Environment Variables

```env
# Firebase
NEXT_PUBLIC_FIREBASE_API_KEY=xxx
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=xxx
NEXT_PUBLIC_FIREBASE_PROJECT_ID=xxx
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=xxx
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=xxx
NEXT_PUBLIC_FIREBASE_APP_ID=xxx
FIREBASE_ADMIN_SDK_KEY=xxx (base64 encoded)

# Supabase
NEXT_PUBLIC_SUPABASE_URL=xxx
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxx
SUPABASE_SERVICE_ROLE_KEY=xxx

# App
NEXT_PUBLIC_APP_URL=https://goldenenergy.vn
```

### Deployment Steps

1. Setup Firebase Project
2. Run SQL migrations on Supabase
3. Configure environment variables on Vercel
4. Deploy to Vercel
5. Setup Firebase Security Rules
6. Test all features

---

**Tiếp theo, tôi sẽ tạo code chi tiết cho từng module...**
