# 📋 SYSTEM DOCUMENTATION

## Tổng quan dự án Golden Energy ERP

Hệ thống ERP đa chức năng cho quản lý doanh nghiệp năng lượng mặt trời, bao gồm CRM, HRM, Projects, Inventory, Finance và nhiều module khác.

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

### Tech Stack

**Frontend:**
- Next.js 16.0.10 (App Router, React Server Components)
- React 19.2.3
- TypeScript 5.9.3
- Tailwind CSS 4.0
- Radix UI + Shadcn/ui
- Framer Motion (Animations)

**Backend:**
- Next.js API Routes (Serverless)
- Prisma ORM 7.1.0
- PostgreSQL (Neon/Vercel)

**Auth:**
- NextAuth 5.0
- Supabase Auth
- Firebase Auth
- bcryptjs

**State Management:**
- Zustand 5.0.8
- React Hooks

---

## 📁 STRUCTURE

```
goldencard-website/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── chat/                 # Chat APIs
│   │   │   ├── customer/         # Customer chat (website visitors)
│   │   │   ├── messages/         # Internal chat messages
│   │   │   │   └── enhanced/     # Enhanced with @mentions, edit, delete
│   │   │   └── read-receipts/    # Read receipts tracking
│   │   ├── crm/                  # CRM endpoints
│   │   ├── erp/                  # ERP endpoints
│   │   └── ...
│   ├── erp/                      # ERP Dashboard
│   │   ├── admin/
│   │   │   └── customer-chat/    # Admin customer chat view
│   │   ├── crm/                  # CRM Module
│   │   ├── hrm/                  # HRM Module
│   │   ├── projects/             # Projects Module
│   │   ├── inventory/            # Inventory Module
│   │   ├── finance/              # Finance Module
│   │   ├── chat/                 # Internal chat
│   │   └── ...
│   └── [locale]/                 # Public pages (multilingual)
├── components/                   # React Components
│   ├── ui/                       # Shadcn UI components
│   ├── Chat/                     # Chat components
│   ├── ChatWidget.tsx            # Customer chat widget
│   └── ...
├── lib/                          # Utilities
│   ├── prisma.ts                 # Prisma client
│   ├── utils.ts                  # Helper functions
│   └── ...
├── prisma/                       # Database
│   └── schema.prisma             # Database schema
└── public/                       # Static assets
```

---

## 🗄️ DATABASE SCHEMA

### Core Models (64+ tables)

#### **Workspace & Users (8 models)**
- `Workspace` - Multi-tenant workspaces
- `User` - Users with authentication
- `WorkspaceMember` - Workspace memberships
- `WorkspaceModule` - Installed modules
- `Account`, `Session`, `VerificationToken` - NextAuth
- `WorkspaceInvitation` - Member invitations

#### **CRM Module (5 models)**
- `Lead` - Customer leads với support cho anonymous chat
- `Contact` - Customer contacts
- `Deal` - Sales opportunities  
- `Quotation`, `QuotationItem` - Quotations

#### **HRM Module (7 models)**
- `Employee` - Employee management
- `Department`, `Position` - Org structure
- `Attendance` - Check-in/out with GPS, WiFi, Face ID
- `LeaveRequest` - Leave management
- `Payslip` - Payroll

#### **Projects Module (6 models)**
- `Project` - Project management
- `Task` - Tasks với subtasks
- `Sprint`, `Milestone` - Agile features
- `ProjectStage` - Kanban stages
- `TaskAssignee`, `TaskDependency`

#### **Inventory Module (5 models)**
- `Product` - Products catalog
- `Warehouse` - Warehouse management
- `StockLevel` - Stock levels per warehouse
- `StockMovement` - Stock movements tracking
- `PurchaseOrder`, `PurchaseOrderItem`

#### **Finance Module (3 models)**
- `Invoice`, `InvoiceItem` - Invoicing
- `Expense` - Expense tracking
- `Payment` - Payment records

#### **Chat Module (5 models - ĐÃ NÂNG CẤP)**
- `ChatRoom` - Chat rooms (DIRECT, GROUP, CHANNEL, CUSTOMER_SUPPORT)
- `ChatMember` - Room members
- `ChatMessage` - Messages với edit/delete support
- `ChatReadReceipt` - ✨ **MỚI** - Read receipts tracking
- `ChatReaction` - Message reactions

#### **Shared Models (10+ models)**
- `Activity` - Activity tracking
- `Comment` - Comments with threads
- `Attachment` - File attachments
- `Notification` - Notifications
- `Approval` - Approval workflows
- `AuditLog` - Audit trail
- `Automation` - Automation rules
- `Dashboard`, `DashboardWidget`
- `Document`, `DocumentVersion`

---

## 💬 HỆ THỐNG CHAT

### 1. Customer Chat (Website → Admin)

**Flow:**
1. Khách truy cập website → `<ChatWidget />` component
2. Khách nhập tin nhắn → `POST /api/chat/customer`
3. Tạo `ChatRoom` type `CUSTOMER_SUPPORT` + `ChatMessage`
4. Admin xem tại `/erp/admin/customer-chat`
5. Admin reply → `POST /api/chat/customer/[roomId]`

