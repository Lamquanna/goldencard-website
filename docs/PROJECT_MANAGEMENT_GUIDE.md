# 📊 HỆ THỐNG QUẢN LÝ DỰ ÁN (PROJECT MANAGEMENT SYSTEM)

## ✨ Tổng quan

Hệ thống quản lý dự án thông minh với các tính năng:
- ✅ Hiển thị thời gian bắt đầu và deadline rõ ràng
- ✅ Thanh tiến độ màu động theo deadline và progress
- ✅ Cảnh báo tự động khi tiến độ chậm
- ✅ Thông báo/tag người tham gia dự án
- ✅ Tùy chọn bật/tắt thông báo
- ✅ Màu đỏ cảnh báo khi gần deadline mà tiến độ < 80%

## 🎨 Màu sắc thanh tiến độ

### Logic màu sắc

```typescript
function getProgressColor(progress: number, daysLeft: number, endDate: Date) {
  // Đỏ: Gần deadline (≤7 ngày) và tiến độ < 80%
  if (daysLeft <= 7 && progress < 80) return 'bg-red-500'
  
  // Vàng: Gần deadline (≤7 ngày) và tiến độ 80-90%
  if (daysLeft <= 7 && progress >= 80 && progress < 90) return 'bg-yellow-500'
  
  // Xanh lá: Tiến độ ≥ 90%
  if (progress >= 90) return 'bg-green-500'
  
  // Xanh dương: Mặc định
  return 'bg-blue-500'
}
```

### Ví dụ

| Tiến độ | Ngày còn lại | Màu sắc | Ý nghĩa |
|---------|--------------|---------|---------|
| 65% | 5 ngày | 🔴 Đỏ | Khẩn cấp! Tiến độ chậm |
| 85% | 6 ngày | 🟡 Vàng | Cần chú ý |
| 95% | 3 ngày | 🟢 Xanh lá | Tốt |
| 50% | 30 ngày | 🔵 Xanh dương | Bình thường |

## 🚨 Hệ thống cảnh báo

### Các loại cảnh báo

#### 1. Cảnh báo đỏ (Danger)
**Điều kiện**: Còn ≤ 7 ngày đến deadline và tiến độ < 80%

**Thông báo**: 
```
🚨 Cảnh báo khẩn cấp!
Chỉ còn 5 ngày đến deadline nhưng tiến độ mới 65%! Cần tăng tốc ngay.
📱 Thông báo đã được gửi đến tất cả thành viên dự án
```

**Hiển thị**:
- Border card màu đỏ
- Alert đỏ ở trang chi tiết
- Biểu tượng cảnh báo ⚠️
- Tự động gửi notification đến all members

#### 2. Cảnh báo vàng (Warning)
**Điều kiện**: Còn ≤ 7 ngày và tiến độ 80-89%

**Thông báo**:
```
⚠️ Lưu ý tiến độ
Còn 6 ngày đến deadline, tiến độ 85%. Cần hoàn thành sớm.
```

#### 3. Tiến độ chậm
**Điều kiện**: Tiến độ thực tế < tiến độ dự kiến - 20%

**Thông báo**:
```
⚠️ Tiến độ chậm hơn kế hoạch!
Tiến độ thực tế: 45%, tiến độ dự kiến: 70%
```

## 📅 Hiển thị thời gian

### Trang danh sách (Grid View)

```tsx
{/* Timeline dưới mô tả */}
<div className="flex items-center gap-4 mb-4 text-xs">
  <div className="flex items-center gap-1 text-muted-foreground">
    <Calendar className="h-3 w-3" />
    <span>05/01/2026</span> {/* Ngày bắt đầu */}
  </div>
  <div className="flex items-center gap-1">
    <Clock className="h-3 w-3 text-red-500" />
    <span className="text-red-500 font-medium">
      20/01/2026 (5 ngày) {/* Deadline + ngày còn lại */}
    </span>
  </div>
</div>
```

### Trang danh sách (List View)

