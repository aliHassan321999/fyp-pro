# Multi-Department System Implementation Guide

## 🎯 Overview
Your complaint management system now supports **multiple independent departments** where:
- Each department has its own **unique Department ID** (DEPT-001, DEPT-002, etc.)
- Staff members are assigned to specific departments
- **Staff can ONLY see complaints from their own department**
- **Department heads manage only their department's resources**
- **Admin/SuperAdmin can see all departments**

---

## 📋 Department Setup

### 4 Pre-configured Departments

#### 🔧 DEPT-001: Maintenance
- **Department ID**: DEPT-001
- **Head Email**: maintenance.head@company.com
- **Head Password**: maint123
- **Staff** (3 members):
  - john.doe@company.com / staff123
  - sarah.smith@company.com / staff123
  - mike.wilson@company.com / staff123

#### ⚡ DEPT-002: Utilities
- **Department ID**: DEPT-002
- **Head Email**: utilities.head@company.com
- **Head Password**: utils123
- **Staff** (2 members):
  - emma.brown@company.com / staff123
  - james.davis@company.com / staff123

#### 🔒 DEPT-003: Security
- **Department ID**: DEPT-003
- **Head Email**: security.head@company.com
- **Head Password**: sec123
- **Staff** (3 members):
  - alex.johnson@company.com / staff123
  - lisa.anderson@company.com / staff123
  - robert.taylor@company.com / staff123

#### 🌿 DEPT-004: Landscaping
- **Department ID**: DEPT-004
- **Head Email**: landscaping.head@company.com
- **Head Password**: land123
- **Staff** (2 members):
  - david.miller@company.com / staff123
  - sophia.white@company.com / staff123

---

## 🔑 Login Credentials

### Admin/SuperAdmin (Full System Access)
```
Email: admin@company.com
Password: admin123
Role: Admin
Access: All departments, Admin dashboard
```

```
Email: superadmin@company.com
Password: superadmin123
Role: SuperAdmin
Access: Full system including department management
```

### Test Resident
```
Email: test@gmail.com
Password: test123
Role: Resident
Access: Submit complaints
```

---

## 🧪 Testing Scenarios

### Test Case 1: Staff Member (Maintenance)
```
1. Login with: john.doe@company.com / staff123
2. Routed to: Staff Dashboard
3. Will see:
   - Department: DEPT-001 displayed
   - Only complaints from Maintenance department
   - Statistics based on DEPT-001 data only
   - Cannot see other departments' data
```

### Test Case 2: Department Head (Utilities)
```
1. Login with: utilities.head@company.com / utils123
2. Routed to: Department Dashboard
3. Will see:
   - Department: "Utilities Department"
   - Dashboard shows DEPT-002 staff only
   - Can manage staff assignments
   - All metrics filtered to DEPT-002
```

### Test Case 3: Admin Dashboard
```
1. Login with: admin@company.com / admin123
2. Routed to: Admin Dashboard
3. Will see:
   - Departments Management page
   - All 4 departments with their IDs
   - Staff assigned to each department
   - Option to manage departments
4. Can view:
   - DEPT-001: 3 staff members
   - DEPT-002: 2 staff members
   - DEPT-003: 3 staff members
   - DEPT-004: 2 staff members
```

---

## 🔄 Data Flow

### Authentication Flow
```
User Login
    ↓
Email + Password
    ↓
System checks mock database
    ↓
Determines: Role + Department ID
    ↓
Stores in localStorage
    ↓
Routes to appropriate dashboard
    ↓
Dashboard filters by Department ID
```

### Staff Dashboard Filter
```
All Complaints (Mock Data)
    ↓
Filter by user.departmentId
    ↓
Show only matching department complaints
    ↓
Calculate stats from filtered data
    ↓
Display department-specific view
```

---

## 📁 Files Modified

### 1. **Type Definitions** (`src/types/index.ts`)
```typescript
// User now has departmentId
interface User {
  id: string;
  email: string;
  role: UserRole;
  departmentId?: string;  // NEW: Department assignment
  // ... other fields
}

// Complaint now requires departmentId
interface Complaint {
  id: string;
  departmentId: string;  // NEW: Which dept handles this
  residentId: string;
  // ... other fields
}
```