**Features:**
- ✅ Anonymous chat (tự động xóa sau 12h)
- ✅ Identified chat (lưu Lead vào CRM)
- ✅ Auto-reply với predefined responses
- ✅ Admin dashboard để xem tất cả chats
- ✅ Archive/Unarchive chats
- ✅ Real-time polling (5s interval)

**API Endpoints:**
```typescript
GET  /api/chat/customer              // List all customer chats
POST /api/chat/customer              // Create new customer chat
GET  /api/chat/customer/[roomId]     // Get messages
POST /api/chat/customer/[roomId]     // Send message
PATCH /api/chat/customer/[roomId]    // Archive/update room
```

### 2. Internal Chat (Nhân viên)

**Location:** `/erp/chat`

**Features ĐÃ NÂNG CẤP:**
- ✅ **@Mentions** - Tag người dùng với `@[Name](userId)`
- ✅ **Edit messages** - Hiển thị "(đã chỉnh sửa)"
- ✅ **Delete messages** - Soft delete
- ✅ **Read receipts** - Theo dõi ai đã đọc tin nhắn
  - Hiển thị số người đã đọc
  - Click để xem danh sách người đã đọc
  - "Tất cả đã đọc" khi full room reads
- ✅ **Message threads** - Reply to specific messages
- ✅ **File attachments** - Images, PDFs, Docs
- ✅ **Reactions** - Emoji reactions
- ✅ **Typing indicators**

**API Endpoints:**
```typescript
GET  /api/chat/messages/enhanced     // Get messages với read status
POST /api/chat/messages/enhanced     // Send với @mentions support
PATCH /api/chat/messages/enhanced    // Edit/Delete message

GET  /api/chat/read-receipts         // Get read receipts for message
POST /api/chat/read-receipts         // Mark messages as read
```

**Read Receipts Format:**
```typescript
{
  message: {
    id: "msg123",
    content: "Hello",
    readBy: [
      { id: "user1", name: "John", avatar: "..." },
      { id: "user2", name: "Jane", avatar: "..." }
    ],
    readCount: 2,
    isReadByCurrentUser: true
  }
}
```

**@Mentions Format:**
```typescript
// In message content:
"Hey @[John Doe](user-id-123), please check this!"

// In metadata:
{
  mentions: ["user-id-123"]
}

// Creates notification to mentioned user
```

---

## 🔌 API CONVENTIONS

### Response Format
```typescript
// Success
{
  success: true,
  data: {...},
  // or specific fields
}

// Error
{
  error: "Error message",
  code: "ERROR_CODE" // optional
}
```

### Pagination
```typescript
GET /api/resource?limit=50&before=2024-01-12T10:00:00Z

Response:
{
  success: true,
  items: [...],
  hasMore: boolean
}
```

### Authentication
- Use NextAuth session or custom auth middleware
- Check `userId` from session
- Verify workspace membership

---

## 🚀 DEPLOYMENT

### Environment Variables

```env
# Database
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."

# NextAuth
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="..."

# Firebase (optional)
NEXT_PUBLIC_FIREBASE_API_KEY="..."
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="..."
NEXT_PUBLIC_FIREBASE_PROJECT_ID="..."
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="..."
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="..."
NEXT_PUBLIC_FIREBASE_APP_ID="..."

# Supabase (optional)
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

### Build & Deploy

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Build
npm run build

# Start production
npm run start
```

### Vercel Deployment
1. Connect GitHub repo
2. Set environment variables
3. Deploy automatically on push

---

## 📝 CODING STANDARDS

### File Naming
- Components: `PascalCase.tsx`
- Utils: `camelCase.ts`
- API routes: `route.ts` (Next.js convention)

### Component Structure
```typescript
// 1. Imports
import { useState } from 'react';
import { Button } from '@/components/ui/button';

// 2. Types
interface MyComponentProps {
  title: string;
}

// 3. Component
export default function MyComponent({ title }: MyComponentProps) {
  // 3.1 State
  const [count, setCount] = useState(0);
  
  // 3.2 Effects
  useEffect(() => {}, []);
  
  // 3.3 Handlers
  const handleClick = () => {};
  
  // 3.4 Render
  return <div>{title}</div>;
}
```

### API Route Structure
```typescript
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    // Validate params
    // Query database
    // Return response
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error message' },
      { status: 500 }
    );
  }
}
```

---

## 🧪 TESTING

### Unit Tests
```bash
npm run test:unit
npm run test:unit:watch
```

### E2E Tests
```bash
npm run test:e2e
```

---

## 📚 FURTHER IMPROVEMENTS

### Planned Features
- [ ] Real-time WebSocket for chat
- [ ] File upload to cloud storage
- [ ] Advanced caching strategy
- [ ] Mobile app with React Native
- [ ] Advanced analytics dashboard
- [ ] AI-powered insights
- [ ] Multi-language support expansion

### Performance Optimizations
- [ ] Implement Redis caching
- [ ] Optimize database queries
- [ ] Add CDN for static assets
- [ ] Implement service workers
- [ ] Code splitting optimization

---

## 🤝 CONTRIBUTING

1. Create feature branch
2. Make changes
3. Write tests
4. Submit PR with description
5. Wait for review

---

## 📞 SUPPORT

For questions or issues:
- Email: dev@goldenenergy.vn
- Slack: #erp-development

---

**Last Updated:** January 12, 2026
**Version:** 2.0.0
**Maintainer:** Golden Energy Dev Team
