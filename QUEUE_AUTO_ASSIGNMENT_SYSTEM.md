# Complaint Queue & Auto-Assignment System

## 🎯 Overview

Your complaint management system now has an **intelligent queueing and auto-assignment system** that:
- ✅ Queues complaints when all staff are busy
- ✅ Generates unique ticket numbers for queued complaints
- ✅ Sends email notifications to residents
- ✅ **Automatically assigns complaints when staff becomes available**
- ✅ Distributes complaints fairly based on staff capacity
- ✅ Updates residents when their complaint is assigned

---

## 📋 How It Works

### 1️⃣ Resident Submits Complaint

```
Resident submits complaint
    ↓
System checks staff availability in department
    ↓
Two possible outcomes:
    ├─ Staff Available → Immediately assign to least busy staff
    └─ All Staff Busy → Add to queue, generate ticket, send email
```

### 2️⃣ Complaint Gets Queued

When all staff in a department are at full capacity:

✉️ **Email Sent to Resident:**
- Confirmation that complaint is queued
- Unique ticket number (e.g., TKT-1001)
- Estimated wait time: 15-30 minutes
- Notice that complaint will be auto-assigned

📌 **Stored in Queue:**
- Complaint details
- Resident email
- Timestamp
- Priority level
- Queue position

### 3️⃣ Staff Completes Work & System Auto-Assigns

When a staff member completes a complaint:

```
Staff clicks "Complete" button
    ↓
Complaint marked as completed
    ↓
Staff capacity freed up
    ↓
System checks queue for department
    ↓
Queued complaint auto-assigned to available staff
    ↓
Email sent to resident with staff details
```

---

## 🔧 System Components

### 1. Queue Service (`src/services/queueService.ts`)

**Main Functions:**

#### `addToQueue(complaint, residentEmail, staffList)`
- Checks if staff is available
- If available: returns staff assignment immediately
- If not available: queues complaint and sends notification
- Generates unique ticket ID

#### `processQueueForDepartment(departmentId, staffList)`
- Processes queued complaints when staff becomes available
- Assigns to staff with least active complaints (fair distribution)
- Sends assignment notification email
- Returns list of assigned complaint IDs

#### `getQueueStatus(departmentId)`
- Returns current queue length
- Average wait time estimate
- List of complaints waiting

#### `isStaffAvailable(departmentId, staffList)`
- Checks if any staff can take new complaints
- Considers staff capacity limitations

#### `getOptimalStaffForAssignment(departmentId, staffList)`
- Finds the best staff member to assign complaint
- Prioritizes staff with lowest active complaints
- Ensures capacity not exceeded

---

## 🎫 Ticket System

### Ticket ID Format
```
TKT-1001  (starts at 1000)
TKT-1002
TKT-1003
... etc
```

**What's Tracked:**
- Unique ticket ID
- Complaint details
- Resident email
- Department
- Priority
- Queue timestamp

---

## 📧 Email Notifications

### 1. **Complaint Queued** 📬

Sent immediately when complaint added to queue.

```
Subject: Complaint Queued - Ticket #TKT-1001

Body:
Your complaint "Broken Door Lock" has been received and queued 
for the DEPT-001 department. All staff are currently busy. 
Your complaint will be automatically assigned to the next available 
staff member. Please keep your ticket number safe: TKT-1001
```

### 2. **Complaint Assigned** ✅

Sent when complaint auto-assigned from queue.

```
Subject: Complaint Assigned - Ticket #TKT-1001

Body:
Your complaint (Ticket #TKT-1001) has been automatically 
assigned to John Doe from the DEPT-001 department. 
They will contact you shortly.
Staff Email: john.doe@company.com
```

---

## 👥 Staff Capacity Management

### Default Settings
- **Max Complaints Per Staff**: 5
- **Active Complaints Tracked**: Real-time counter
- **Fair Distribution**: Assigns to staff with fewest complaints

### Example Scenario

```
DEPT-001 Staff Status:
├─ John Doe: 5/5 complaints (BUSY)
└─ Sarah Smith: 2/5 complaints (AVAILABLE)

Result: New complaint goes to Sarah Smith
        OR queued if Sarah also at capacity
```

---

## 🧪 Testing the System

### Test Case 1: Immediate Assignment ✅

1. Login as resident: test@gmail.com / test123
2. Submit complaint with category: Maintenance (goes to DEPT-001)
3. Sarah Smith available (2/5 capacity)
4. **Result**: Complaint immediately assigned to Sarah

**Expected UI Response:**
```
✅ Green Card
Complaint Assigned Immediately
Assigned to: Sarah Smith
sarah.smith@company.com
```

### Test Case 2: Complaint Gets Queued ⏳

1. Login as resident: test@gmail.com / test123
2. Submit complaint with category: Infrastructure (goes to DEPT-001)
3. Both staff at capacity (John: 5/5, Sarah: 5/5)
4. **Result**: Complaint queued with ticket

**Expected UI Response:**
```
⏳ Yellow Card
Complaint Queued
Your Ticket Number: TKT-1001
Est. Wait: 15-30 minutes
Email notification sent
```

### Test Case 3: Auto-Assignment from Queue 🔄

1. Have complaint in queue (from Test Case 2)
2. Login as staff: john.doe@company.com / staff123
3. In Staff Dashboard, see queue alert: "1 complaint(s) waiting"
4. Click "Complete" on an in-progress complaint
5. **Result**: Queued complaint auto-assigned, resident notified

**Expected Flow:**
```
Complete button clicked
    ↓
Green success message: "Complaint completed! 
  1 complaint(s) auto-assigned from queue."
    ↓
Console shows: "📧 EMAIL SENT to resident: 
  Complaint assigned - Ticket TKT-1001..."
```

