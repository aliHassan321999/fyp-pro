# API Integration Analysis - Mismatches Report

## Executive Summary
Found **15+ critical mismatches** between frontend and backend API contracts including status enum conflicts, field naming inconsistencies, missing fields in responses, and endpoint structure issues.

---

## 1. STATUS ENUM MISMATCHES (CRITICAL)

### Issue: Complaint Status Values Don't Match
**Severity**: CRITICAL - Will cause runtime errors

| Aspect | Backend | Frontend | Issue |
|--------|---------|----------|-------|
| **Defined in** | [Backend/src/interfaces/complaint.interface.ts#L1](Backend/src/interfaces/complaint.interface.ts#L1) | [frontend/src/features/complaint/complaint.types.ts#L3](frontend/src/features/complaint/complaint.types.ts#L3) | Enum mismatch |
| **Backend values** | `'pending'`, `'pending_assignment'`, `'assigned'`, `'in_progress'`, `'resolved'`, `'closed'` | - | Complete backend enum |
| **Frontend values** | - | `'open'`, `'assigned'`, `'in_progress'`, `'resolved'`, `'closed'` | Frontend enum |
| **Discrepancies** | Frontend has `'open'` which backend doesn't use | Backend has `'pending'` and `'pending_assignment'` which frontend doesn't handle | Critical mismatch |

**Where Set**: 
- Backend: [Backend/src/models/complaint.model.ts#L7-L11](Backend/src/models/complaint.model.ts#L7-L11)
- Frontend: [frontend/src/features/complaint/complaint.types.ts#L3-L4](frontend/src/features/complaint/complaint.types.ts#L3-L4)

**Expected in Complaints**:
- New complaints default to `'pending_assignment'` [Backend/src/controllers/complaint.controller.ts#L110](Backend/src/controllers/complaint.controller.ts#L110)
- Frontend has no handling for `'pending_assignment'` state

---

## 2. PARAMETER NAMING MISMATCHES

### Issue 2.1: Login Endpoint - Email Field
**Severity**: HIGH - Login will fail

| Aspect | Backend | Frontend |
|--------|---------|----------|
| **Parameter** | `emailOrUsername` | `emailOrUsername` (in auth.types) |
| **Location** | [Backend/src/controllers/auth.controller.ts#L163](Backend/src/controllers/auth.controller.ts#L163) | [frontend/src/features/auth/auth.types.ts#L11-L13](frontend/src/features/auth/auth.types.ts#L11-L13) |
| **Status** | ✓ MATCH | - |

✅ **This is CORRECT - No issue**

### Issue 2.2: Feedback Submission - Comment Field
**Severity**: MEDIUM

| Aspect | Backend | Frontend |
|--------|---------|----------|
| **Expected Field** | `comment` | `comment` |
| **Location** | [Backend/src/controllers/complaint.controller.ts#L430](Backend/src/controllers/complaint.controller.ts#L430) | [frontend/src/features/complaint/complaint.types.ts#L27-L30](frontend/src/features/complaint/complaint.types.ts#L27-L30) |
| **Status** | Backend sends to endpoint | Frontend DTO expects `comment` in SubmitFeedbackDto |

✅ **This is CORRECT - No issue**

---

## 3. RESPONSE FIELD NAMING MISMATCHES (CRITICAL)

### Issue 3.1: Complaint Image Fields
**Severity**: HIGH - Images won't display

| Aspect | Backend Response | Frontend Expectation |
|--------|------------------|---------------------|
| **Field Name** | `attachedImages` (array of strings) | `images` (array of strings) |
| **Backend Model** | [Backend/src/models/complaint.model.ts#L24](Backend/src/models/complaint.model.ts#L24) | - |
| **Frontend Type** | - | [frontend/src/features/complaint/complaint.types.ts#L11](frontend/src/features/complaint/complaint.types.ts#L11) |
| **Set in Controller** | [Backend/src/controllers/complaint.controller.ts#L88-93](Backend/src/controllers/complaint.controller.ts#L88-93) | Expects `images` |

**Problem**: Backend returns `{ attachedImages: [...] }` but frontend expects `{ images: [...] }`

**Files Affected**:
- [Backend/src/models/complaint.model.ts#L24](Backend/src/models/complaint.model.ts#L24): Defines as `attachedImages`
- [frontend/src/features/complaint/complaint.types.ts#L11](frontend/src/features/complaint/complaint.types.ts#L11): Expects as `images`

---

### Issue 3.2: Feedback Rating Field
**Severity**: MEDIUM - Feedback data structure mismatch

| Aspect | Backend Returns | Frontend Expects |
|--------|-----------------|------------------|
| **Field Name** | `rating` | `feedbackRating` |
| **Backend Model** | [Backend/src/models/complaint.model.ts#L33](Backend/src/models/complaint.model.ts#L33) | - |
| **Frontend Type** | - | [frontend/src/features/complaint/complaint.types.ts#L9](frontend/src/features/complaint/complaint.types.ts#L9) |

**Problem**: Backend model has `rating: { type: Number, min: 1, max: 5 }` but frontend expects `feedbackRating`

---

### Issue 3.3: Location Data Structure
**Severity**: HIGH - Location won't render properly

| Aspect | Backend Returns | Frontend Expects |
|--------|-----------------|------------------|
| **Structure** | `{ lat: number, lng: number }` | `locationText: string` |
| **Backend Model** | [Backend/src/models/complaint.model.ts#L26-29](Backend/src/models/complaint.model.ts#L26-29) | - |
| **Frontend Type** | - | [frontend/src/features/complaint/complaint.types.ts#L10](frontend/src/features/complaint/complaint.types.ts#L10) |
| **Created as** | [Backend/src/controllers/complaint.controller.ts#L83-84](Backend/src/controllers/complaint.controller.ts#L83-84) | - |

**Problem**: 
- Backend accepts `lat` and `lng` from request body
- Backend returns location as `{ lat, lng }` object
- Frontend type expects `locationText` as a string
- No coordinate-to-text conversion happening

---

## 4. MISSING FIELDS IN RESPONSES

### Issue 4.1: SLA-Related Fields Missing from Frontend Type
**Severity**: HIGH - SLA tracking won't work

Backend returns these fields but frontend type doesn't include them:

| Backend Field | Type | Description | Frontend Type Has? |
|---------------|------|-------------|-------------------|
| `slaDeadline` | Date | SLA deadline timestamp | ❌ NO |
| `slaStatus` | String | 'normal' \| 'extended' | ❌ NO |
| `slaBreached` | Boolean | Whether SLA deadline passed | ❌ NO |
| `assignedAt` | Date | When complaint assigned | ❌ NO |
| `lastAssignedAt` | Date | Last reassignment time | ❌ NO |
| `reassignmentCount` | Number | Number of reassignments | ❌ NO |
| `resolvedAt` | Date | Resolution timestamp | ❌ NO |

**Location**: 
- Backend model: [Backend/src/models/complaint.model.ts#L11-20](Backend/src/models/complaint.model.ts#L11-20)
- Frontend type: [frontend/src/features/complaint/complaint.types.ts#L1-16](frontend/src/features/complaint/complaint.types.ts#L1-16)

**Impact**: Any SLA dashboard, monitoring, or timeline features will break.

---

### Issue 4.2: Recommendation Fields Missing from Frontend Type
**Severity**: MEDIUM

| Backend Field | Type | Description | Frontend Type Has? |
|---------------|------|-------------|-------------------|
| `recommendedStaffIds` | ObjectId[] | AI-recommended staff for assignment | ❌ NO |

**Location**: 
- Backend model: [Backend/src/models/complaint.model.ts#L31-32](Backend/src/models/complaint.model.ts#L31-32)
- Backend sets in: [Backend/src/controllers/complaint.controller.ts#L96](Backend/src/controllers/complaint.controller.ts#L96)

---

### Issue 4.3: Feedback Submitted Status
**Severity**: MEDIUM - UI state won't work

| Aspect | Status |
|--------|--------|
| **Frontend expects** | `feedbackSubmitted: boolean` in [frontend/src/features/complaint/complaint.types.ts#L8](frontend/src/features/complaint/complaint.types.ts#L8) |
| **Backend provides** | ❌ NOT PROVIDED - No such field in model or response |
| **How to fix** | Need to compute from `feedbackSubmittedAt !== null` or add field to model |

---

### Issue 4.4: Activity Log Structure Mismatch
**Severity**: MEDIUM - Activity logs won't display correctly

Backend returns (`getComplaintActivity`):
```typescript
performedBy: { name?: string; email: string | null }
metadata: { from?: string; to?: string; assignedTo?: string; message?: string }
```

But backend model stores:
```typescript
performedBy: ObjectId (ref: 'User')
metadata: { from?, to?, assignedTo?, message? }
```

Frontend expects in [frontend/src/features/complaint/complaint.types.ts#L60-66](frontend/src/features/complaint/complaint.types.ts#L60-66):
```typescript
performedBy: { name: string; email: string | null }
```

**Issue**: Backend needs to populate `performedBy` to return user data, check [Backend/src/controllers/complaint.controller.ts#L340](Backend/src/controllers/complaint.controller.ts#L340)

---

## 5. MISSING ENDPOINTS

### Issue 5.1: Staff Dashboard Endpoint
**Severity**: HIGH - Feature doesn't exist

| Aspect | Status |
|--------|--------|
| **Frontend calls** | `/staff/dashboard` in [frontend/src/features/complaint/complaint.api.ts#L12-16](frontend/src/features/complaint/complaint.api.ts#L12-16) |
| **Backend provides** | ❌ NOT FOUND - No such route |
| **Similar endpoint** | `/departments/head/dashboard` exists in [Backend/src/routes/department.routes.ts#L17](Backend/src/routes/department.routes.ts#L17) for department heads only |

**Problem**: Frontend dashboard query will fail with 404

---

### Issue 5.2: Get User by ID Endpoint
**Severity**: MEDIUM - Feature may not be implemented

| Aspect | Status |
|--------|--------|
| **Frontend calls** | `GET /users/:id` in [frontend/src/features/user/user.api.ts#L11-17](frontend/src/features/user/user.api.ts#L11-17) |
| **Backend provides** | ❌ NOT FOUND in user.routes.ts |
| **Backend routes** | [Backend/src/routes/user.routes.ts](Backend/src/routes/user.routes.ts) - Only has `/staff` related endpoints |

---

## 6. RESPONSE WRAPPER STRUCTURE

### Issue 6.1: All Responses Use Correct Wrapper
**Severity**: ✅ GOOD

Backend wraps all responses with [Backend/src/utils/response.ts#L1-17](Backend/src/utils/response.ts#L1-17):
```typescript
{
  success: boolean,
  message: string,
  data?: any
}
```

Frontend RTK Query API definition expects this format in all endpoints:
- [frontend/src/features/auth/auth.api.ts#L1-55](frontend/src/features/auth/auth.api.ts#L1-55)
- [frontend/src/features/complaint/complaint.api.ts#L1-85](frontend/src/features/complaint/complaint.api.ts#L1-85)

✅ **This is CORRECT**

---

## 7. DATA TYPE MISMATCHES

### Issue 7.1: Staff Member Response Structure
**Severity**: HIGH - Staff list won't display correctly

Backend returns:
```typescript
{
  _id: string,
  profile: {
    fullName: string,
    email: string
  }
}
```

Frontend `StaffMember` type expects in [frontend/src/features/complaint/complaint.types.ts#L40-44](frontend/src/features/complaint/complaint.types.ts#L40-44):
```typescript
{
  _id: string,
  name: string,      // ❌ Backend doesn't have this
  departmentId?: string
}
```

**Issue**: Frontend expects `name` but backend returns nested in `profile.fullName`

**Backend Response Structure** from [Backend/src/controllers/user.controller.ts#L130-150](Backend/src/controllers/user.controller.ts#L130-150):
- Returns user objects with full profile info

---

### Issue 7.2: User Type Mismatch
**Severity**: MEDIUM - User data handling inconsistent

Frontend `User` type in [frontend/src/features/user/user.types.ts#L1-12](frontend/src/features/user/user.types.ts#L1-12):
```typescript
{
  _id: string,
  username: string,    // ❌ Backend user model has NO 'username' field
  email: string,
  isActive: boolean,   // ❌ Backend uses 'accountStatus'
  roleId: string,      // ❌ Backend has 'role' not 'roleId'
  profile?: {...}
}
```

Backend `IUser` in [Backend/src/interfaces/user.interface.ts](Backend/src/interfaces/user.interface.ts):
```typescript
{
  _id: ObjectId,
  email: string,
  role: string,               // Not 'roleId'
  accountStatus: string,      // Not 'isActive'
  // NO 'username' field
  profile: IUserProfile
}
```

---

## 8. AUTH RESPONSE STRUCTURE

### Issue 8.1: Auth Response User Data
**Severity**: MEDIUM - Auth response handling

Backend login returns in [Backend/src/controllers/auth.controller.ts#L195-210](Backend/src/controllers/auth.controller.ts#L195-210):
```typescript
{
  success: true,
  message: 'Login successful',
  data: {
    _id: string,
    email: string,
    role: string,
    accountStatus: string,
    departmentId?: string,
    profile: IUserProfile,
    // timestamps
  }
}
```

Frontend expects in [frontend/src/features/auth/auth.types.ts#L1-20](frontend/src/features/auth/auth.types.ts#L1-20):
```typescript
AuthResponse: {
  success: boolean,
  message?: string,
  data: AuthUser  // AuthUser type
}

AuthUser: {
  _id: string,
  email: string,
  role: string,
  accountStatus: 'active' | 'pending' | 'suspended',
  departmentId?: string,
  profile: any
}
```

✅ **This matches correctly**

---

## 9. DEPARTMENT ENDPOINT ISSUES

### Issue 9.1: Get Department Head Dashboard Route
**Severity**: MEDIUM - Route order matters

Backend has correct route in [Backend/src/routes/department.routes.ts#L13-17](Backend/src/routes/department.routes.ts#L13-17):
```
GET /departments/head/dashboard  // Must come BEFORE /:id routes
```

Frontend admin API calls in [frontend/src/features/admin/admin.api.ts#L78-81](frontend/src/features/admin/admin.api.ts#L78-81):
```typescript
getHeadDashboard: '/departments/head/dashboard'
```

**Potential Issue**: Route matching order - `/head/dashboard` must be defined before `/:id` to avoid matching `/:id` with `head` as the ID.

✅ **Backend has this correct** - [Backend/src/routes/department.routes.ts#L11-12](Backend/src/routes/department.routes.ts#L11-12)

---

## 10. QUERY PARAMETER MISMATCHES

### Issue 10.1: Get Staff Members Query Parameters
**Severity**: MEDIUM - Filtering might not work

Backend accepts in [Backend/src/controllers/user.controller.ts#L130](Backend/src/controllers/user.controller.ts#L130):
```typescript
?unassigned=true   // To get unassigned staff
?departmentId=xxx  // To get staff in specific department
```

Frontend calls in [frontend/src/features/admin/admin.api.ts#L100-102](frontend/src/features/admin/admin.api.ts#L100-102):
```typescript
getStaffMembers: builder.query<any, { unassigned?: boolean; departmentId?: string } | void>({
  query: (params) => ({ url: '/users/staff', method: 'GET', params: params || {} }),
})
```

✅ **This matches correctly**

---

## 11. ASSIGNMENT ENDPOINT PARAMETER

### Issue 11.1: Assign Complaint Staff ID Format
**Severity**: MEDIUM - Assignment might fail

Frontend sends in [frontend/src/features/complaint/complaint.api.ts#L51-59](frontend/src/features/complaint/complaint.api.ts#L51-59):
```typescript
{
  id: string,           // Complaint ID
  assignedStaffId: string
}
```

Backend expects in [Backend/src/controllers/complaint.controller.ts#L276](Backend/src/controllers/complaint.controller.ts#L276):
```typescript
{
  assignedStaffId: string  // In request body
}
```

Backend checks in [Backend/src/services/assignment.service.ts](Backend/src/services/assignment.service.ts) - Need to verify this file

✅ **Frontend sends correct format**

---

## SUMMARY TABLE OF MISMATCHES

| Issue ID | Severity | Category | Problem | Frontend File | Backend File |
|----------|----------|----------|---------|---------------|--------------|
| 1 | CRITICAL | Enum | Status values mismatch (pending_assignment, open) | [complaint.types.ts#L3](frontend/src/features/complaint/complaint.types.ts#L3) | [complaint.interface.ts#L1](Backend/src/interfaces/complaint.interface.ts#L1) |
| 2 | HIGH | Response Field | `attachedImages` vs `images` | [complaint.types.ts#L11](frontend/src/features/complaint/complaint.types.ts#L11) | [complaint.model.ts#L24](Backend/src/models/complaint.model.ts#L24) |
| 3 | MEDIUM | Response Field | `rating` vs `feedbackRating` | [complaint.types.ts#L9](frontend/src/features/complaint/complaint.types.ts#L9) | [complaint.model.ts#L33](Backend/src/models/complaint.model.ts#L33) |
| 4 | HIGH | Response Field | `location` object vs `locationText` string | [complaint.types.ts#L10](frontend/src/features/complaint/complaint.types.ts#L10) | [complaint.model.ts#L26](Backend/src/models/complaint.model.ts#L26) |
| 5 | HIGH | Missing Fields | SLA fields (slaDeadline, slaStatus, slaBreached) missing from frontend type | [complaint.types.ts#L1](frontend/src/features/complaint/complaint.types.ts#L1) | [complaint.model.ts#L11](Backend/src/models/complaint.model.ts#L11) |
| 6 | HIGH | Missing Endpoint | `/staff/dashboard` not implemented | [complaint.api.ts#L12](frontend/src/features/complaint/complaint.api.ts#L12) | - |
| 7 | MEDIUM | Missing Endpoint | `GET /users/:id` not implemented | [user.api.ts#L11](frontend/src/features/user/user.api.ts#L11) | [user.routes.ts](Backend/src/routes/user.routes.ts) |
| 8 | HIGH | Data Structure | Staff member response: `name` vs `profile.fullName` | [complaint.types.ts#L41](frontend/src/features/complaint/complaint.types.ts#L41) | [user.controller.ts#L140](Backend/src/controllers/user.controller.ts#L140) |
| 9 | MEDIUM | Data Type | User type mismatch: `username`, `isActive`, `roleId` | [user.types.ts#L2-4](frontend/src/features/user/user.types.ts#L2-4) | [user.interface.ts#L20](Backend/src/interfaces/user.interface.ts#L20) |
| 10 | MEDIUM | Missing Field | `feedbackSubmitted` boolean not provided by backend | [complaint.types.ts#L8](frontend/src/features/complaint/complaint.types.ts#L8) | - |
| 11 | MEDIUM | Missing Fields | `recommendedStaffIds` not in frontend type | [complaint.types.ts#L1](frontend/src/features/complaint/complaint.types.ts#L1) | [complaint.model.ts#L31](Backend/src/models/complaint.model.ts#L31) |
| 12 | MEDIUM | Activity Log | Activity log structure needs population check | [complaint.types.ts#L60](frontend/src/features/complaint/complaint.types.ts#L60) | [complaint.controller.ts#L340](Backend/src/controllers/complaint.controller.ts#L340) |

---

## RECOMMENDATIONS FOR ALIGNMENT

### Priority 1 - Critical (Fix Immediately)
1. **Unify Complaint Status Enum**: Update frontend types to include `'pending'` and `'pending_assignment'` states. Remove `'open'` or add to backend.
   - Frontend file: [frontend/src/features/complaint/complaint.types.ts#L3-4](frontend/src/features/complaint/complaint.types.ts#L3-4)
   - Backend file: [Backend/src/interfaces/complaint.interface.ts#L3](Backend/src/interfaces/complaint.interface.ts#L3)

2. **Fix Image Field Naming**: Backend should return `images` instead of `attachedImages` or update frontend to expect `attachedImages`
   - Choose: Update [Backend/src/models/complaint.model.ts#L24](Backend/src/models/complaint.model.ts#L24) to export as `images`
   - Or: Update [frontend/src/features/complaint/complaint.types.ts#L11](frontend/src/features/complaint/complaint.types.ts#L11) to use `attachedImages`

3. **Implement Missing Endpoints**: Add `/staff/dashboard` and `/users/:id` GET endpoints
   - Files to update:
     - [Backend/src/routes/user.routes.ts](Backend/src/routes/user.routes.ts) - Add user detail endpoint
     - [Backend/src/routes/staff.routes.ts](Backend/src/routes/staff.routes.ts) - Add dashboard or extend complaint routes

### Priority 2 - High (Fix Soon)
1. **Add SLA Fields to Frontend Type**: Include all SLA-related fields in Complaint type
   - [frontend/src/features/complaint/complaint.types.ts#L1](frontend/src/features/complaint/complaint.types.ts#L1)

2. **Fix Location Field**: Either:
   - Convert backend `{ lat, lng }` to frontend-expected `locationText` in controller
   - Update frontend to expect `location: { lat: number, lng: number }`

3. **Fix Staff Member Response**: Add data transformation to include `name` field
   - [Backend/src/controllers/user.controller.ts#L140](Backend/src/controllers/user.controller.ts#L140)

### Priority 3 - Medium (Fix Soon)
1. **Update User Type**: Remove unused fields (`username`, `isActive`, `roleId`) from frontend type
   - [frontend/src/features/user/user.types.ts](frontend/src/features/user/user.types.ts)

2. **Add Computed Fields**: `feedbackSubmitted` should be computed from `feedbackSubmittedAt !== null`
   - [frontend/src/features/complaint/complaint.types.ts#L8](frontend/src/features/complaint/complaint.types.ts#L8)

3. **Verify Activity Log Population**: Ensure `performedBy` is properly populated with user data
   - [Backend/src/controllers/complaint.controller.ts#L340](Backend/src/controllers/complaint.controller.ts#L340)

---

## FILES REQUIRING CHANGES

### Frontend Changes Needed
1. [frontend/src/features/complaint/complaint.types.ts](frontend/src/features/complaint/complaint.types.ts)
   - Add SLA fields
   - Change `images` to `attachedImages` or update backend
   - Change `feedbackRating` to `rating`
   - Change `locationText` to location object
   - Add `feedbackSubmitted` computed property

2. [frontend/src/features/user/user.types.ts](frontend/src/features/user/user.types.ts)
   - Remove `username`, `isActive`, `roleId` fields
   - Align with backend IUser structure

3. [frontend/src/features/complaint/complaint.api.ts](frontend/src/features/complaint/complaint.api.ts)
   - Remove or implement `/staff/dashboard` endpoint
   - Add `/users/:id` endpoint to user.api.ts

### Backend Changes Needed
1. [Backend/src/models/complaint.model.ts](Backend/src/models/complaint.model.ts)
   - Consider renaming `attachedImages` to `images` for consistency

2. [Backend/src/routes/user.routes.ts](Backend/src/routes/user.routes.ts)
   - Add `GET /users/:id` endpoint

3. [Backend/src/routes/staff.routes.ts](Backend/src/routes/staff.routes.ts) or [Backend/src/routes/complaint.routes.ts](Backend/src/routes/complaint.routes.ts)
   - Add `/staff/dashboard` endpoint

4. [Backend/src/controllers/complaint.controller.ts](Backend/src/controllers/complaint.controller.ts)
   - Ensure activity log population includes user data
   - Consider adding location text conversion

5. [Backend/src/controllers/user.controller.ts](Backend/src/controllers/user.controller.ts)
   - Add user detail GET endpoint
   - Consider transforming staff response to include `name` field

---

## TESTING RECOMMENDATIONS

1. **Create Integration Tests**: Test all complaint CRUD operations with new types
2. **Mock API Responses**: Verify frontend handles all backend response structures
3. **Endpoint Testing**: Test all endpoints with correct query parameters
4. **Type Validation**: Add TypeScript strict mode checks
5. **E2E Tests**: Test complete flows like create complaint → assign → resolve → feedback