```tsx
{/* Timeline dưới mô tả */}
<div className="flex items-center gap-3 mt-2 text-xs">
  <span className="text-muted-foreground">
    📅 05/01/2026 - 20/01/2026
  </span>
  <span className="font-medium text-red-500">
    ⏱️ Còn 5 ngày
  </span>
</div>
```

### Trang chi tiết

```tsx
{/* 4 cards overview */}
<Card>
  <CardTitle>Ngày bắt đầu</CardTitle>
  <div>
    <p className="text-2xl font-bold">05/01</p>
    <p className="text-xs">2026</p>
  </div>
</Card>

<Card>
  <CardTitle>Deadline</CardTitle>
  <div>
    <p className="text-2xl font-bold">20/01</p>
    <p className="text-xs text-red-500 font-medium">
      Còn 5 ngày
    </p>
  </div>
</Card>
```

## 🔔 Hệ thống thông báo

### Cách hoạt động

#### 1. Kiểm tra tự động
```typescript
useEffect(() => {
  if (!project || !project.startDate || !project.endDate) return

  const alert = getDeadlineAlert(project.progress, project.startDate, project.endDate)
  
  if (alert && alert.type === 'danger' && notificationsEnabled) {
    // Gửi thông báo đến tất cả thành viên
    const memberIds = project.members.map(m => m.userId)
    sendProjectNotification(
      project.id,
      `🚨 ${project.name}: ${alert.message}`,
      memberIds
    )
  }
}, [project, notificationsEnabled])
```

#### 2. Gửi thông báo
```typescript
async function sendProjectNotification(
  projectId: string, 
  message: string, 
  memberIds: string[]
) {
  console.log('📤 Sending notification:', { projectId, message, memberIds })
  
  // TODO: Implement API call
  // await fetch('/api/notifications/send', {
  //   method: 'POST',
  //   body: JSON.stringify({
  //     projectId,
  //     message,
  //     memberIds,
  //     type: 'project_deadline_alert'
  //   })
  // })
}
```

### Tính năng bật/tắt thông báo

#### UI Toggle
```tsx
<Card>
  <CardHeader>
    <CardTitle>Cài đặt thông báo</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="flex items-center justify-between">
      <Label>Thông báo tự động</Label>
      <Switch
        checked={notificationsEnabled}
        onCheckedChange={handleToggleNotifications}
      />
    </div>
    <p className="text-xs text-muted-foreground">
      {notificationsEnabled
        ? '✅ Bạn sẽ nhận thông báo khi dự án gần deadline'
        : '🔕 Thông báo đã tắt'}
    </p>
  </CardContent>
</Card>
```

#### Lưu trạng thái
```typescript
function handleToggleNotifications(enabled: boolean) {
  setNotificationsEnabled(enabled)
  
  // Lưu vào localStorage
  localStorage.setItem(`project_${projectId}_notifications`, enabled.toString())
  
  window.alert(enabled 
    ? '✅ Đã bật thông báo cho dự án này'
    : '🔕 Đã tắt thông báo cho dự án này'
  )
}
```

## 📱 Tích hợp API thông báo

### API Endpoint (cần implement)

```typescript
// POST /api/erp/notifications/send
{
  projectId: 'p1',
  message: '🚨 Website Redesign: Chỉ còn 5 ngày nhưng tiến độ mới 65%!',
  memberIds: ['u1', 'u2', 'u3'],
  type: 'project_deadline_alert',
  priority: 'high'
}

// Response
{
  success: true,
  sent: 3,
  failed: 0
}
```

### Database Schema (suggestion)

```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(50) NOT NULL,
  project_id VARCHAR(50),
  type VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'normal',
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX idx_notifications_project ON notifications(project_id);
```

## 🎯 Use Cases

### Case 1: Dự án gần deadline, tiến độ thấp

**Dữ liệu**:
- Tiến độ: 65%
- Deadline: 20/01/2026
- Ngày còn lại: 5 ngày

