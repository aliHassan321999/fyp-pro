import { Complaint } from '../models/complaint.model';
import { ActivityLog } from '../models/activityLog.model';
import { Department } from '../models/department.model';
import { Notification } from '../models/notification.model';

export const startSlaMonitorJob = () => {
  // Run every 5 minutes
  const INTERVAL_MS = 5 * 60 * 1000;

  setInterval(async () => {
    try {
      const now = new Date();
      
      const breachedComplaints = await Complaint.find({
        status: { $ne: 'resolved' }, // Using strictly what was requested
        slaDeadline: { $lt: now },
        slaBreached: false
      });

      for (const complaint of breachedComplaints) {
        complaint.slaBreached = true;
        await complaint.save();

        await ActivityLog.create({
          complaintId: complaint._id,
          action: 'sla_breached',
          // System triggered, using residentId as required performedBy proxy
          performedBy: complaint.residentId,
          metadata: {
            message: "SLA breached"
          }
        });

        const department = await Department.findById(complaint.departmentId);
        if (department && department.headOfDepartment) {
          await Notification.create({
            userId: department.headOfDepartment,
            type: 'sla_breach',
            message: `SLA BREACHED: Complaint #${complaint._id.toString().slice(-6).toUpperCase()} (${complaint.title}) missed its deadline.`
          });
        }

        console.log(`SLA breached for complaint ${complaint._id}`);
      }
    } catch (error) {
      console.error('Error in SLA Monitor Job:', error);
    }
  }, INTERVAL_MS);
};
