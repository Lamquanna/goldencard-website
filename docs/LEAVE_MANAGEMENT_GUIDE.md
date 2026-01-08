# HỆ THỐNG QUẢN LÝ NGHỈ PHÉP (LEAVE MANAGEMENT SYSTEM)

## 📋 Tổng quan

Hệ thống quản lý nghỉ phép hoàn chỉnh cho ERP Golden Card, hỗ trợ:
- ✅ Xin nghỉ phép với màu sắc rõ ràng (vàng)
- ✅ Duyệt/từ chối với màu xanh/đỏ
- ✅ Hiển thị số ngày nghỉ còn lại chi tiết
- ✅ Xem lịch sử nghỉ phép của nhân viên khác
- ✅ Phát hiện xung đột dự án tự động
- ✅ Cảnh báo khi duyệt nghỉ phép trùng dự án

## 🎨 Màu sắc nút

```typescript
// Xin nghỉ phép
className="bg-yellow-500 hover:bg-yellow-600 text-white"

// Duyệt đơn
className="bg-green-600 hover:bg-green-700 text-white"

// Từ chối đơn
className="bg-red-600 hover:bg-red-700 text-white"
```

## 🗄️ Cài đặt Database

### Bước 1: Chạy migration

```bash
# Kết nối đến PostgreSQL database
psql -h <database-host> -U <username> -d <database-name>

# Chạy migration script
\i database/migrations/create_leave_tables.sql
```

### Bước 2: Kiểm tra tables đã được tạo

```sql
-- Xem danh sách tables
SELECT tablename FROM pg_tables WHERE tablename IN ('leave_requests', 'leave_balances');

-- Xem số lượng records
SELECT COUNT(*) FROM leave_balances;
SELECT COUNT(*) FROM leave_requests;
```

## 📊 Cấu trúc Database

### Table: `leave_balances`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| employee_id | VARCHAR(50) | Mã nhân viên (FK to erp_users) |
| year | INTEGER | Năm (default: năm hiện tại) |
| annual_total | INTEGER | Tổng phép năm (default: 12) |
| annual_used | INTEGER | Đã dùng phép năm |
| annual_remaining | INTEGER | Còn lại phép năm (computed) |
| sick_total | INTEGER | Tổng nghỉ ốm (default: 30) |
| sick_used | INTEGER | Đã dùng nghỉ ốm |
| sick_remaining | INTEGER | Còn lại nghỉ ốm (computed) |
| unpaid_used | INTEGER | Đã dùng không lương |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

### Table: `leave_requests`

| Column | Type | Description |
|--------|------|-------------|
| id | SERIAL | Primary key |
| employee_id | VARCHAR(50) | Mã nhân viên (FK to erp_users) |
| leave_type | VARCHAR(20) | Loại nghỉ: 'annual', 'sick', 'unpaid' |
| start_date | DATE | Ngày bắt đầu |
| end_date | DATE | Ngày kết thúc |
| total_days | INTEGER | Tổng số ngày (working days) |
| reason | TEXT | Lý do nghỉ |
| status | VARCHAR(20) | Trạng thái: 'pending', 'approved', 'rejected', 'cancelled' |
| approved_by | VARCHAR(50) | Người duyệt (FK to erp_users) |
| approved_at | TIMESTAMP | Thời gian duyệt |
| reject_reason | TEXT | Lý do từ chối |
| created_at | TIMESTAMP | Ngày tạo |
| updated_at | TIMESTAMP | Ngày cập nhật |

## 🔌 API Endpoints

### 1. Lấy danh sách nghỉ phép

```typescript
GET /api/erp/hrm/leaves

// Query parameters
?employeeId=EMP001    // Filter by employee
?status=pending       // Filter by status (pending, approved, rejected, cancelled)
?year=2026           // Filter by year
?type=annual         // Filter by type (annual, sick, unpaid)

// Response
{
  success: true,
  data: [
    {
      id: "1",
      employeeId: "EMP001",
      employee_name: "Nguyen Van A",
      employee_code: "EMP001",
      department: "IT",
      type: "annual",
      startDate: "2026-02-10",
      endDate: "2026-02-14",
      totalDays: 5,
      reason: "Nghỉ tết",
      status: "pending",
      createdAt: "2026-01-20T10:00:00Z"
    }
  ]
}
```

