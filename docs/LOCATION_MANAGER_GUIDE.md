# Hệ Thống Quản Lý Địa Điểm Check-in

## 📍 Tổng Quan

Hệ thống quản lý địa điểm check-in như **WiFi Manager trên iPhone** - cho phép lãnh đạo và quản lý tạo, bật/tắt, forget địa điểm check-in một cách linh hoạt.

## 🎯 Tính Năng Chính

### 1. Quản Lý Địa Điểm (Location Manager)

#### Tạo Địa Điểm Mới
**Ai có quyền:**
- Ban Giám Đốc (CEO, CFO, COO)
- Quản lý dự án (Project Manager)
- Trưởng phòng (Department Head)

**Các Loại Địa Điểm:**

| Loại | Mô Tả | Ví Dụ | Icon |
|------|-------|-------|------|
| 🏢 Văn phòng | Văn phòng công ty cố định | Văn phòng HCM, Văn phòng HN | Building2 |
| 🏗️ Công trường | Địa điểm thi công dự án | Nhà máy Bình Dương, Dự án Đồng Nai | HardHat |
| 📍 Task Location | Địa điểm thực hiện task cụ thể | Khách hàng ABC, Nhà máy XYZ | MapPin |
| 📅 Sự kiện | Họp, hội thảo, sự kiện | Hội nghị khách hàng, Họp Q1 | Calendar |
| ✈️ Công tác | Chuyến công tác xa | Khảo sát Hà Nội, Gặp đối tác Đà Nẵng | Plane |
| 🎉 Team Building | Hoạt động team building | Resort Vũng Tàu, Du lịch Đà Lạt | Users |

#### Thông Tin Địa Điểm

```typescript
{
  locationName: "Nhà máy điện mặt trời Bình Dương"
  locationType: "project_site"
  address: "KCN Việt Hương, Bình Dương"
  latitude: 10.9804
  longitude: 106.6519
  radius: 200 // meters
  status: "active" | "disabled" | "archived"
  
  // Settings
  allowCheckOut: true        // Cho phép checkout tại đây
  requirePhoto: false        // Yêu cầu chụp ảnh
  
  // Permissions
  allowedEmployees: []       // Rỗng = tất cả nhân viên
  allowedDepartments: []     // Rỗng = tất cả phòng ban
  
  // Tracking
  usageCount: 340           // Số lần đã check-in
  lastUsedDate: "2026-01-09"
  createdBy: "Rita Kim Anh"
}
```

### 2. Trạng Thái Địa Điểm (Status)

#### ✅ Active (Đang bật)
- Hiển thị trong danh sách check-in
- Nhân viên có thể check-in/out
- Đang được sử dụng

#### ⏸️ Disabled (Đã tắt)
- Tạm thời ẩn khỏi danh sách
- Không thể check-in
- Có thể bật lại bất cứ lúc nào
- **Giống "Quên mạng WiFi" trên iPhone**

#### 📦 Archived (Đã forget)
- Lưu trữ vĩnh viễn
- Không hiển thị trong danh sách
- Không thể bật lại (phải tạo mới)
- Giữ lại lịch sử để báo cáo
- **Giống "Forget this network" trên iPhone**

### 3. Quản Lý Danh Sách

```
┌─────────────────────────────────────────────────┐
│  Quản Lý Địa Điểm Check-in                      │
│  Giống như WiFi Manager trên iPhone             │
└─────────────────────────────────────────────────┘

┌─────────┬─────────┬─────────┬─────────┐
│  Tổng   │ Đang    │  Đã     │  Đã     │
│   12    │  bật 8  │ tắt 3   │forget 1 │
└─────────┴─────────┴─────────┴─────────┘

[Tìm kiếm địa điểm...] [+ Tạo địa điểm mới]

┌─────────────────────────────────────┐
│ 🏢 Văn phòng Golden Energy HCM      │
│ [GES-LOC-001] [✅ Active] [Văn phòng]│
│ 📍 123 Nguyễn Văn Linh, Q7, HCM    │
│                                     │
│ Đã dùng: 1250 | Bán kính: 200m     │
│ Dùng lần cuối: 09/01/2026          │
│                                     │
│ Tạo bởi: Jimmy Ha                  │
│ Tạo lúc: 01/01/2025                │
│                                     │
│ [✏️ Sửa] [⏸️ Tắt] [🗑️ Forget]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🏗️ Nhà máy điện mặt trời BD        │
│ [GES-LOC-002] [✅ Active] [Công trường]│
│ 📍 KCN Việt Hương, Bình Dương      │
│                                     │
│ Đã dùng: 340 | Bán kính: 300m      │
│ Yêu cầu chụp ảnh ✅                 │
│                                     │
│ [✏️ Sửa] [⏸️ Tắt] [🗑️ Forget]      │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ 🎉 Team Building Vũng Tàu           │
│ [GES-LOC-003] [⏸️ Disabled] [Team Building]│
│ 📍 Resort Sunrise, Vũng Tàu        │
│                                     │
│ Đã dùng: 45 | Bán kính: 500m       │
│ Dùng lần cuối: 20/12/2025          │
│                                     │
│ [✏️ Sửa] [▶️ Bật] [🗑️ Forget]      │
└─────────────────────────────────────┘
```