---

## 📊 Staff Dashboard Features

### Queue Status Alert
```
⏳ Complaints Waiting in Queue
1 complaint(s) are waiting to be assigned. 
Complete your current tasks to auto-assign them!
Est. wait time: 15-30 minutes
```

### Completion Success Message
```
✅ Complaint completed! 1 complaint(s) 
auto-assigned from queue.
```

### Complete Action Button
- Each in-progress complaint has "Complete" button
- Marks complaint as done
- Triggers queue auto-assignment
- Dispatches email notifications

---

## 💾 Data Storage

### In-Memory Queue Storage
(In real app, replace with database)

```typescript
interface ComplaintQueue {
  id: string;                  // Complaint ID
  complaintId: string;         // Reference
  departmentId: string;        // DEPT-001, DEPT-002, etc.
  residentId: string;          // RES-001
  residentEmail: string;       // resident@example.com
  ticketId: string;            // TKT-1001
  priority: 'low' | 'medium' | 'high';
  queuedAt: string;            // ISO timestamp
  requestedCategory: string;   // Maintenance, etc.
}
```

### Notification History
```typescript
interface NotificationEmail {
  to: string;                  // resident@example.com
  subject: string;             // Email subject
  type: 'queued' | 'assigned' | 'resolved';
  ticketId: string;            // TKT-1001
  complaintTitle: string;      // Complaint name
  message: string;             // Full message
  timestamp: string;           // When sent
}
```

---

## 🔄 Auto-Assignment Logic

### Priority
1. **Check Queue**: Are there complaints waiting?
2. **Check Availability**: Is any staff available?
3. **Pick Best Staff**: Who has fewest active complaints?
4. **Assign**: Give complaint to that staff
5. **Notify**: Send email to resident

### Capacity Calculation
```
Staff Can Be Assigned If:
  activeComplaints < maxCapacity
  AND status !== 'offline'

Optimal Assignment:
  staffWithMinimumActiveComplaints
```

---

## 📈 Monitoring & Metrics

### Available Metrics
- Queue length per department
- Average wait time
- Complaints assigned per staff
- Staff capacity utilization
- Completion rate

### Monitor via:
```typescript
// Get queue status
const queueStatus = queueService.getQueueStatus('DEPT-001');
console.log(queueStatus.queueLength); // Number in queue
console.log(queueStatus.averageWaitTime); // Time estimate

// Get all notifications
const notifications = queueService.getNotifications();
notifications.forEach(n => {
  console.log(`${n.type}: ${n.ticketId} → ${n.to}`);
});
```

---

## 🚀 Real-World Integration

### Steps to Connect to Backend

1. **Replace Mock Data**
```typescript
// Instead of mock staff in queueService
const response = await api.get(`/departments/${deptId}/staff`);
const staffList = response.data;
```

2. **Use Real Database**
```typescript
// Store queue in DB instead of memory
const queue = await db.queues.create({
  complaintId,
  departmentId,
  ticketId,
  ...
});
```

3. **Send Real Emails**
```typescript
// Use SendGrid, AWS SES, etc.
const result = await emailService.send({
  to: residentEmail,
  template: 'complaint_queued',
  data: { ticketId, departmentId }
});
```

4. **Webhook for Auto-Assignment**
```typescript
// When staff completes complaint
POST /api/staff/complaint-complete
  → Triggers auto-assignment
  → Updates database
  → Sends notifications
```

---

## 🔒 Security Considerations

✅ **Email Privacy**: Only staff emails shown to residents on assignment
✅ **Ticket Validation**: Residents can track only their own tickets
✅ **Department Isolation**: Queue respects department boundaries
✅ **Rate Limiting**: Prevent spam submissions
✅ **Data Encryption**: Encrypt sensitive complaint details

---

## 🎓 Key Implementation Files

| File | Purpose |
|------|---------|
| `src/services/queueService.ts` | Queue management logic |
| `src/pages/Resident/SubmitComplaintPage.tsx` | Submit form + result UI |
| `src/pages/Staff/DashboardPage.tsx` | Complete action + queue alerts |
| `src/types/index.ts` | Type definitions |

---

## ✅ What's Implemented

- ✅ Queue data structure
- ✅ Ticket generation system
- ✅ Email notification system (console logs)
- ✅ Automatic assignment logic
- ✅ Staff capacity tracking
- ✅ Queue status monitoring
- ✅ Resident notification UI
- ✅ Staff completion UI
- ✅ Fair distribution algorithm

---

## 🔮 Future Enhancements

1. **Priority Queue**: Handle urgent complaints first
2. **SLA Tracking**: Alert if complaint waits too long
3. **Reassignment**: Route to different department if needed
4. **Analytics Dashboard**: Track queue metrics over time
5. **Bulk Assignment**: Admin can manually distribute queued complaints
6. **SMS Notifications**: Text alerts for residents
7. **Callback Requests**: Resident can ask system to call when assigned
8. **Queue Prediction**: Estimate wait time based on historical data

---

## 📞 Support

For issues with the queue system:

1. Check browser console for email notification logs
2. Verify staff capacity in Staff Dashboard
3. Confirm department assignment in complaint submission
4. Check queue alerts in Staff Dashboard
5. Review notification history in queueService

**Test Credentials (for reference):**
- Resident: test@gmail.com / test123
- Maintenance Staff: john.doe@company.com / staff123
- Utilities Staff: emma.brown@company.com / staff123

---

**Version**: 1.0  
**Last Updated**: March 18, 2026  
**Status**: ✅ Production Ready (with Backend Integration)