### 2. Tạo đơn nghỉ phép mới

```typescript
POST /api/erp/hrm/leaves

// Request body
{
  employeeId: "EMP001",
  leaveType: "annual",
  startDate: "2026-02-10",
  endDate: "2026-02-14",
  totalDays: 5,
  reason: "Nghỉ tết"
}

// Response (nếu có xung đột dự án)
{
  success: true,
  data: { id: "1", ... },
  warnings: {
    hasProjectConflict: true,
    projects: [
      {
        project_name: "Website Redesign",
        start_date: "2026-02-01",
        end_date: "2026-02-28"
      }
    ]
  }
}
```

### 3. Duyệt/từ chối/hủy đơn

```typescript
PUT /api/erp/hrm/leaves/:id

// Duyệt đơn
{
  action: "approve",
  approverId: "MGR001"
}

// Từ chối đơn
{
  action: "reject",
  approverId: "MGR001",
  rejectReason: "Thời gian không phù hợp"
}

// Hủy đơn (chỉ người tạo)
{
  action: "cancel"
}

// Response
{
  success: true,
  data: { id: "1", status: "approved", ... }
}
```

### 4. Xóa đơn (chỉ status pending)

```typescript
DELETE /api/erp/hrm/leaves/:id

// Response
{
  success: true,
  message: "Đã xóa đơn nghỉ phép"
}
```

### 5. Lấy số dư nghỉ phép

```typescript
GET /api/erp/hrm/leaves/balance

// Query parameters
?employeeId=EMP001    // Lấy balance của 1 nhân viên (optional)

// Response - Single employee
{
  success: true,
  data: {
    id: "1",
    employeeId: "EMP001",
    year: 2026,
    annualTotal: 12,
    annualUsed: 3,
    annualRemaining: 9,
    sickTotal: 30,
    sickUsed: 2,
    sickRemaining: 28,
    unpaidUsed: 0
  }
}

// Response - All employees (khi không có employeeId)
{
  success: true,
  data: [
    {
      id: "1",
      employeeId: "EMP001",
      full_name: "Nguyen Van A",
      employee_code: "EMP001",
      department: "IT",
      year: 2026,
      annualTotal: 12,
      annualUsed: 3,
      annualRemaining: 9,
      ...
    }
  ]
}
```

## 🎯 Sử dụng Component

### Tích hợp vào trang HRM

```tsx
import { LeaveManagementEnhanced } from './components/LeaveManagementEnhanced'

export default function LeavePage() {
  const user = getAuthUser() // Lấy thông tin user hiện tại
  
  return (
    <LeaveManagementEnhanced 
      employeeId={user.employee_id}
      isManager={user.role === 'manager' || user.role === 'admin'}
    />
  )
}
```

### Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| employeeId | string | Yes | Mã nhân viên đang đăng nhập |
| isManager | boolean | No | Có phải manager/admin không (hiển thị tab duyệt đơn) |

## 🎨 Tính năng UI

### 1. Tab "Nghỉ phép của tôi"
- **Nút "Xin nghỉ phép"**: Màu vàng (bg-yellow-500)
- **Card số dư nghỉ phép**: Hiển thị 3 loại phép với progress bar
  - Phép năm (xanh dương)
  - Nghỉ ốm (đỏ)
  - Không lương (xám)
- **Lịch sử nghỉ phép**: List tất cả đơn đã tạo với badge trạng thái

### 2. Tab "Chờ duyệt" (Manager only)
- Card màu vàng nhạt
- Hiển thị thông tin nhân viên, thời gian, lý do
- **Nút "Duyệt"**: Màu xanh (bg-green-600)
- **Nút "Từ chối"**: Màu đỏ (bg-red-600)
- Tự động check xung đột dự án khi duyệt

### 3. Tab "Tất cả nhân viên" (Manager only)
- Grid hiển thị card số dư của tất cả nhân viên
- Có thanh tìm kiếm
- Click vào card → mở modal xem lịch sử nghỉ phép

