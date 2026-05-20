export const getSLAStatus = (complaint: any) => {
  if (['resolved', 'closed'].includes(complaint.status)) {
    return { label: 'Completed', type: 'neutral' };
  }

  const now = new Date();
  const deadline = new Date(complaint.slaDeadline);
  const hoursLeft = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursLeft < 0) {
    return { label: 'Breached', type: 'danger' };
  }

  if (hoursLeft <= 2) {
    return { label: 'At Risk', type: 'warning' };
  }

  return { label: 'On Track', type: 'success' };
};
