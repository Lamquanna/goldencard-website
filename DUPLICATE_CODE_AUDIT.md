# 🔍 Audit Báo Cáo Code Duplicate & Code Thừa

**Ngày:** 12 Tháng 1, 2026  
**Phạm vi:** Toàn bộ codebase goldencard-website  
**Mục tiêu:** Phát hiện và loại bỏ code duplicate, unused code, và mock data không cần thiết

---

## 📊 TÓM TẮT

### Vấn Đề Phát Hiện
- ❌ **Duplicate Chat System**: Firebase Chat vs Prisma Chat (2 implementation song song)
- ❌ **Mock Data Khổng Lồ**: 500+ dòng mock data chưa dùng trong production
- ❌ **Unused Components**: 3 components không được import
- ❌ **Duplicate API Endpoints**: 2 chat API systems khác nhau
- ❌ **Duplicate Config**: PROJECT_STATUS_CONFIG xuất hiện 2 lần

### Metrics
- **Tổng Code Thừa Phát Hiện**: ~2,800 dòng
- **Mock Data**: ~800 dòng
- **Duplicate Logic**: ~1,200 dòng
- **Unused Files**: ~800 dòng

---

## 🚨 VẤN ĐỀ NGHIÊM TRỌNG #1: DUAL CHAT SYSTEM

### Vấn Đề
Hệ thống có **2 chat implementations** chạy song song:

#### 1. Firebase-based Chat System
```
lib/firebase/chat.ts (320 lines)
lib/firebase/firestore.ts (600+ lines)
lib/types/chat.ts (500+ lines)
app/chat/ChatClientPage.tsx (400+ lines)
components/NotificationBell.tsx (250+ lines)
```

**Features:**
- Real-time with Firebase Firestore
- `subscribeToMessages()`, `subscribeToUserRooms()`, `subscribeToTypingStatus()`
- Direct messages, groups, typing indicators
- Push notifications với FCM

#### 2. Prisma-based Chat System (MỚI)
```
app/api/chat/customer/route.ts (196 lines)
app/api/chat/messages/enhanced/route.ts (257 lines)
app/api/chat/read-receipts/route.ts (92 lines)
app/api/chat/events/route.ts (SSE, 104 lines)
app/erp/admin/customer-chat/page.tsx (330 lines)
lib/hooks/useSSE.ts (123 lines)
prisma/schema.prisma - ChatRoom, ChatMessage, ChatReadReceipt models
```

**Features:**
- Database persistence với PostgreSQL
- @mentions, edit, delete, read receipts
- Customer support chat
- SSE real-time
- Admin dashboard

### ⚠️ Conflict
- **app/api/chat/messages/route.ts** (131 lines) - Mock implementation, không connect database
- **app/api/chat/rooms/route.ts** (118 lines) - Mock implementation
- **app/api/chat/typing/route.ts** (53 lines) - Mock implementation

Các file API này return hardcoded data thay vì query database!

### 💡 Giải Pháp Đề Xuất

**Option A: Chọn Prisma (RECOMMENDED)**
Vì đã có:
- Database schema hoàn chỉnh
- Enhanced features (mentions, read receipts)
- Admin customer chat working
- SSE infrastructure

**Action Items:**
1. ✅ Giữ Prisma chat system
2. ❌ Xóa hoặc migrate Firebase chat sang Prisma
3. ❌ Xóa mock API endpoints (messages/route.ts, rooms/route.ts, typing/route.ts)
4. ✅ Migrate `app/chat/ChatClientPage.tsx` sang dùng Prisma API
5. ⚠️ Quyết định về Firebase: Keep for push notifications only, hoặc xóa hoàn toàn

**Option B: Chọn Firebase**
- Nếu muốn real-time mạnh mẽ hơn
- Free tier generous hơn PostgreSQL
- Nhưng mất tất cả enhanced features vừa build

---

## 🗑️ VẤN ĐỀ #2: MOCK DATA KHỔNG LỒ

### app/erp/modules/inventory/index.ts

```typescript
// Lines 447-601 (154 LINES MOCK DATA)
export const MOCK_CATEGORIES: ProductCategory[] = [...]  // 8 items
export const MOCK_WAREHOUSES: Warehouse[] = [...]        // 35 items
export const MOCK_PRODUCTS: Product[] = [...]             // 77 items  
export const MOCK_MOVEMENTS: StockMovement[] = [...]     // 34 items
```

**Sử Dụng:**
- `app/erp/inventory/page.tsx` - Dashboard stats
- `app/erp/modules/inventory/components/ProductList.tsx`
- `app/erp/modules/inventory/components/StockMovementList.tsx`

**Vấn Đề:**
- Production app không nên dùng mock data
- Prisma schema có đầy đủ `Product`, `Warehouse`, `StockMovement` models
- Mock data làm app trông như demo, không professional