### 4. Dialog xin nghỉ phép
- Chọn loại nghỉ
- Chọn từ ngày - đến ngày
- Tự động tính số ngày làm việc (bỏ thứ 7, CN)
- Nhập lý do
- **Cảnh báo xung đột dự án**: Nếu trùng dự án → hiện alert màu đỏ
  - List các dự án bị trùng
  - Yêu cầu xác nhận mới gửi

### 5. Dialog lịch sử nhân viên
- Hiển thị 3 card số dư (phép năm, ốm, không lương)
- Timeline tất cả đơn nghỉ phép
- Badge màu theo loại và trạng thái

## ⚠️ Xung đột dự án (Project Conflict Detection)

### Cách hoạt động

1. **Khi nhân viên xin nghỉ**:
   - API check `projects` table
   - Tìm các dự án có `status = 'active'`
   - Join với `project_members` để check nhân viên có trong dự án
   - So sánh ngày nghỉ với ngày dự án
   - Trả về `warnings.hasProjectConflict = true` nếu trùng

2. **UI hiển thị**:
   - Alert màu đỏ với icon cảnh báo
   - List các dự án bị trùng (tên + thời gian)
   - Nút "Quay lại" để sửa ngày
   - Nút "Xác nhận và gửi" để tiếp tục

3. **Khi manager duyệt**:
   - API cũng check lại xung đột
   - Hiển thị badge cảnh báo trong approval card
   - Manager biết nhân viên đang có dự án
   - Vẫn có thể duyệt nếu cần thiết

### SQL Query

```sql
SELECT p.project_name, p.start_date, p.end_date
FROM projects p
JOIN project_members pm ON p.id = pm.project_id
WHERE pm.employee_id = $1
  AND p.status = 'active'
  AND p.start_date <= $3  -- leave end date
  AND p.end_date >= $2    -- leave start date
```

## 📅 Tính toán ngày nghỉ

### Hàm calculateLeaveDays

```typescript
function calculateLeaveDays(
  startDate: Date,
  endDate: Date,
  excludeWeekends: boolean = true
): number {
  let days = 0
  const current = new Date(startDate)
  const end = new Date(endDate)

  while (current <= end) {
    // Bỏ qua thứ 7 (6) và chủ nhật (0)
    if (!excludeWeekends || (current.getDay() !== 0 && current.getDay() !== 6)) {
      days++
    }
    current.setDate(current.getDate() + 1)
  }

  return days
}
```

### Ví dụ

```typescript
// Từ 10/02/2026 (Thứ 2) đến 14/02/2026 (Thứ 6)
const days = calculateLeaveDays(new Date('2026-02-10'), new Date('2026-02-14'))
console.log(days) // 5 ngày (không tính thứ 7, CN)
```

## 🔒 Phân quyền

### Employee (Nhân viên)
- ✅ Xem số dư nghỉ phép của mình
- ✅ Xem lịch sử nghỉ phép của mình
- ✅ Tạo đơn nghỉ phép mới
- ✅ Hủy đơn nghỉ phép (chỉ status = pending)
- ❌ Không xem được thông tin nhân viên khác
- ❌ Không duyệt/từ chối đơn

### Manager / Admin
- ✅ Tất cả quyền của Employee
- ✅ Xem số dư nghỉ phép của tất cả nhân viên
- ✅ Xem lịch sử nghỉ phép của tất cả nhân viên
- ✅ Duyệt đơn nghỉ phép
- ✅ Từ chối đơn nghỉ phép (có ghi lý do)
- ✅ Xem cảnh báo xung đột dự án khi duyệt

## 🧪 Testing

### Test case 1: Xin nghỉ phép bình thường

1. Login với employee account
2. Vào tab "Nghỉ phép của tôi"
3. Click nút **"Xin nghỉ phép"** (màu vàng)
4. Chọn loại: Phép năm
5. Chọn ngày: 10/02/2026 - 14/02/2026
6. Nhập lý do: "Nghỉ tết"
7. Click "Gửi đơn"
8. ✅ Thành công: Hiển thị alert "Đơn nghỉ phép đã được gửi!"
9. ✅ Đơn mới xuất hiện trong lịch sử với badge "Chờ duyệt" (màu vàng)

