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
    className: 'bg-green-100 text-black hover:bg-green-200',
  },
  [UserStatus.INACTIVE]: {
    label: 'Inactive',
    className: 'bg-gray-100 text-black hover:bg-gray-200',
  },
  [UserStatus.SUSPENDED]: {
    label: 'Suspended',
    className: 'bg-red-100 text-black hover:bg-red-200',
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
      variant="secondary"
    >
      {config.label}
    </Badge>
  );
};