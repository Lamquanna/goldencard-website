# Manual Test Plan - JWT Auth & HRM Leave Approval
**Generated:** 2026-01-14  
**Testing Scope:** JWT Authentication, Leave Management, Coze Chatbot Integration

---

## Prerequisites

- Server running: `npm run dev` on `http://localhost:3000`
- Database populated with test users and leave requests
- Browser with DevTools (Chrome/Edge F12)
- PostgreSQL client (pgAdmin/DBeaver) for database verification

### Test User Accounts

| Username | Password | Role | Purpose |
|----------|----------|------|---------|
| admin | password | admin | Full access for approval testing |
| manager1 | password | manager | Department manager for approval testing |
| employee1 | password | employee | Staff member for rejection testing |

---

## Test Suite 1: JWT Authentication & Token Management

### Test 1.1: Login and Token Generation
**Objective:** Verify JWT token is generated and stored correctly

**Steps:**
1. Open browser DevTools (F12) → **Application** tab → **Local Storage**
2. Navigate to `http://localhost:3000/erp/login`
3. Enter credentials:
   - Username: `admin`
   - Password: `password`
4. Click **"Login"** button
5. Wait for redirect to `/erp/dashboard`

**Expected Results:**
- ✅ Redirect to ERP dashboard successfully
- ✅ `auth_token` entry exists in Local Storage
- ✅ Token value starts with `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.`
- ✅ Token decodes correctly at https://jwt.io showing:
  - `userId`: Numeric user ID
  - `email`: User's email address
  - `username`: "admin"
  - `role`: "admin"
  - `iat`: Issued timestamp
  - `exp`: Expiration (24 hours from `iat`)

**Pass Criteria:**
- Token exists and contains all required fields
- Expiration is exactly 24 hours from issue time

---

### Test 1.2: Auto-Authentication on Page Reload
**Objective:** Verify token persists and auto-authenticates

**Steps:**
1. After successful login from Test 1.1
2. Press **F5** or **Ctrl+R** to reload page
3. Observe behavior

**Expected Results:**
- ✅ User remains logged in (no redirect to login page)
- ✅ User details displayed in navigation (username, role)
- ✅ No API authentication errors in console

**Pass Criteria:**
- No login page redirect after reload

---

### Test 1.3: Authorization Header Injection
**Objective:** Verify interceptor attaches token to API requests

**Steps:**
1. Stay logged in from previous test
2. Open DevTools → **Network** tab
3. Navigate to `/erp/hrm/leaves`
4. Filter network requests: `XHR` or `Fetch`
5. Click any leave request API call
6. Check **Headers** tab → **Request Headers**

**Expected Results:**
- ✅ `Authorization` header present
- ✅ Value format: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- ✅ Token matches value in Local Storage

**Pass Criteria:**
- Authorization header automatically attached to all API calls

---

### Test 1.4: 401 Auto-Logout Behavior
**Objective:** Verify expired/invalid tokens trigger automatic logout

**Steps:**
1. Stay logged in
2. Open DevTools → **Application** → **Local Storage**
3. Manually edit `auth_token` value (add "XXX" at the end to corrupt it)
4. Navigate to `/erp/hrm/attendance` or any protected route
5. Observe behavior

**Expected Results:**
- ✅ 401 Unauthorized response from API
- ✅ Local Storage cleared (`auth_token` removed)
- ✅ Automatic redirect to `/erp/login`
- ✅ Error message: "Session expired. Please login again."

**Pass Criteria:**
- User redirected to login page within 2 seconds

---

## Test Suite 2: Leave Approval System

### Test 2.1: Manager Approves Leave Request
**Objective:** Verify manager can approve pending leave requests

**Setup:**
1. Login as **manager1** (role: manager)
2. Navigate to `/erp/hrm/leaves`
3. Ensure at least one leave request with status **"pending"** exists

**Steps:**
1. Click on pending leave request row
2. Click **"Approve"** button in modal/detail view
3. Confirm approval (if confirmation dialog appears)
4. Wait for response

**Expected Results:**
- ✅ Success message: "Leave request approved successfully"
- ✅ Leave request status changes to **"approved"**
- ✅ Request disappears from pending list
- ✅ Approved by field shows: `manager1@domain.com`

**Database Verification:**
```sql
-- Check leave request status
SELECT id, employee_id, status, approved_by, approved_at
FROM leave_requests
WHERE id = [REQUEST_ID];

-- Expected: status='approved', approved_by=[manager's user_id], approved_at=NOW()

-- Check leave balance deduction
SELECT annual_used, annual_remaining
FROM leave_balances
WHERE employee_id = [EMPLOYEE_ID];

-- Expected: annual_used increased by leave days
-- Expected: annual_remaining decreased by leave days
```

**Pass Criteria:**
- Leave status updated in database
- Balance correctly deducted atomically

---