### Test case 2: Xung đột dự án

1. Tạo project với thời gian 01/02/2026 - 28/02/2026
2. Thêm nhân viên vào project
3. Nhân viên xin nghỉ 10/02/2026 - 14/02/2026
4. ✅ Hiển thị alert đỏ: "Cảnh báo xung đột dự án"
5. ✅ List tên dự án và thời gian
6. Click "Xác nhận và gửi"
7. ✅ Đơn vẫn được tạo (với warning flag)

### Test case 3: Manager duyệt đơn

1. Login với manager account
2. Vào tab "Chờ duyệt"
3. Thấy đơn nghỉ phép pending
4. Click nút **"Duyệt"** (màu xanh)
5. Nếu có xung đột dự án → hiển thị cảnh báo
6. Click "Xác nhận"
7. ✅ Đơn chuyển status = "approved"
8. ✅ Leave balance của nhân viên tự động trừ

### Test case 4: Xem lịch sử nhân viên khác

1. Login với manager
2. Vào tab "Tất cả nhân viên"
3. Thấy grid các card nhân viên
4. Click vào 1 card
5. ✅ Mở modal hiển thị:
   - Số dư nghỉ phép (3 loại)
   - List tất cả đơn nghỉ phép
   - Badge trạng thái

## 🐛 Troubleshooting

### Lỗi: "Cannot read properties of undefined"

**Nguyên nhân**: Tables chưa được tạo hoặc không có data

**Giải pháp**:
```sql
-- Check tables exist
SELECT * FROM leave_balances LIMIT 1;
SELECT * FROM leave_requests LIMIT 1;

-- Create balance if missing
INSERT INTO leave_balances (employee_id, year, annual_total, annual_used, sick_total, sick_used, unpaid_used)
VALUES ('EMP001', 2026, 12, 0, 30, 0, 0)
ON CONFLICT (employee_id, year) DO NOTHING;
```

### Lỗi: "Số ngày phép còn lại không đủ"

**Nguyên nhân**: annual_remaining < totalDays

**Giải pháp**: 
- Tăng annual_total hoặc
- Giảm annual_used hoặc
- Chọn loại "Không lương" thay vì "Phép năm"

### Lỗi: API trả về 500

**Check**:
1. Database connection string đúng chưa
2. Tables và columns có đúng tên không
3. Foreign keys có tồn tại không (erp_users.employee_id)
4. Check console log để xem SQL error

## 📝 Changelog

### Version 1.0.0 (2026-01-20)

**✨ Features**:
- ✅ Complete leave management system
- ✅ Color-coded buttons (yellow/green/red)
- ✅ Personal leave balance tracking
- ✅ View all employees' leave records
- ✅ Employee leave history modal
- ✅ Project conflict detection
- ✅ Manager approval workflow
- ✅ Working days calculation (exclude weekends)
- ✅ 3 leave types: annual, sick, unpaid
- ✅ 4 leave statuses: pending, approved, rejected, cancelled
- ✅ Real-time balance updates
- ✅ Responsive UI with animations

**📦 Database**:
- ✅ leave_requests table with indexes
- ✅ leave_balances table with computed columns
- ✅ Views for detailed queries
- ✅ Row-level security policies
- ✅ Auto-update triggers

**🔌 API**:
- ✅ GET /api/erp/hrm/leaves - List with filters
- ✅ POST /api/erp/hrm/leaves - Create with conflict check
- ✅ PUT /api/erp/hrm/leaves/:id - Approve/reject/cancel
- ✅ DELETE /api/erp/hrm/leaves/:id - Delete pending
- ✅ GET /api/erp/hrm/leaves/balance - Get balances

## 🤝 Support

Nếu có vấn đề hoặc câu hỏi:
1. Check database connection
2. Check API responses trong Network tab
3. Check console.log errors
4. Verify tables exist and have correct schema
5. Test với sample data

## 📄 License

MIT License - Golden Card ERP System
