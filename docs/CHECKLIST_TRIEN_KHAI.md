# Checklist Triển Khai Hệ Thống Chấm Công Dự Án

## 📋 Pre-Deployment Checklist

### 1. Code Review ✅
- [x] AttendanceTracker.tsx updated
- [x] ProjectLocationManager.tsx created
- [x] Work mode types defined
- [x] GPS validation implemented
- [x] No TypeScript errors
- [x] No ESLint warnings

### 2. Database Setup 🔄
- [ ] Create `projects` table
  ```sql
  CREATE TABLE projects (
    id VARCHAR(50) PRIMARY KEY,
    project_code VARCHAR(50) UNIQUE NOT NULL,
    project_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius INTEGER DEFAULT 200,
    status VARCHAR(20) DEFAULT 'active',
    start_date TIMESTAMP NOT NULL,
    expected_end_date TIMESTAMP,
    actual_end_date TIMESTAMP,
    description TEXT,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
  ```

- [ ] Create `project_members` table
  ```sql
  CREATE TABLE project_members (
    id VARCHAR(50) PRIMARY KEY,
    project_id VARCHAR(50) NOT NULL,
    employee_id VARCHAR(50) NOT NULL,
    employee_name VARCHAR(255) NOT NULL,
    employee_code VARCHAR(50) NOT NULL,
    role VARCHAR(100),
    joined_date TIMESTAMP NOT NULL,
    left_date TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
  );
  ```

- [ ] Update `attendance_records` table
  ```sql
  ALTER TABLE attendance_records
  ADD COLUMN work_mode VARCHAR(30),
  ADD COLUMN work_mode_reason TEXT,
  ADD COLUMN project_id VARCHAR(50),
  ADD COLUMN check_in_latitude DECIMAL(10, 8),
  ADD COLUMN check_in_longitude DECIMAL(11, 8),
  ADD COLUMN location_history JSONB;
  
  CREATE INDEX idx_attendance_work_mode ON attendance_records(work_mode);
  CREATE INDEX idx_attendance_project_id ON attendance_records(project_id);
  ```

### 3. API Endpoints 🔄
- [ ] POST `/api/erp/hrm/projects` - Create project
- [ ] GET `/api/erp/hrm/projects` - List projects
- [ ] GET `/api/erp/hrm/projects/:id` - Get project details
- [ ] PUT `/api/erp/hrm/projects/:id` - Update project
- [ ] DELETE `/api/erp/hrm/projects/:id` - Delete project
- [ ] POST `/api/erp/hrm/projects/:id/members` - Add member
- [ ] DELETE `/api/erp/hrm/projects/:id/members/:employeeId` - Remove member
- [ ] GET `/api/erp/hrm/employees/:id/projects` - Get employee projects
- [ ] POST `/api/erp/hrm/attendance/checkin` - Check-in with project
- [ ] POST `/api/erp/hrm/attendance/:id/location-check` - Periodic location check

### 4. Employee Accounts ✅
- [x] 12 employee accounts created in Firebase
- [x] Default password set to "1"
- [x] Mandatory password change enabled
- [x] Admin account configured

### 5. Permissions & Roles 🔄
- [ ] `hrm.project.create` - Create projects
- [ ] `hrm.project.manage` - Manage team members
- [ ] `hrm.project.view` - View projects
- [ ] `hrm.attendance.checkin` - Check-in
- [ ] Assign roles to users:
  - Admin: All permissions
  - Project Manager: create, manage, view
  - HR Manager: view, attendance
  - Employee: attendance only

### 6. Documentation ✅
- [x] Technical documentation (HE_THONG_CHAM_CONG_DU_AN.md)
- [x] User guide (HUONG_DAN_CHAM_CONG_NHANH.md)
- [x] Login guide (HUONG_DAN_DANG_NHAP.md)
- [x] Account list (DANH_SACH_TAI_KHOAN.md)
- [x] Summary (TOM_TAT_CAP_NHAT_CHAM_CONG.md)

### 7. Testing 🔄

#### Unit Tests:
- [ ] Test calculateDistance function
- [ ] Test validateLocationForProject
- [ ] Test work mode selection
- [ ] Test project member validation

#### Integration Tests:
- [ ] Test office mode check-in
- [ ] Test field work mode check-in
- [ ] Test construction site mode check-in
- [ ] Test remote mode check-in
- [ ] Test project creation
- [ ] Test team member assignment
- [ ] Test GPS validation
- [ ] Test auto-cancel on location violation

#### User Acceptance Tests:
- [ ] Admin creates project
- [ ] Admin assigns team members
- [ ] Employee sees assigned projects
- [ ] Employee checks in successfully
- [ ] Employee checks in fails (out of range)
- [ ] Periodic location check works
- [ ] Auto-cancel works correctly

