# Hệ Thống Chấm Công Theo Dự Án

## Tổng Quan

Hệ thống chấm công linh hoạt theo chế độ làm việc, hỗ trợ quản lý nhân viên làm việc tại nhiều vị trí khác nhau:
- ✅ **Văn phòng cố định** - Nhân viên hành chính
- ✅ **Công tác lưu động** - Nhân viên sale, kinh doanh
- ✅ **Công trường xây dựng** - Kỹ sư, công nhân
- ✅ **Làm việc từ xa** - Remote workers

## 4 Chế Độ Làm Việc

### 1. 🏢 Văn Phòng (Office)
**Đối tượng:** Nhân viên hành chính, kế toán, HR
**Yêu cầu:**
- Check-in tại văn phòng công ty
- Vị trí cố định, không di chuyển
- Scan vị trí định kỳ: **mỗi 2-3 giờ**
- **Tự động hủy** nếu rời khỏi bán kính cho phép

**Quy trình:**
```
1. Nhân viên chọn "Văn Phòng"
2. Hệ thống check GPS trong phạm vi văn phòng
3. Check-in thành công
4. Mỗi 2-3 giờ scan lại vị trí
5. Nếu rời khỏi vị trí → Hủy check-in tự động
```

### 2. 🚗 Công Tác Lưu Động (Field Work)
**Đối tượng:** Nhân viên sale, kinh doanh, khảo sát
**Yêu cầu:**
- Bắt buộc nhập **mục đích và địa điểm** công tác
- Cho phép di chuyển tự do
- Scan vị trí định kỳ: **mỗi 4 giờ**
- Ghi nhận lịch sử di chuyển

**Quy trình:**
```
1. Nhân viên chọn "Công Tác Lưu Động"
2. Nhập mục đích: "Gặp khách hàng ABC tại TP.HCM"
3. Check-in thành công (không giới hạn vị trí)
4. Mỗi 4 giờ scan lại vị trí để tracking
5. Lịch sử di chuyển được lưu trữ
```

**Ví dụ lý do công tác:**
- "Gặp khách hàng ABC tại văn phòng TP.HCM"
- "Khảo sát địa điểm lắp đặt tại Bình Dương"
- "Họp với đối tác XYZ tại Hà Nội"

### 3. 🏗️ Công Trường Xây Dựng (Construction Site)
**Đối tượng:** Kỹ sư, công nhân xây dựng
**Yêu cầu:**
- **Phải được assign vào dự án** bởi trưởng dự án
- Check-in trong **bán kính 200m** từ địa điểm dự án
- Scan vị trí định kỳ: **mỗi 3 giờ**
- Tự động hủy nếu rời khỏi công trường

**Quy trình:**
```
1. Trưởng dự án setup dự án:
   - Tên dự án: "Nhà máy điện mặt trời 50MW Bình Dương"
   - Địa chỉ: "Khu công nghiệp Việt Hương, Bình Dương"
   - Đánh dấu vị trí trên bản đồ (GPS)
   - Bán kính: 200m
   - Assign thành viên vào dự án

2. Nhân viên check-in:
   - Chọn "Công Trường Xây Dựng"
   - Chọn dự án được assign
   - Hệ thống kiểm tra GPS trong bán kính 200m
   - Check-in thành công
   
3. Theo dõi tự động:
   - Mỗi 3 giờ scan lại vị trí
   - Nếu rời khỏi công trường → Hủy check-in
```

### 4. 🏠 Làm Việc Từ Xa (Remote)
**Đối tượng:** Developer, designer, nhân viên remote
**Yêu cầu:**
- **Không yêu cầu** kiểm tra vị trí
- **Không scan** định kỳ
- Chỉ ghi nhận thời gian check-in/check-out

**Quy trình:**
```
1. Nhân viên chọn "Làm Việc Từ Xa"
2. Check-in thành công ngay lập tức
3. Không tracking vị trí
4. Check-out khi kết thúc công việc
```

