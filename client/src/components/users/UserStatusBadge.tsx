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
    className: 'invert-surface border-transparent',
  },
  [UserStatus.INACTIVE]: {
    label: 'Inactive',
    className: 'border-(--line) bg-transparent text-(--muted)',
  },
  // Active is the ordinary state and stays ink; only the one that is a
  // consequence takes color.
  [UserStatus.SUSPENDED]: {
    label: 'Suspended',
    className: 'border-(--danger-line) bg-(--danger-surface) text-(--danger)',
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
