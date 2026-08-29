import { Text } from '@react-email/components';
import * as React from 'react';
import { emailFontFamily, emailTokens } from './tokens';

type StatusMeaning = 'active' | 'completed' | 'pending' | 'failed' | 'inactive';

const completed = new Set([
  'COMPLETED',
  'ACCEPTED',
  'DELIVERED',
  'PAID',
  'PAYMENT_DEFERRED',
  'SUCCESSFUL',
  'ACTIVATED',
]);
const pending = new Set([
  'CONFIRMED',
  'PENDING',
  'WAITING',
  'PROCESSING',
  'INVOICED',
  'CREATED',
]);
const active = new Set(['IN_TRANSIT', 'IN_PROGRESS', 'ASSIGNED', 'ACTIVE']);
const failed = new Set([
  'CANCELLED',
  'REJECTED',
  'FAILED',
  'OVERDUE',
  'SUSPENDED',
]);

const getMeaning = (status?: string): StatusMeaning => {
  if (!status) return 'inactive';
  const normalized = status.toUpperCase();
  if (completed.has(normalized)) return 'completed';
  if (pending.has(normalized)) return 'pending';
  if (active.has(normalized)) return 'active';
  if (failed.has(normalized)) return 'failed';
  return 'inactive';
};

const treatments: Record<
  StatusMeaning,
  {
    prefix: string;
    backgroundColor: string;
    color: string;
    border: string;
    textDecoration?: 'line-through';
  }
> = {
  active: {
    prefix: '● ',
    backgroundColor: emailTokens.ink,
    color: emailTokens.paper,
    border: `1px solid ${emailTokens.ink}`,
  },
  completed: {
    prefix: '✓ ',
    backgroundColor: emailTokens.paper,
    color: emailTokens.ink,
    border: `1px solid ${emailTokens.ink}`,
  },
  pending: {
    prefix: '◷ ',
    backgroundColor: emailTokens.warningSurface,
    color: emailTokens.muted,
    border: `1px dashed ${emailTokens.lineStrong}`,
  },
  failed: {
    prefix: '✕ ',
    backgroundColor: emailTokens.dangerSurface,
    color: emailTokens.danger,
    border: `1px solid ${emailTokens.dangerLine}`,
    textDecoration: 'line-through',
  },
  inactive: {
    prefix: '○ ',
    backgroundColor: emailTokens.surface,
    color: emailTokens.muted,
    border: `1px solid ${emailTokens.surface}`,
  },
};

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
  const meaning = getMeaning(status);
  const treatment = treatments[meaning];

  return (
    <Text
      style={{
        backgroundColor: treatment.backgroundColor,
        color: treatment.color,
        border: treatment.border,
        borderRadius: emailTokens.radiusPill,
        padding: '4px 10px',
        fontSize: '12px',
        fontWeight: '500' as const,
        fontFamily: emailFontFamily,
        display: 'inline-block',
        margin: '0',
        textDecoration: treatment.textDecoration,
      }}
    >
      {treatment.prefix}
      {status}
    </Text>
  );
};