## Quản Lý Dự Án (Project Management)

### Vai Trò: Trưởng Dự Án (Project Manager)

**Quyền hạn:**
- ✅ Tạo dự án mới
- ✅ Setup địa điểm trên bản đồ
- ✅ Thêm/xóa thành viên
- ✅ Cập nhật thông tin dự án
- ✅ Xem lịch sử check-in của team

**Tạo Dự Án Mới:**
```typescript
Project Information:
- Mã dự án: GES-PROJECT-001 (tự động)
- Tên dự án: "Nhà máy điện mặt trời 50MW Bình Dương"
- Địa chỉ: "Khu công nghiệp Việt Hương, Bình Dương"
- Tọa độ GPS: 10.9804, 106.6519 (click trên map)
- Bán kính: 200m (mặc định)
- Trạng thái: Active / Planning / Completed
- Ngày bắt đầu: 01/01/2025
- Ngày kết thúc dự kiến: 31/12/2025
```

**Quản Lý Thành Viên:**
```
Thêm thành viên:
1. Chọn từ danh sách nhân viên
2. Chọn vai trò trong dự án:
   - Trưởng dự án
   - Kỹ sư
   - Công nhân
   - Điện công
   - Giám sát
3. Set ngày bắt đầu làm việc
4. Lưu

Xem danh sách thành viên:
- Tên nhân viên
- Mã NV
- Vai trò
- Trạng thái (Active/Inactive)
- Số ngày làm việc
- Tỷ lệ chấm công
```

### Vai Trò: Nhân Viên (Team Member)

**Quyền hạn:**
- ✅ Xem danh sách dự án được assign
- ✅ Check-in vào dự án đang hoạt động
- ✅ Xem lịch sử check-in của bản thân
- ❌ Không thể sửa thông tin dự án

**Check-in vào Dự Án:**
```
1. Mở màn hình chấm công
2. Chọn "Công Trường Xây Dựng"
3. Chọn dự án từ danh sách:
   ✅ GES-PROJECT-001 - Nhà máy điện mặt trời 50MW
      📍 Khu công nghiệp Việt Hương, Bình Dương
      👥 12 thành viên
      📏 Bán kính 200m
   
4. Nhấn "Check-in"
5. Hệ thống kiểm tra GPS:
   ✅ Trong bán kính 200m → Check-in thành công
   ❌ Ngoài bán kính → Hiện lỗi "Bạn không ở trong phạm vi dự án"
```

## Tần Suất Kiểm Tra Vị Trí

| Chế Độ | Tần Suất Scan | Hành Động Khi Rời Vị Trí |
|--------|---------------|--------------------------|
| Văn Phòng | 2-3 giờ | ❌ Tự động hủy check-in |
| Công Tác Lưu Động | 4 giờ | ✅ Ghi nhận vị trí mới |
| Công Trường | 3 giờ | ❌ Tự động hủy check-in |
| Remote | Không scan | - |

## Validation & Security

### Kiểm Tra Vị Trí GPS

**Công Thức Tính Khoảng Cách (Haversine):**
```javascript
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371e3 // Bán kính Trái Đất (mét)
  const φ1 = (lat1 * Math.PI) / 180
  const φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180
  const Δλ = ((lon2 - lon1) * Math.PI) / 180

  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c // Khoảng cách (mét)
}
```

**Validation Check-in:**
```javascript
// Construction Site Mode
if (workMode === 'construction_site') {
  const project = projects.find(p => p.id === selectedProjectId)
  const distance = calculateDistance(
    userLat, userLng,
    project.latitude, project.longitude
  )
  
  if (distance > project.radius) {
    throw new Error(`Bạn cách dự án ${distance}m, vượt quá bán kính ${project.radius}m`)
  }
}
```

### Bảo Mật & Quyền Hạn