### Test 2.2: Employee Cannot Approve (Role Check)
**Objective:** Verify role-based access control works

**Setup:**
1. Logout from manager account
2. Login as **employee1** (role: employee)
3. Navigate to `/erp/hrm/leaves`

**Steps:**
1. Try to click **"Approve"** button on any leave request
2. If button is disabled/hidden, try direct API call using curl or Postman:
```bash
curl -X PATCH http://localhost:3000/api/erp/hrm/leaves/[REQUEST_ID] \
  -H "Authorization: Bearer [EMPLOYEE_TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"action": "approve"}'
```

**Expected Results:**
- ✅ **403 Forbidden** response
- ✅ Error message: "Only managers, directors, or admins can approve leave requests"
- ✅ Leave request status unchanged in database

**Pass Criteria:**
- API rejects approval attempt from non-manager role
- No database changes made

---

### Test 2.3: Insufficient Balance Prevention
**Objective:** Verify transaction rollback when balance is insufficient

**Setup:**
1. Login as **admin**
2. Manually set employee's leave balance to 2 days in database:
```sql
UPDATE leave_balances
SET annual_remaining = 2
WHERE employee_id = [EMPLOYEE_ID];
```
3. Create leave request for 5 days
4. Try to approve this request

**Steps:**
1. Navigate to `/erp/hrm/leaves`
2. Click on the 5-day leave request
3. Click **"Approve"**

**Expected Results:**
- ✅ **400 Bad Request** response
- ✅ Error message: "Insufficient annual leave balance"
- ✅ Leave request status remains **"pending"**
- ✅ Leave balance unchanged (still 2 days)

**Database Verification:**
```sql
-- Both should remain unchanged
SELECT status FROM leave_requests WHERE id = [REQUEST_ID];
-- Expected: 'pending'

SELECT annual_remaining FROM leave_balances WHERE employee_id = [EMPLOYEE_ID];
-- Expected: 2
```

**Pass Criteria:**
- Transaction rolled back (no partial updates)
- Clear error message returned

---

### Test 2.4: Reject Leave Request
**Objective:** Verify rejection does not deduct balance

**Steps:**
1. Login as **manager1**
2. Navigate to `/erp/hrm/leaves`
3. Click on pending leave request
4. Click **"Reject"** button
5. Enter rejection reason (if required): "Insufficient coverage during requested period"
6. Confirm rejection

**Expected Results:**
- ✅ Success message: "Leave request rejected"
- ✅ Leave status changes to **"rejected"**
- ✅ Leave balance **unchanged** (no deduction)
- ✅ Rejection reason stored in database

**Database Verification:**
```sql
SELECT status, rejection_reason, annual_remaining
FROM leave_requests lr
JOIN leave_balances lb ON lr.employee_id = lb.employee_id
WHERE lr.id = [REQUEST_ID];

-- Expected: status='rejected', rejection_reason filled, annual_remaining unchanged
```

**Pass Criteria:**
- Rejection does not affect leave balance

---

## Test Suite 3: Coze Chatbot Integration

### Test 3.1: Chat Widget Loads Without CSP Errors
**Objective:** Verify Content-Security-Policy allows Coze scripts

**Steps:**
1. Login to any ERP page (e.g., `/erp/dashboard`)
2. Open DevTools → **Console** tab
3. Look for any red error messages
4. Wait 3 seconds for chat widget to initialize

**Expected Results:**
- ✅ **No** CSP errors like:
  - ❌ "Refused to load the script 'https://sf-cdn.coze.com/...' because it violates the Content-Security-Policy"
  - ❌ "Refused to connect to 'https://api.coze.com/...' because it violates the CSP"
- ✅ Chat button visible at **bottom-right** corner
- ✅ Button displays icon and text "Chat with AI"

**Pass Criteria:**
- Zero CSP violations in console
- Widget loads successfully

---

### Test 3.2: Chat Widget Z-Index Positioning
**Objective:** Verify chat widget appears above all UI elements

**Steps:**
1. Navigate to `/erp/dashboard`
2. Open sidebar (if collapsible)
3. Open any modal or dropdown menu
4. Observe chat button position

**Expected Results:**
- ✅ Chat button remains visible above:
  - Sidebar navigation
  - Modals and dialogs
  - Dropdown menus
  - Page content
- ✅ Button positioned at **bottom-right** with fixed positioning
- ✅ Z-index: 9999 (inspect element to verify)

**Pass Criteria:**
- Chat widget never gets hidden behind other elements

---

### Test 3.3: Chat Functionality Test
**Objective:** Verify chat messages send and receive correctly

**Steps:**
1. Click on chat button at bottom-right
2. Chat window opens
3. Type test message: "Hello, what can you help me with?"
4. Press Enter or click Send
5. Wait for AI response

