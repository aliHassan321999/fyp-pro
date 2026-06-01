# Quick Mismatch Reference - At a Glance

## 🔴 CRITICAL ISSUES (Fix First)

### 1. **Complaint Status Enum** 
- Backend: `'pending'`, `'pending_assignment'`, `'assigned'`, `'in_progress'`, `'resolved'`, `'closed'`
- Frontend: `'open'`, `'assigned'`, `'in_progress'`, `'resolved'`, `'closed'`
- **Fix**: Align enums - frontend missing `pending` & `pending_assignment`, has extra `open`

### 2. **Image Field Naming**
- Backend returns: `attachedImages: string[]`
- Frontend expects: `images: string[]`
- **Fix**: Rename in one location to match

### 3. **Staff Dashboard Endpoint**
- Frontend calls: `GET /staff/dashboard`
- Backend provides: ❌ NOT FOUND
- **Fix**: Implement endpoint or update frontend route

---

## 🟠 HIGH PRIORITY (Fix Soon)

### 4. **SLA Fields Missing from Frontend Type**
- Backend returns: `slaDeadline`, `slaStatus`, `slaBreached`, `assignedAt`, `lastAssignedAt`, `reassignmentCount`, `resolvedAt`
- Frontend type: Missing all these fields
- **Fix**: Add to Complaint type

### 5. **Location Data Structure**
- Backend returns: `{ lat: number, lng: number }`
- Frontend expects: `locationText: string`
- **Fix**: Choose one approach - convert or update

### 6. **Staff Member Name Field**
- Backend returns: `profile: { fullName: string }`
- Frontend expects: `name: string`
- **Fix**: Add `name` property to response or update frontend

### 7. **Get User by ID Endpoint**
- Frontend calls: `GET /users/:id`
- Backend route: ❌ NOT FOUND in user.routes.ts
- **Fix**: Implement endpoint

---

## 🟡 MEDIUM PRIORITY

### 8. **Feedback Field Naming**
- Backend model: `rating: number`, `feedbackComment: string`
- Frontend expects: `feedbackRating: number`
- **Fix**: Rename to match

### 9. **Activity Log Populate**
- Frontend expects: `performedBy: { name, email }`
- Backend might not populate: User reference
- **Fix**: Verify and add .populate()

### 10. **User Type Mismatch**
- Frontend has: `username`, `isActive`, `roleId`
- Backend has: `role`, `accountStatus`, no `username`
- **Fix**: Update frontend types to match backend

### 11. **Feedback Submitted Status**
- Frontend expects: `feedbackSubmitted: boolean`
- Backend provides: ❌ NO SUCH FIELD
- **Fix**: Compute from `feedbackSubmittedAt !== null` or add field

### 12. **Recommended Staff IDs**
- Backend returns: `recommendedStaffIds: ObjectId[]`
- Frontend type: Missing field
- **Fix**: Add to type (if needed in UI)

---

## 📋 QUICK CONVERSION TABLE

| What Backend Returns | What Frontend Expects | Fix |
|---|---|---|
| `attachedImages: []` | `images: []` | Rename |
| `rating: 5` | `feedbackRating: 5` | Rename |
| `{ lat, lng }` | `locationText` | Convert or update |
| `profile.fullName` | `name` | Transform response |
| Status: `pending_assignment` | Status: `open` | Unify enum |
| N/A | `feedbackSubmitted: boolean` | Compute field |
| `performedBy: ObjectId` | `performedBy: { name, email }` | Populate |

---

## 🔗 File References for Quick Fix

### Frontend Files to Update
- [ ] `frontend/src/features/complaint/complaint.types.ts` - Add SLA fields, fix naming
- [ ] `frontend/src/features/user/user.types.ts` - Remove unused fields
- [ ] `frontend/src/features/complaint/complaint.api.ts` - Add missing endpoints

### Backend Files to Update
- [ ] `Backend/src/models/complaint.model.ts` - Consider renaming `attachedImages`
- [ ] `Backend/src/routes/user.routes.ts` - Add GET /:id endpoint
- [ ] `Backend/src/routes/staff.routes.ts` - Add dashboard endpoint
- [ ] `Backend/src/controllers/complaint.controller.ts` - Ensure populate() for activity logs
- [ ] `Backend/src/controllers/user.controller.ts` - Add user detail GET handler

---

## ✅ What's Working Correctly

- ✅ Auth response wrapper structure
- ✅ Login parameter naming (`emailOrUsername`)
- ✅ Feedback submission parameter (`comment`)
- ✅ Query parameter format for staff filtering
- ✅ Department head route ordering

---

## 🎯 Next Steps

1. **Fix Status Enum** - Pick one or harmonize both
2. **Add Missing Endpoints** - Implement `/staff/dashboard` and `/users/:id`
3. **Update Response Field Names** - `images`, `feedbackRating`, `rating`
4. **Add SLA Fields** - Update frontend type with all SLA properties
5. **Test Integration** - Write tests for all endpoints with new types