**Phân quyền:**
- `project.create` - Tạo dự án mới (Trưởng dự án, Admin)
- `project.manage` - Quản lý thành viên (Trưởng dự án)
- `project.view` - Xem thông tin dự án (Tất cả thành viên)
- `attendance.checkin` - Check-in chấm công (Tất cả nhân viên)

**Kiểm tra quyền:**
```typescript
// Chỉ thành viên được assign mới check-in được
const canCheckIn = project.teamMembers.some(
  member => member.employeeId === currentUser.id && 
            member.isActive === true
)

if (!canCheckIn) {
  throw new Error('Bạn không có quyền check-in vào dự án này')
}
```

## Cấu Trúc Dữ Liệu

### ProjectLocation Interface

```typescript
interface ProjectLocation {
  id: string                      // "proj-001"
  projectCode: string             // "GES-PROJECT-001"
  projectName: string             // "Nhà máy điện mặt trời 50MW"
  address: string                 // Địa chỉ đầy đủ
  latitude: number                // 10.9804
  longitude: number               // 106.6519
  radius: number                  // 200 (mét)
  status: 'planning' | 'active' | 'completed'
  startDate: Date
  expectedEndDate?: Date
  actualEndDate?: Date
  description?: string
  createdBy: string              // Employee ID
  createdAt: Date
  updatedAt: Date
  teamMembers: ProjectMember[]   // Danh sách thành viên
}
```

### ProjectMember Interface

```typescript
interface ProjectMember {
  employeeId: string             // "emp-001"
  employeeName: string           // "Nguyen Van A"
  employeeCode: string           // "GES001"
  role: string                   // "engineer", "worker", etc.
  joinedDate: Date               // Ngày tham gia dự án
  leftDate?: Date                // Ngày rời dự án
  isActive: boolean              // Còn làm việc hay không
}
```

### AttendanceRecord với Project

```typescript
interface AttendanceRecord {
  id: string
  employeeId: string
  workMode: 'office' | 'field_work' | 'construction_site' | 'remote'
  workModeReason?: string        // Lý do công tác (field_work)
  projectId?: string             // ID dự án (construction_site)
  checkInTime: Date
  checkInLocation?: {
    latitude: number
    longitude: number
  }
  locationHistory: LocationCheck[] // Lịch sử scan vị trí
  status: 'present' | 'late' | 'cancelled'
}
```

## Components

### 1. ProjectLocationManager
**File:** `app/erp/modules/hrm/components/ProjectLocationManager.tsx`

**Chức năng:**
- Hiển thị danh sách dự án
- Form tạo/sửa dự án
- Quản lý thành viên
- Map selector

### 2. ProjectSelector
**File:** `app/erp/modules/hrm/components/AttendanceTracker.tsx`

**Chức năng:**
- Hiển thị dự án nhân viên được assign
- Chọn dự án khi check-in
- Hiển thị thông tin: tên, địa chỉ, bán kính, số thành viên

### 3. AttendanceTracker (Updated)
**File:** `app/erp/modules/hrm/components/AttendanceTracker.tsx`

**Cập nhật:**
- Thêm ProjectSelector vào WorkModeSelector
- Validate location cho construction_site mode
- Lưu projectId vào attendance record
- Periodic location check với interval khác nhau

## Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│                  TRƯỞNG DỰ ÁN                          │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  TẠO DỰ ÁN MỚI       │
              │  - Tên dự án          │
              │  - Địa điểm (GPS)     │
              │  - Bán kính 200m      │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  ASSIGN THÀNH VIÊN    │
              │  - Kỹ sư A, B         │
              │  - Công nhân C, D, E  │
              └───────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                    NHÂN VIÊN                            │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  MỞ APP CHẤM CÔNG     │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  CHỌN CHẾ ĐỘ          │
              │  ├─ Văn phòng         │
              │  ├─ Công tác          │
              │  ├─ Công trường ✓     │
              │  └─ Remote            │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  CHỌN DỰ ÁN          │
              │  (Chỉ dự án được      │
              │   assign hiển thị)    │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  KIỂM TRA GPS         │
              │  Distance = 150m      │
              │  ✓ < 200m → OK        │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  CHECK-IN THÀNH CÔNG  │
              │  🎉                   │
              └───────────────────────┘
                          │
                          ▼
              ┌───────────────────────┐
              │  PERIODIC SCAN        │
              │  Mỗi 3 giờ            │
              └───────────────────────┘
                          │
                    ┌─────┴─────┐
                    │           │
                    ▼           ▼
            ┌───────────┐  ┌───────────┐
            │  Trong    │  │  Ngoài    │
            │  phạm vi  │  │  phạm vi  │
            │  ✓ OK     │  │  ✗ HỦY    │
            └───────────┘  └───────────┘