**Expected Results:**
- ✅ Chat window opens smoothly (no layout shifts)
- ✅ Message appears in chat history
- ✅ AI responds within 5 seconds
- ✅ Response is relevant to the test message
- ✅ Chat history persists during session (reload page and check)

**Pass Criteria:**
- Bidirectional communication working
- No JavaScript errors in console

---

### Test 3.4: User Context in Chat
**Objective:** Verify bot receives logged-in user information

**Steps:**
1. Ensure logged in as **admin**
2. Open chat widget
3. Ask: "What is my user ID and role?"
4. Check if bot responds with correct information

**Expected Results:**
- ✅ Bot can identify:
  - User ID: Matches logged-in user
  - Role: "admin"
  - Email: admin@domain.com
- ✅ (If not implemented yet: Note as enhancement opportunity)

**Pass Criteria:**
- Bot receives userId prop from component

---

## Test Suite 4: API Security & Edge Cases

### Test 4.1: Concurrent Request Handling
**Objective:** Verify token doesn't get overwritten during parallel requests

**Steps:**
1. Login as admin
2. Open DevTools → **Network** tab
3. Navigate to dashboard (triggers multiple API calls)
4. Check if all requests have Authorization header

**Expected Results:**
- ✅ All parallel requests include Authorization header
- ✅ No requests fail with 401 Unauthorized
- ✅ No race conditions in token retrieval

**Pass Criteria:**
- 100% of API requests authenticated

---

### Test 4.2: Token Expiration After 24 Hours
**Objective:** Verify expired tokens are rejected

**Setup:**
1. Manually edit token expiration in JWT payload
2. Or wait 24 hours (impractical for manual testing)

**Alternative Quick Test:**
1. Generate token with 5-second expiration (modify `lib/auth/jwt.ts` temporarily):
```typescript
expiresIn: '5s' // Instead of '24h'
```
2. Login and wait 6 seconds
3. Try accessing protected route

**Expected Results:**
- ✅ 401 Unauthorized after expiration
- ✅ Auto-logout triggered
- ✅ Redirect to login page

**Pass Criteria:**
- Expired tokens rejected correctly

---

## Test Suite 5: Cross-Module Integration

### Test 5.1: Leave Request → Attendance Module Sync
**Objective:** Verify approved leave affects attendance records

**Steps:**
1. Approve leave request for dates 2026-01-20 to 2026-01-22
2. Navigate to `/erp/hrm/attendance`
3. Filter by employee and date range

**Expected Results:**
- ✅ Leave days marked as "On Leave" in attendance
- ✅ No attendance clock-in/out for those dates
- ✅ (If auto-sync not implemented: Note for future enhancement)

**Pass Criteria:**
- Data consistency between modules

---

## Regression Testing Checklist

After any code changes, re-run these critical tests:

- [ ] Login generates valid JWT token
- [ ] Authorization header attached to all API calls
- [ ] 401 triggers auto-logout
- [ ] Manager can approve leave
- [ ] Employee cannot approve leave (403)
- [ ] Insufficient balance prevents approval
- [ ] Coze widget loads without CSP errors
- [ ] Chat widget visible at z-index 9999

---

## Appendix: Test Data Setup

### SQL Scripts for Test Data

```sql
-- Insert test users
INSERT INTO users (username, email, password_hash, role) VALUES
('admin', 'admin@goldencard.com', '$2a$10$...', 'admin'),
('manager1', 'manager1@goldencard.com', '$2a$10$...', 'manager'),
('employee1', 'employee1@goldencard.com', '$2a$10$...', 'employee');

-- Insert leave balances
INSERT INTO leave_balances (employee_id, annual_total, annual_remaining, sick_total, sick_remaining) VALUES
(3, 15, 10, 10, 10); -- employee1

-- Insert test leave request
INSERT INTO leave_requests (employee_id, start_date, end_date, leave_type, reason, status, total_days) VALUES
(3, '2026-01-20', '2026-01-22', 'annual', 'Personal matters', 'pending', 3);
```

---

## Known Issues & Limitations

1. **Token Refresh:** Currently, token expiration is hard-coded at 24 hours. No refresh token mechanism implemented.
2. **Multi-Device Logout:** Logging out on one device does not invalidate tokens on other devices.
3. **Leave Balance Sync:** Balance updates are manual; no automatic reset at year-end.

---

## Test Execution Log

| Test Case | Date | Tester | Result | Notes |
|-----------|------|--------|--------|-------|
| 1.1 Login Token | | | ⏳ | |
| 1.2 Auto-Auth | | | ⏳ | |
| 2.1 Manager Approve | | | ⏳ | |
| 2.2 Employee Reject | | | ⏳ | |
| 3.1 Coze CSP | | | ⏳ | |
| 3.3 Chat Function | | | ⏳ | |

**Legend:** ✅ Pass | ❌ Fail | ⏳ Pending | ⚠️ Needs Retest
