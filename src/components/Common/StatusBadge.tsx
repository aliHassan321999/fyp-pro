import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'status' | 'priority' | 'custom';
  color?: string;
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  status,
  variant = 'status',
  color = 'bg-blue-100 text-blue-800',
  className = '',
}) => {
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${color} ${className}`}
    >
      {status}
    </span>
  );
};

export default StatusBadge;