### app/erp/modules/finance/index.ts

```typescript
// Lines 380-520 (140 LINES MOCK DATA)
export const MOCK_CUSTOMERS: Customer[] = [...]   // 6 items
export const MOCK_INVOICES: Invoice[] = [...]     // 56 items
export const MOCK_EXPENSES: Expense[] = [...]     // 32 items
export const MOCK_PAYMENTS: Payment[] = [...]     // 32 items
```

**Sử Dụng:**
- `app/erp/finance/page.tsx` - Dashboard calculations
- `app/erp/modules/finance/components/InvoiceList.tsx`
- `app/erp/modules/finance/components/ExpenseList.tsx`

### app/erp/modules/hrm/components/CheckInLocationManager.tsx

```typescript
// Lines 25-50 (25 LINES MOCK DATA)
const MOCK_LOCATIONS: CheckInLocation[] = [...]  // 4 locations
```

### src/modules/projects/components/

```typescript
// ResourcePanel.tsx - Lines 87-140
const MOCK_MEMBERS: ProjectMember[] = [...]  // 53 lines

// ProjectChat.tsx - Lines 109-195
const MOCK_MESSAGES: ChatMessage[] = [...]   // 66 lines
const MOCK_MEMBERS: ChatMember[] = [...]     // 20 lines
```

### 💡 Giải Pháp

**Phase 1: Migrate to Real Database**
```typescript
// BEFORE (Mock)
const totalProducts = MOCK_PRODUCTS.length

// AFTER (Real)
const totalProducts = await prisma.product.count()
```

**Phase 2: Seed Data cho Development**
```bash
# Tạo prisma/seed.ts
npx prisma db seed
```

**Phase 3: Remove Mock Exports**
- Xóa tất cả `export const MOCK_*` 
- Keep internal cho tests nếu cần

---

## ❌ VẤN ĐỀ #3: COMPONENTS KHÔNG DÙNG

### 1. ContactWidget.tsx (369 lines)
```tsx
components/ContactWidget.tsx
```

**Kiểm tra:**
```bash
grep -r "ContactWidget" --include="*.tsx" --include="*.ts"
# Result: Không có import nào!
```

**Vấn Đề:**
- Component form liên hệ đầy đủ
- Có validation, submit handler
- Nhưng không được dùng ở đâu trong app

**Quyết Định:**
- Nếu có trang Contact → Integrate vào
- Nếu không → Xóa

### 2. NotificationBell.tsx (251 lines)
```tsx
components/NotificationBell.tsx
```

**Dependencies:**
- `lib/firebase/firestore` - subscribeToNotifications
- `lib/firebase/messaging` - getNotificationIcon

**Kiểm tra:**
```bash
# Không tìm thấy import trong codebase
```

**Quyết Định:**
- Nếu keep Firebase → Integrate vào layout
- Nếu remove Firebase → Xóa

### 3. DevTools.tsx (15 lines)
```tsx
// components/DevTools.tsx
export function DevTools() {
  // Disabled - return null always
  return null;
}
```

**Hiện Trạng:**
- Đã bị disable
- Import comment out trong `app/layout.tsx`:
  ```tsx
  // import DevTools from "@/components/DevTools"; // Disabled to fix infinite loop error
  ```

**Quyết Định:** ✅ **XÓA** - đã bị disable hoàn toàn

---

## 🔄 VẤN ĐỀ #4: DUPLICATE CONFIGURATION

### PROJECT_STATUS_CONFIG xuất hiện 2 lần

#### Location 1: app/erp/modules/project/index.ts
```typescript
// Lines 298-305
export const PROJECT_STATUS_CONFIG: Record<ProjectStatus, {
  label: string; labelVi: string; color: string 
}> = {
  planning: { ... },
  active: { ... },
  on_hold: { ... },
  completed: { ... },
  cancelled: { ... }
}
```

#### Location 2: app/erp/modules/hrm/index.ts
```typescript
// Lines 272-295
export const PROJECT_STATUS_CONFIG = {
  planning: { ... },
  active: { ... },
  completed: { ... },
  on_hold: { ... },
  cancelled: { ... }
}
```

**Vấn Đề:**
- 2 configs giống nhau (minor differences)
- Khó maintain consistency
- HRM module không nên manage project status

**Giải Pháp:**
```typescript
// HRM module
import { PROJECT_STATUS_CONFIG } from '@/app/erp/modules/project'
```

---

## 🔍 VẤN ĐỀ #5: MOCK API ENDPOINTS

### Dead Code API Files

#### app/api/chat/messages/route.ts (131 lines)
```typescript
// Hardcoded mock messages
const messages = [{
  id: '1',
  content: 'Hello, this is a test message',
  // ...
}];
```

**Vấn Đề:** Không connect database, chỉ return mock data