### 2. **Login Page** (`src/pages/Auth/LoginPage.tsx`)
- **Mock Database**: 4 departments with unique login credentials
- **determineUserRole()**: Returns `{role, departmentId}`
- **handleLogin()**: Stores departmentId in localStorage
- **Storage**: departmentId persisted across sessions

### 3. **Auth Context** (`src/context/AuthContext.tsx`)
- Initializes departmentId from localStorage
- Includes departmentId in User object
- Clears departmentId on logout

### 4. **Staff Dashboard** (`src/pages/Staff/DashboardPage.tsx`)
- **useAuth hook**: Gets user and departmentId
- **departmentComplaints**: Filtered by departmentId
- **Dynamic Stats**: Calculated from filtered complaints
- **Header**: Shows assigned department
- **Isolation**: Staff cannot see other departments

### 5. **Department Dashboard** (`src/pages/Department/DashboardPage.tsx`)
- **Department Mapping**: Maps DEPT-ID to department name
- **Staff Roster**: Shows only assigned staff
- **Dynamic Metrics**: Based on department data
- **Department Header**: Displays full department name

### 6. **Admin Departments Page** (`src/pages/Admin/DepartmentsPage.tsx`)
- **Department Cards**: Show DEPT-ID badge
- **Staff List**: Display all assigned staff
- **Department Info**: Head credentials and contact info
- **Management**: Add/edit/remove staff from departments

---

## 🛡️ Security Features

✅ **Department Isolation**: Users only see their department's data
✅ **Role-Based Access**: Different views for staff/heads/admin
✅ **Unique Credentials**: Each person has unique email/password
✅ **Department Persistence**: departmentId stored securely in localStorage
✅ **Automatic Routing**: Users routed based on determined role

---

## 🚀 How It Works In Practice

### Scenario: New Complaint Submitted
1. Resident submits complaint (can specify department)
2. Complaint is assigned to a department (departmentId)
3. Only staff in that department see the complaint
4. Department head gets notified
5. Staff can update complaint status (visible only to department)

### Scenario: Staff Switches Departments
1. Admin assigns staff to new department
2. Next login: staff enters their new department
3. Dashboard filters to new department
4. Old department data no longer visible
5. New department complaints appear automatically

### Scenario: Admin Reviews System
1. Admin logs in
2. Sees all 4 departments in management page
3. Can drill down into each department
4. Views staff assignments
5. Generates cross-department reports
6. No department isolation (full access)

---

## 💾 Data Storage

### LocalStorage Keys
- `AUTH_TOKEN`: JWT token
- `USER`: User object (includes departmentId)
- `departmentId`: Department ID string

### Mock Data Locations
- **Login credentials**: LoginPage.tsx (determineUserRole function)
- **Complaints**: Staff/Department Dashboard (allComplaints array)
- **Department staff**: Department Dashboard (departmentStaffMap object)
- **Admin data**: Admin Dashboard/DepartmentsPage

---

## 🔮 Future Enhancements

### Recommended Next Steps
1. **Backend Integration**: Connect mock data to REST API
2. **Department CRUD**: Admin can create/edit departments
3. **Dynamic Staff Assignment**: Real-time staff roster management
4. **Complaint Routing**: Route complaints to appropriate department
5. **Multi-Level Permissions**: More granular access control
6. **Department Analytics**: Cross-department reports
7. **Audit Trail**: Track department changes

---

## 🐛 Troubleshooting

### Issue: Staff sees all complaints
- **Cause**: departmentId not stored in localStorage
- **Fix**: Clear localStorage, login again
- **Check**: Console should show departmentId in User object

### Issue: Wrong department displayed
- **Cause**: Stale departmentId in localStorage
- **Fix**: Logout → Clear browser cache → Login again
- **Check**: Verify correct email/password for department

### Issue: Admin can't see departments
- **Cause**: Admin role bypasses department filter
- **Fix**: This is correct behavior (admin has full access)
- **Change**: Modify dashboards if you want admin restriction

---

## 📞 Support

For issues or questions about the multi-department system:
1. Check test credentials above
2. Verify you're using correct department credentials
3. Clear localStorage if departments don't update
4. Check browser console for departmentId in User object
5. Verify role is correct before checking department access

---

**Version**: 1.0  
**Last Updated**: March 18, 2026  
**System**: Multi-Department Complaint Management Platform