## 🔄 Use Cases

### Case 1: Business Trip Cả Công Ty

**Tình huống:** Toàn công ty đi công tác Hà Nội 3 ngày

**Bước 1: Tạo địa điểm**
```
CEO tạo địa điểm mới:
- Tên: "Công tác Hà Nội - Q1 2026"
- Loại: Business Trip
- Địa chỉ: "Khách sạn Melia, Hà Nội"
- GPS: Click map hoặc lấy vị trí hiện tại
- Bán kính: 500m (vì khách sạn lớn)
- Cho phép checkout: Yes
- Áp dụng cho: Tất cả nhân viên
```

**Bước 2: Nhân viên check-in**
```
Sáng 10/01/2026:
- Mở app chấm công
- Thấy địa điểm "Công tác Hà Nội - Q1 2026" ở đầu list
- Click chọn → Check-in thành công
- Không cần check-in tại văn phòng HCM
```

**Bước 3: Sau khi kết thúc**
```
Chiều 13/01/2026:
- CEO: Tắt địa điểm (Disable)
- Hoặc: Forget luôn nếu không dùng nữa
- Nhân viên quay lại check-in tại văn phòng HCM
```

### Case 2: Team Building

**Tình huống:** Phòng kinh doanh đi team building Vũng Tàu

**Setup:**
```
Trưởng phòng kinh doanh:
- Tạo địa điểm "Team Building Vũng Tàu 2026"
- Loại: Teambuilding
- Bán kính: 500m (khu resort rộng)
- Áp dụng cho: Chỉ phòng Kinh Doanh
- Ngày: 15-16/01/2026
```

**Check-in:**
```
Nhân viên phòng Kinh Doanh:
- Thấy địa điểm team building trong list
- Check-in tại resort

Nhân viên phòng khác:
- Không thấy địa điểm team building
- Vẫn check-in tại văn phòng như bình thường
```

### Case 3: Task Địa Điểm Xa

**Tình huống:** Kỹ sư cần khảo sát địa điểm thi công mới

**Setup:**
```
Project Manager:
- Tạo task "Khảo sát địa điểm Đồng Nai"
- Yêu cầu vị trí: Yes
- Tạo địa điểm check-in:
  - Tên: "Khu đất dự án Đồng Nai"
  - Loại: Task Location
  - GPS: Đánh dấu trên map
  - Bán kính: 200m
  - Áp dụng cho: Chỉ kỹ sư được assign task
```

**Execution:**
```
Kỹ sư:
1. Nhận task
2. Thấy địa điểm check-in trong task details
3. Đến Đồng Nai
4. Check-in tại địa điểm dự án
5. Thực hiện khảo sát
6. Check-out khi xong
7. Task tự động ghi nhận địa điểm và thời gian
```

## 🚗 Auto-Detect Travel Mode

### Logic Tự Động Phát Hiện

**Điều kiện kích hoạt Travel Mode:**
```javascript
// Check every 30 seconds
const isTraveling = 
  speed > 5 m/s (18 km/h) &&
  distance > 500 meters &&
  continuous movement for 5+ minutes
```

**Khi phát hiện Travel Mode:**
```
1. Hiển thị badge "🚗 Đang di chuyển"
2. Không yêu cầu check-in/out liên tục
3. Track vị trí real-time để tính quãng đường
4. Hiển thị:
   - Quãng đường: 15km
   - Tốc độ: 45 km/h
   - Thời gian: 2h 30p
```

**Khi kết thúc Travel Mode:**
```
Nếu:
- Dừng di chuyển > 10 phút
- Tốc độ < 5 m/s
- Đã có > 5 điểm GPS trong lịch sử

Thì:
→ Tự động hoàn thành ngày làm việc
→ Ghi nhận: "Công tác di chuyển - Auto-completed"
→ Không cần check-out thủ công
```

### Ví Dụ Travel Mode

```
Timeline của 1 ngày công tác:

08:00 - Check-in tại "Công tác Hà Nội"
08:15 - Bắt đầu di chuyển (xe đến địa điểm 1)
08:45 - Đến địa điểm 1, dừng 1h
09:45 - Di chuyển đến địa điểm 2
10:30 - Đến địa điểm 2, dừng 2h
12:30 - Ăn trưa, di chuyển
14:00 - Đến địa điểm 3
16:30 - Di chuyển về khách sạn
17:30 - Về đến khách sạn

Hệ thống:
✅ Tự động detect 4 lần di chuyển
✅ Track toàn bộ quãng đường: 35km
✅ Thời gian làm việc: 9.5 giờ
✅ Tự động check-out lúc 17:30
✅ Ghi nhận: "Công tác thành công - Auto-completed"
```

## 📱 Flexible Check-out

### Check-out Locations

