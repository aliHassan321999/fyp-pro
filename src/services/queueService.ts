import { Complaint, ComplaintQueue, NotificationEmail, Staff } from '@/types/common';

/**
 * Complaint Queue Management Service
 * Handles queuing, ticket generation, auto-assignment, and notifications
 */

class QueueService {
  // In-memory storage (in real app, this would be in a database)
  private complaintQueue: ComplaintQueue[] = [];
  private notificationHistory: NotificationEmail[] = [];
  private ticketCounter: number = 1000;

  /**
   * Generate unique ticket ID (e.g., TKT-1001, TKT-1002)
   */
  generateTicketId(): string {
    this.ticketCounter++;
    return `TKT-${this.ticketCounter}`;
  }

  /**
   * Check if staff in department is available
   */
  isStaffAvailable(departmentId: string, staffList: Staff[]): boolean {
    const departmentStaff = staffList.filter(
      (s) => s.departmentId === departmentId && s.status !== 'offline'
    );

    if (departmentStaff.length === 0) return false;

    // Check if any staff has capacity (not at max)
    return departmentStaff.some((s) => {
      const activeComplaints = s.activeComplaints || 0;
      const maxCapacity = s.maxCapacity || 5; // Default 5 complaints per staff
      return activeComplaints < maxCapacity;
    });
  }

  /**
   * Get available staff members in a department
   */
  getAvailableStaff(departmentId: string, staffList: Staff[]): Staff[] {
    return staffList.filter((s) => {
      if (s.departmentId !== departmentId || s.status === 'offline') return false;
      const activeComplaints = s.activeComplaints || 0;
      const maxCapacity = s.maxCapacity || 5;
      return activeComplaints < maxCapacity;
    });
  }

  /**
   * Get staff with least active complaints (fair distribution)
   */
  getOptimalStaffForAssignment(
    departmentId: string,
    staffList: Staff[]
  ): Staff | null {
    const availableStaff = this.getAvailableStaff(departmentId, staffList);
    if (availableStaff.length === 0) return null;

    // Sort by active complaints (ascending) - assign to least busy
    return availableStaff.sort(
      (a, b) => (a.activeComplaints || 0) - (b.activeComplaints || 0)
    )[0];
  }

  /**
   * Add complaint to queue
   */
  addToQueue(
    complaint: Complaint,
    residentEmail: string,
    staffList: Staff[]
  ): { queued: boolean; ticketId?: string; assignedStaff?: Staff } {
    const availableStaff = this.getOptimalStaffForAssignment(
      complaint.departmentId,
      staffList
    );

    // If staff is available, assign immediately
    if (availableStaff) {
      return {
        queued: false,
        assignedStaff: availableStaff,
      };
    }

    // Staff not available, add to queue
    const ticketId = this.generateTicketId();
    const queueItem: ComplaintQueue = {
      id: complaint.id,
      complaintId: complaint.id,
      departmentId: complaint.departmentId,
      residentId: complaint.residentId,
      residentEmail,
      ticketId,
      priority: complaint.priority,
      queuedAt: new Date().toISOString(),
      requestedCategory: complaint.category,
    };

    this.complaintQueue.push(queueItem);

    // Send queued notification email
    this.sendQueuedNotification(
      residentEmail,
      complaint.title,
      ticketId,
      complaint.departmentId
    );

    return {
      queued: true,
      ticketId,
    };
  }

  /**
   * Check and auto-assign queued complaints when staff becomes available
   */
  processQueueForDepartment(departmentId: string, staffList: Staff[]): string[] {
    const assignedComplaintIds: string[] = [];

    while (this.complaintQueue.length > 0) {
      const availableStaff = this.getOptimalStaffForAssignment(
        departmentId,
        staffList
      );

      if (!availableStaff) {
        // No available staff, stop processing
        break;
      }

      // Get first complaint in queue for this department
      const queueIndex = this.complaintQueue.findIndex(
        (q) => q.departmentId === departmentId
      );

      if (queueIndex === -1) {
        // No queued complaints for this department
        break;
      }

      const queuedItem = this.complaintQueue[queueIndex];

      // Send assignment notification
      this.sendAssignmentNotification(
        queuedItem.residentEmail,
        queuedItem.complaintId,
        queuedItem.ticketId,
        availableStaff
      );

      assignedComplaintIds.push(queuedItem.complaintId);

      // Remove from queue
      this.complaintQueue.splice(queueIndex, 1);

      // Update staff capacity in memory (in real app, update in DB)
      availableStaff.activeComplaints = (availableStaff.activeComplaints || 0) + 1;
    }

    return assignedComplaintIds;
  }

  /**
   * Send queued complaint email notification
   */
  private sendQueuedNotification(
    email: string,
    complaintTitle: string,
    ticketId: string,
    departmentId: string
  ): void {
    const notification: NotificationEmail = {
      to: email,
      subject: `Complaint Queued - Ticket #${ticketId}`,
      type: 'queued',
      ticketId,
      complaintTitle,
      message: `Your complaint "${complaintTitle}" has been received and queued for the ${departmentId} department. 
      All staff are currently busy. Your complaint will be automatically assigned to the next available staff member.
      Please keep your ticket number safe: ${ticketId}`,
      timestamp: new Date().toISOString(),
    };

    this.notificationHistory.push(notification);

    // In real app, send via email service (SendGrid, AWS SES, etc.)
    console.log(
      `📧 EMAIL SENT to ${email}: Complaint queued - Ticket ${ticketId}`
    );
  }

  /**
   * Send assignment notification email
   */
  private sendAssignmentNotification(
    email: string,
    complaintId: string,
    ticketId: string,
    assignedStaff: Staff
  ): void {
    const notification: NotificationEmail = {
      to: email,
      subject: `Complaint Assigned - Ticket #${ticketId}`,
      type: 'assigned',
      ticketId,
      complaintTitle: complaintId,
      message: `Your complaint (Ticket #${ticketId}) has been automatically assigned to ${assignedStaff.firstName} ${assignedStaff.lastName} 
      from the ${assignedStaff.departmentId} department. They will contact you shortly.
      Staff Email: ${assignedStaff.email}`,
      timestamp: new Date().toISOString(),
    };

    this.notificationHistory.push(notification);

    console.log(
      `📧 EMAIL SENT to ${email}: Complaint assigned - Ticket ${ticketId} to ${assignedStaff.firstName}`
    );
  }

  /**
   * Get queue status for a department
   */
  getQueueStatus(departmentId: string): {
    queueLength: number;
    averageWaitTime: string;
    complaints: ComplaintQueue[];
  } {
    const deptQueue = this.complaintQueue.filter(
      (q) => q.departmentId === departmentId
    );

    return {
      queueLength: deptQueue.length,
      averageWaitTime: deptQueue.length > 0 ? '15-30 minutes' : 'No queue',
      complaints: deptQueue,
    };
  }

  /**
   * Get all notifications sent
   */
  getNotifications(): NotificationEmail[] {
    return this.notificationHistory;
  }

  /**
   * Complete complaint and free up staff
   */
  completeComplaint(staffId: string): void {
    // In real app, find staff and decrement active complaints
    console.log(`✅ Complaint completed by staff ${staffId}`);
  }
}

// Export singleton instance
export const queueService = new QueueService();