**UI**:
```
┌─────────────────────────────────────┐
│ ⚠️ Cảnh báo: Gần deadline, tiến độ  │
│    chậm!                            │
├─────────────────────────────────────┤
│ 🔴 Website Redesign                 │
│                                     │
│ 📅 05/01/2026  🔴 20/01/2026 (5 ngày)│
│                                     │
│ Tiến độ: 🔴 65%                     │
│ ▓▓▓▓▓▓▓░░░░░░░░░ (đỏ)               │
│ 16/24 công việc hoàn thành          │
└─────────────────────────────────────┘
```

**Thông báo tự động**:
- ✅ Gửi notification đến u1, u2, u3
- ✅ Alert đỏ trong trang chi tiết
- ✅ Border card màu đỏ

### Case 2: Dự án sắp hoàn thành

**Dữ liệu**:
- Tiến độ: 95%
- Deadline: 20/01/2026
- Ngày còn lại: 3 ngày

**UI**:
```
┌─────────────────────────────────────┐
│ 🟢 CRM Implementation                │
│                                     │
│ 📅 01/02/2026  🟢 30/06/2026        │
│                                     │
│ Tiến độ: 🟢 95%                     │
│ ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░ (xanh lá)          │
│ 15/16 công việc hoàn thành          │
└─────────────────────────────────────┘
```

**Thông báo**: Không có (tiến độ tốt)

### Case 3: Dự án quá deadline

**Dữ liệu**:
- Tiến độ: 35%
- Deadline: 10/01/2026
- Ngày còn lại: -2 (quá 2 ngày)

**Alert**:
```
🚨 Cảnh báo khẩn cấp!
Dự án đã quá deadline 2 ngày! Tiến độ hiện tại: 35%
📱 Thông báo đã được gửi đến tất cả thành viên dự án
```

## 📄 Files đã tạo/sửa

### 1. app/erp/projects/[id]/page.tsx (NEW)
- Trang chi tiết dự án
- Hiển thị ngày bắt đầu, deadline, tiến độ
- Alert system với màu sắc
- Toggle notification
- 611 lines

### 2. app/erp/projects/page.tsx (UPDATED)
- Thêm import date-fns functions
- Helper functions: `getProgressColor`, `shouldShowAlert`
- Updated ProjectCard với timeline và progress màu động
- Updated ProjectListItem với alert badge
- Updated mock data với deadline gần hơn

### Thay đổi chính:

**ProjectCard**:
```tsx
{/* Alert badge nếu gần deadline */}
{showAlert && (
  <div className="mb-3 flex items-center gap-2 text-xs bg-red-50 text-red-700 p-2 rounded-md">
    <AlertTriangle className="h-3 w-3" />
    <span className="font-medium">Cảnh báo: Gần deadline, tiến độ chậm!</span>
  </div>
)}

{/* Timeline */}
<div className="flex items-center gap-4 mb-4 text-xs">
  <Calendar /> 05/01/2026
  <Clock className="text-red-500" /> 20/01/2026 (5 ngày)
</div>

{/* Progress với màu động */}
<Progress value={65} className="h-2 bg-red-500" />
```

## 🧪 Testing

### Test Case 1: Card màu đỏ khi gần deadline

**Setup**:
```typescript
const project = {
  name: 'Website Redesign',
  startDate: new Date(2026, 0, 5),  // 5/1/2026
  endDate: new Date(2026, 0, 20),    // 20/1/2026
  progress: 65
}
```

**Expected**:
- ✅ Card có border đỏ
- ✅ Alert badge hiển thị "Cảnh báo: Gần deadline"
- ✅ Thanh progress màu đỏ
- ✅ Số ngày còn lại màu đỏ

### Test Case 2: Click vào dự án không bị 404

**Setup**: Click vào card "Website Redesign"

**Expected**:
- ✅ Navigate to `/erp/projects/p1`
- ✅ Page hiển thị chi tiết dự án
- ✅ 4 overview cards với thông tin
- ✅ Alert đỏ ở đầu trang

### Test Case 3: Tắt thông báo

