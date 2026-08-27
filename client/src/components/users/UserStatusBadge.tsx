import React from 'react';
import { Badge } from '../ui/badge';
import { UserStatus } from '../../constants/user.constants';
import { cn } from '../../lib/utils';

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

const statusConfig: Record<UserStatus, { 
  label: string; 
  className: string;
}> = {
  [UserStatus.ACTIVE]: {
    label: 'Active',
    className: 'border-(--ink) bg-(--ink) text-(--paper)',
  },
  [UserStatus.INACTIVE]: {
    label: 'Inactive',
    className: 'border-(--line) bg-transparent text-(--muted)',
  },
  [UserStatus.SUSPENDED]: {
    label: 'Suspended',
    className: 'border-(--ink) bg-transparent text-(--ink) line-through',
  },
};

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const config = statusConfig[status];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {status}
      </Badge>
    );
  }

  return (
    <Badge 
      className={cn(config.className, className)}
      variant="outline"
    >
      {config.label}
    </Badge>
  );
};