```

## Testing Scenarios

### Test Case 1: Check-in Thành Công
```
Given: Nhân viên A được assign vào dự án X
And: Nhân viên A ở cách dự án 150m
When: Nhân viên A chọn dự án X và check-in
Then: Check-in thành công
And: Attendance record được tạo với projectId = X
```

### Test Case 2: Check-in Thất Bại - Quá Xa
```
Given: Nhân viên A được assign vào dự án X
And: Nhân viên A ở cách dự án 300m
When: Nhân viên A chọn dự án X và check-in
Then: Hiển thị lỗi "Bạn cách dự án 300m, vượt quá bán kính 200m"
And: Check-in thất bại
```

### Test Case 3: Check-in Thất Bại - Chưa Assign
```
Given: Nhân viên A KHÔNG được assign vào dự án Y
When: Nhân viên A cố gắng chọn dự án Y
Then: Dự án Y không hiển thị trong danh sách
And: Không thể check-in
```

### Test Case 4: Auto-Cancel Khi Rời Vị Trí
```
Given: Nhân viên A đã check-in vào dự án X
And: Periodic check sau 3 giờ
When: Nhân viên A ở cách dự án 250m
Then: Check-in tự động bị hủy
And: Thông báo cho nhân viên
```

## API Endpoints (Future Implementation)

### Projects API

```typescript
// Tạo dự án mới
POST /api/erp/hrm/projects
Body: {
  projectName: string
  address: string
  latitude: number
  longitude: number
  radius: number
  startDate: Date
}

// Lấy danh sách dự án
GET /api/erp/hrm/projects
Query: ?status=active&createdBy=emp-001

// Cập nhật dự án
PUT /api/erp/hrm/projects/:id
Body: { projectName, address, ... }

// Xóa dự án
DELETE /api/erp/hrm/projects/:id
```

### Team Members API

```typescript
// Thêm thành viên
POST /api/erp/hrm/projects/:id/members
Body: {
  employeeId: string
  role: string
}

// Xóa thành viên
DELETE /api/erp/hrm/projects/:id/members/:employeeId

// Lấy dự án của nhân viên
GET /api/erp/hrm/employees/:id/projects
Query: ?status=active
```

### Attendance API

```typescript
// Check-in với project
POST /api/erp/hrm/attendance/checkin
Body: {
  workMode: 'construction_site'
  projectId: 'proj-001'
  location: { latitude, longitude }
}

// Location check
POST /api/erp/hrm/attendance/:id/location-check
Body: {
  location: { latitude, longitude }
}
```

## Roadmap

### Phase 1: Core Features (Current) ✅
- [x] 4 work modes
- [x] Project location management
- [x] Project team member assignment
- [x] GPS validation
- [x] Periodic location check
- [x] Auto-cancel on location violation

### Phase 2: Enhanced Features 🚧
- [ ] Map visualization
- [ ] Real-time tracking
- [ ] Push notifications
- [ ] Offline mode
- [ ] Photo upload at check-in
- [ ] Weather integration

### Phase 3: Advanced Analytics 📊
- [ ] Project attendance reports
- [ ] Team productivity dashboard
- [ ] Location heatmap
- [ ] Anomaly detection
- [ ] Predictive analytics

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Author:** Golden Energy Solutions Development Team