**Steps**:
1. Vào trang chi tiết dự án
2. Scroll đến "Cài đặt thông báo"
3. Click toggle để tắt
4. Alert "🔕 Đã tắt thông báo"
5. Reload page
6. Toggle vẫn ở trạng thái "tắt"

**Expected**:
- ✅ Lưu vào localStorage
- ✅ Không gửi notification nữa
- ✅ Text hiển thị "🔕 Thông báo đã tắt"

### Test Case 4: Notification tự động

**Setup**: Dự án có alert danger + notifications enabled

**Expected**:
- ✅ Console.log hiển thị "📤 Sending notification"
- ✅ Message: "🚨 Website Redesign: Chỉ còn 5 ngày..."
- ✅ Member IDs: ['u1', 'u2', 'u3']

## 🔧 Tích hợp vào hệ thống

### 1. Cài đặt dependencies (đã có)
```json
{
  "date-fns": "^2.30.0",
  "lucide-react": "latest"
}
```

### 2. Import components
```tsx
import { differenceInDays, format, isAfter } from 'date-fns'
import { vi } from 'date-fns/locale'
import { AlertTriangle, Calendar, Clock } from 'lucide-react'
```

### 3. Sử dụng
```tsx
// Trang danh sách
<Link href="/erp/projects">
  Quản lý dự án
</Link>

// Trang chi tiết
<Link href="/erp/projects/p1">
  Website Redesign
</Link>
```

## 🚀 Next Steps (Optional enhancements)

### 1. API Integration
- [ ] Tạo `/api/erp/notifications/send` endpoint
- [ ] Tích hợp email/SMS notification
- [ ] WebSocket cho real-time alerts
- [ ] Push notifications trên mobile

### 2. Advanced Features
- [ ] Notification history page
- [ ] Batch notification settings (tắt all projects)
- [ ] Notification preferences (email, SMS, push)
- [ ] Snooze notifications (nhắc lại sau 1h, 1 ngày)

### 3. Analytics
- [ ] Dashboard tracking progress vs deadline
- [ ] Alert statistics (bao nhiêu dự án có risk)
- [ ] Export reports
- [ ] Gantt chart view

### 4. Team Collaboration
- [ ] @mention members trong comments
- [ ] Task assignment với auto-notify
- [ ] Daily standup reminders
- [ ] Milestone notifications

## 📚 Documentation

### Color System
- 🔴 Red (bg-red-500): Urgent - < 80% progress, ≤7 days left
- 🟡 Yellow (bg-yellow-500): Warning - 80-90% progress, ≤7 days left
- 🟢 Green (bg-green-500): Good - ≥90% progress
- 🔵 Blue (bg-blue-500): Normal - default state

### Notification Types
- **project_deadline_alert**: Gần deadline, tiến độ chậm
- **project_overdue**: Quá deadline
- **project_completed**: Hoàn thành dự án
- **project_status_changed**: Thay đổi status

### LocalStorage Keys
- `project_${projectId}_notifications`: Boolean string ('true'/'false')

## 🤝 Support

Nếu có câu hỏi:
1. Check console.log cho notification events
2. Verify localStorage có lưu notification setting không
3. Check date calculations với `differenceInDays`
4. Test với mock data có deadline gần

## 📝 Changelog

### Version 1.0.0 (2026-01-08)

**✨ Features**:
- ✅ Dynamic progress bar colors based on deadline proximity
- ✅ Timeline display (start date + deadline)
- ✅ Auto-alerts when progress is behind schedule
- ✅ Notification system for team members
- ✅ Toggle notifications on/off per project
- ✅ Red alert when near deadline with < 80% progress
- ✅ Project detail page with full information
- ✅ 404 error fixed - proper routing

**🎨 UI Updates**:
- Alert badges on project cards
- Color-coded progress bars
- Deadline countdown
- Notification settings card
- Responsive timeline display

**🐛 Bug Fixes**:
- ✅ Fixed 404 error when clicking projects
- ✅ TypeScript errors resolved
- ✅ Date handling with optional dates

---

Made with ❤️ for Golden Card ERP System
