import React from 'react';

interface StatusBadgeProps {
  status: string;
  variant?: 'success' | 'danger' | 'warning' | 'info' | 'default';
}

const statusVariants: Record<string, { bg: string; text: string }> = {
  success: { bg: 'bg-green-100', text: 'text-green-800' },
  danger: { bg: 'bg-red-100', text: 'text-red-800' },
  warning: { bg: 'bg-yellow-100', text: 'text-yellow-800' },
  info: { bg: 'bg-blue-100', text: 'text-blue-800' },
  default: { bg: 'bg-gray-100', text: 'text-gray-800' },
};

export const StatusBadge: React.FC<StatusBadgeProps> = ({ 
  status, 
  variant = 'default' 
}) => {
  const styles = statusVariants[variant] || statusVariants.default;

  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${styles.bg} ${styles.text}`}>
      {status}
    </span>
  );
};