### 8. Security 🔄
- [ ] HTTPS enabled
- [ ] API rate limiting configured
- [ ] CORS policies set
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] GPS data encryption
- [ ] Access logs enabled

### 9. Performance 🔄
- [ ] Database indexes created
- [ ] Query optimization
- [ ] Caching strategy implemented
- [ ] CDN configured for assets
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading

### 10. Monitoring 🔄
- [ ] Error tracking (Sentry)
- [ ] Analytics (Google Analytics)
- [ ] Performance monitoring
- [ ] Uptime monitoring
- [ ] Log aggregation
- [ ] Alert notifications

## 🚀 Deployment Steps

### Step 1: Backup
```bash
# Backup database
pg_dump -U postgres goldencard_erp > backup_$(date +%Y%m%d).sql

# Backup code
git tag -a v1.0-attendance-update -m "Attendance system with project management"
git push --tags
```

### Step 2: Database Migration
```bash
# Run migration scripts
psql -U postgres -d goldencard_erp -f migrations/001_create_projects.sql
psql -U postgres -d goldencard_erp -f migrations/002_create_project_members.sql
psql -U postgres -d goldencard_erp -f migrations/003_update_attendance.sql
```

### Step 3: Deploy Code
```bash
# Pull latest code
git pull origin main

# Install dependencies
npm install

# Build
npm run build

# Deploy to Vercel
vercel --prod
```

### Step 4: Seed Data (Optional)
```bash
# Seed sample projects
node scripts/seed-projects.js

# Seed sample attendance records
node scripts/seed-attendance.js
```

### Step 5: Verify Deployment
- [ ] Check website is accessible
- [ ] Test login with admin account
- [ ] Test employee login
- [ ] Verify password change requirement
- [ ] Test check-in flow
- [ ] Test project management
- [ ] Check error logs
- [ ] Monitor performance

### Step 6: User Training
- [ ] Schedule training session
- [ ] Distribute user guides
- [ ] Create video tutorials
- [ ] Set up support channel
- [ ] Assign support team

### Step 7: Go Live
- [ ] Announce to all employees
- [ ] Monitor closely for first week
- [ ] Collect feedback
- [ ] Address issues promptly

## 📊 Post-Deployment Monitoring

### Week 1:
- [ ] Daily check of error logs
- [ ] Monitor user adoption rate
- [ ] Collect user feedback
- [ ] Fix critical bugs immediately

### Week 2-4:
- [ ] Weekly review of system performance
- [ ] Analyze usage patterns
- [ ] Gather feature requests
- [ ] Plan improvements

### Month 2+:
- [ ] Monthly analytics review
- [ ] User satisfaction survey
- [ ] Performance optimization
- [ ] Feature enhancement planning

## 🐛 Known Issues & Workarounds

### Issue 1: GPS Not Available
**Symptom:** User cannot check-in, "GPS not available" error  
**Workaround:** 
1. Enable GPS on device
2. Allow location permission in browser
3. Use Chrome/Safari (Edge may have issues)

### Issue 2: Out of Range
**Symptom:** "Out of range" error for construction site  
**Workaround:**
1. Verify project location is correct
2. Increase radius if needed (contact admin)
3. Check GPS accuracy on device

### Issue 3: Project Not Showing
**Symptom:** Employee doesn't see their project  
**Workaround:**
1. Verify employee is assigned to project
2. Check project status is "active"
3. Check employee status is "active" in project

## 📞 Emergency Contacts

### Critical Issues (P0):
- **On-call Engineer:** +84 xxx xxx xxxx
- **System Admin:** +84 xxx xxx xxxx
- **Escalation:** CTO +84 xxx xxx xxxx

### Non-critical Issues (P1-P2):
- **Email:** it@goldenenergy.com
- **Slack:** #erp-support
- **Response Time:** Within 4 hours

### User Support:
- **Email:** hr@goldenenergy.com
- **Hotline:** 1900 xxxx
- **Hours:** 8:00 AM - 6:00 PM (Mon-Fri)

## ✅ Sign-off

### Development Team:
- [ ] Frontend Developer: ____________________ Date: ______
- [ ] Backend Developer: ____________________ Date: ______
- [ ] QA Engineer: ____________________ Date: ______

### Stakeholders:
- [ ] HR Manager: ____________________ Date: ______
- [ ] IT Manager: ____________________ Date: ______
- [ ] CTO: ____________________ Date: ______

---

**Document Version:** 1.0  
**Last Updated:** 2025-01-XX  
**Status:** 🔄 In Progress
