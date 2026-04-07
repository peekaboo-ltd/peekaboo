import { Text } from '@react-email/components';
import * as React from 'react';

interface StatusBadgeProps {
  status: string;
}

const statusColors: Record<string, { bg: string; text: string }> = {
  CREATED: { bg: '#e3f2fd', text: '#1565c0' },
  PENDING: { bg: '#fff3e0', text: '#e65100' },
  CONFIRMED: { bg: '#e8f5e9', text: '#2e7d32' },
  ACCEPTED: { bg: '#e8f5e9', text: '#2e7d32' },
  PAID: { bg: '#e8f5e9', text: '#2e7d32' },
  ACTIVE: { bg: '#e3f2fd', text: '#1565c0' },
  IN_TRANSIT: { bg: '#fff3e0', text: '#e65100' },
  DELIVERED: { bg: '#e8f5e9', text: '#2e7d32' },
  COMPLETED: { bg: '#e8f5e9', text: '#2e7d32' },
  CANCELLED: { bg: '#ffebee', text: '#c62828' },
  FAILED: { bg: '#ffebee', text: '#c62828' },
  SUCCESSFUL: { bg: '#e8f5e9', text: '#2e7d32' },
  INVOICED: { bg: '#fff3e0', text: '#e65100' },
  OVERDUE: { bg: '#ffebee', text: '#c62828' },
  SUSPENDED: { bg: '#ffebee', text: '#c62828' },
  ACTIVATED: { bg: '#e8f5e9', text: '#2e7d32' },
};

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const colors = statusColors[status.toUpperCase()] || {
    bg: '#f5f5f5',
    text: '#616161',
  };

  return (
    <Text
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: '500' as const,
        display: 'inline-block',
        margin: '0',
      }}
    >
      {status}
    </Text>
  );
};