**Rule:** Nhân viên có thể check-out tại **bất kỳ địa điểm active nào** có setting `allowCheckOut: true`

**Ví dụ:**
```
Sáng check-in tại: Văn phòng HCM
Chiều check-out tại:
  ✅ Văn phòng HCM (địa điểm check-in)
  ✅ Công trường Bình Dương (active, allow checkout)
  ✅ Khách hàng ABC (active, allow checkout)
  ❌ Team Building Vũng Tàu (disabled)
```

### Use Case: Công tác liên tục

```
Nhân viên sale:
08:00 - Check-in tại văn phòng HCM
09:00 - Đi gặp khách hàng A (Quận 1)
11:00 - Đi gặp khách hàng B (Quận 7)
14:00 - Đi khảo sát địa điểm C (Bình Dương)
17:00 - Check-out tại Bình Dương
       (Không cần về văn phòng HCM)

Lịch sử vị trí:
📍 08:00 - Văn phòng HCM
📍 09:00 - Quận 1 (25km)
📍 11:00 - Quận 7 (15km)
📍 14:00 - Bình Dương (30km)
📍 17:00 - Check-out Bình Dương

Tổng quãng đường: 70km
Travel mode: Auto-detected ✅
```

## 🗺️ Real-Time Location Tracking

### Your Location (như Google Maps)

```
┌─────────────────────────────────────┐
│ 📍 Vị Trí Real-time                 │
│ Cập nhật liên tục như Google Maps   │
├─────────────────────────────────────┤
│                                     │
│ [🧭] Your Location                  │
│                                     │
│ 10.980421, 106.651923               │
│ Độ chính xác: ±15m                  │
│                                     │
│ ┌─────┬─────┬─────┐                │
│ │ 2.5km│ 45  │ 35m │                │
│ │ Đường│km/h │Thời│                │
│ └─────┴─────┴─────┘                │
│                                     │
│ ⚠️ Đang di chuyển - Travel Mode     │
│                                     │
│ Đã ghi nhận 48 điểm vị trí          │
└─────────────────────────────────────┘
```

### Map View

**Hiển thị trên map:**
1. 🔵 Vị trí hiện tại (Your Location) - real-time
2. 🟢 Các địa điểm check-in active - với bán kính
3. ⚪ Các địa điểm disabled - mờ đi
4. 🔴 Lịch sử di chuyển - đường đi
5. 📍 Điểm check-in/out - markers

## 🔐 Permissions & Security

### Quyền Tạo Địa Điểm

| Vai Trò | Quyền |
|---------|-------|
| CEO/COO | Tạo mọi loại địa điểm, áp dụng cho toàn công ty |
| CFO | Tạo địa điểm business trip, event |
| Project Manager | Tạo project_site, task_location cho dự án |
| Department Head | Tạo địa điểm cho phòng ban mình |
| HR Manager | Tạo địa điểm event, teambuilding |
| Employee | Không có quyền tạo |

### Location Privacy

**GPS Data:**
- Chỉ track khi nhân viên checked-in
- Dừng track khi checked-out
- Encrypt GPS coordinates in transit
- Store location history with retention policy (90 days)

**Who can see:**
- Nhân viên: Xem lịch sử của chính mình
- Manager: Xem lịch sử team members
- HR: Xem tất cả
- Admin: Full access

## 📊 Reports & Analytics

### Location Usage Report

```
Top 5 Địa Điểm Được Dùng Nhiều Nhất (Tháng 1/2026):

1. Văn phòng HCM           1,250 lần
2. Công trường Bình Dương    340 lần
3. Văn phòng Hà Nội          180 lần
4. Khách hàng ABC            120 lần
5. Team Building Vũng Tàu     45 lần
```

### Travel Mode Statistics

```
Thống Kê Di Chuyển Công Tác (Tháng 1/2026):

Tổng nhân viên có travel mode: 35
Tổng quãng đường:              2,450 km
Trung bình/người:              70 km
Thời gian di chuyển:           145 giờ
Auto-completed workdays:       128 ngày
```

## 🛠️ API Endpoints

```typescript
// Create location
POST /api/erp/hrm/locations
Body: CheckInLocation

// List locations
GET /api/erp/hrm/locations?status=active&type=office

// Update location
PUT /api/erp/hrm/locations/:id
Body: Partial<CheckInLocation>

// Toggle status
PATCH /api/erp/hrm/locations/:id/toggle
Body: { status: 'active' | 'disabled' }

// Archive (forget)
DELETE /api/erp/hrm/locations/:id

// Get location usage
GET /api/erp/hrm/locations/:id/usage

// Check-in at location
POST /api/erp/hrm/attendance/checkin
Body: {
  locationId: string
  latitude: number
  longitude: number
  photo?: string
}

// Real-time location update
POST /api/erp/hrm/attendance/:id/location
Body: LocationCheckHistory
```

---

**Document Version:** 1.0  
**Last Updated:** 2026-01-09  
**Author:** Golden Energy Solutions Development Team