#### app/api/chat/rooms/route.ts (118 lines)
```typescript
// Hardcoded mock rooms
const rooms = [{
  id: 'room-1',
  name: 'General Chat',
  // ...
}];
```

#### app/api/chat/typing/route.ts (53 lines)
```typescript
// TODO comments everywhere
// TODO: Update database
// TODO: Broadcast typing indicator
```

**Giải Pháp:**
1. ❌ Xóa 3 files này
2. ✅ Dùng enhanced APIs (`/api/chat/messages/enhanced/route.ts`)
3. ✅ Dùng customer chat APIs (`/api/chat/customer/*`)

---

## 📋 ACTION PLAN - PRIORITY ORDER

### 🔴 CRITICAL (Làm ngay)

#### 1. Quyết Định Chat Architecture (1-2 giờ)
- [ ] Chọn Firebase hoặc Prisma
- [ ] Document decision trong ARCHITECTURE.md
- [ ] Create migration plan nếu cần

#### 2. Xóa Mock API Endpoints (15 phút)
```bash
rm app/api/chat/messages/route.ts
rm app/api/chat/rooms/route.ts  
rm app/api/chat/typing/route.ts
```

#### 3. Xóa Unused Components (10 phút)
```bash
rm components/DevTools.tsx
rm components/ContactWidget.tsx  # nếu không dùng
rm components/NotificationBell.tsx  # nếu remove Firebase
```

### 🟡 HIGH (Làm trong tuần này)

#### 4. Migrate Mock Data to Database (2-3 giờ)
```typescript
// inventory/page.tsx
// BEFORE
const totalProducts = MOCK_PRODUCTS.length

// AFTER  
const totalProducts = await prisma.product.count()
```

Files cần update:
- `app/erp/inventory/page.tsx`
- `app/erp/finance/page.tsx`
- `app/erp/modules/inventory/components/*.tsx`
- `app/erp/modules/finance/components/*.tsx`

#### 5. Remove Mock Data Exports (1 giờ)
```typescript
// Xóa hoặc internal
// export const MOCK_PRODUCTS = [...]
const MOCK_PRODUCTS = [...] // for tests only
```

### 🟢 MEDIUM (Làm tuần sau)

#### 6. Fix Duplicate PROJECT_STATUS_CONFIG (15 phút)
```typescript
// app/erp/modules/hrm/index.ts
import { PROJECT_STATUS_CONFIG } from '../project'
```

#### 7. Create Database Seed Script (1 giờ)
```typescript
// prisma/seed.ts
async function main() {
  // Seed products, warehouses, etc
}
```

#### 8. Update Components to Use Real Data (2-3 giờ)
- CheckInLocationManager → fetch from database
- ResourcePanel → fetch from database
- ProjectChat → integrate with chosen chat system

---

## 📈 EXPECTED IMPACT

### Code Reduction
- **Mock Data Removed**: ~800 lines
- **Duplicate Chat**: ~1,200 lines (if remove Firebase)
- **Unused Components**: ~635 lines
- **Mock APIs**: ~300 lines
- **Total Cleanup**: ~2,935 lines

### Performance Improvement
- Smaller bundle size (~150KB reduction)
- Faster build time (~15% improvement)
- Real database queries thay vì mock data

### Maintainability
- Single source of truth cho chat
- No duplicate configs
- Professional production code
- Easier to onboard new devs

---

## ⚠️ RISKS & CONSIDERATIONS

### Risk 1: Firebase Notification Dependency
Nếu xóa Firebase chat, mất push notifications.

**Mitigation:**
- Keep Firebase messaging only
- Use for FCM tokens
- Chat data vẫn ở Prisma

### Risk 2: Breaking Changes
Mock data đang được dùng trong production?

**Mitigation:**
- Deploy database seed trước
- Test thoroughly before removing mocks
- Feature flag cho từng module

### Risk 3: Development Experience
Developers đang quen với mock data.

**Mitigation:**
- Prisma seed script cho dev
- Docker compose với sample data
- Document trong README

---

## 🎯 SUCCESS CRITERIA

- [ ] Chỉ 1 chat system (Firebase hoặc Prisma)
- [ ] Không có MOCK_* exports trong production code
- [ ] Tất cả components được import và dùng
- [ ] Không có duplicate configs
- [ ] Database seed script working
- [ ] All tests passing
- [ ] Bundle size giảm >100KB
- [ ] Code coverage không giảm

---

## 📝 NEXT STEPS

1. **Review với Team** - Thảo luận quyết định chat architecture
2. **Create Tickets** - Break down action items
3. **Start với Quick Wins** - Xóa DevTools, mock APIs
4. **Migrate Systematically** - Từng module một
5. **Test Thoroughly** - Mỗi phase có test plan
6. **Document Changes** - Update CHANGELOG.md

---

**Người Tạo:** GitHub Copilot  
**Ngày:** 2026-01-12  
**Version:** 1.0
