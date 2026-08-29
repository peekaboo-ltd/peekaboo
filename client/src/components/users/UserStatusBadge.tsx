import React from 'react';
import { Badge } from '../ui/badge';
import { UserStatus } from '../../constants/user.constants';
import { cn } from '../../lib/utils';
import { useI18n } from '@/i18n/i18n';

interface UserStatusBadgeProps {
  status: UserStatus;
  className?: string;
}

const statusConfig: Record<UserStatus, {
  labelKey: string;
  className: string;
}> = {
  [UserStatus.ACTIVE]: {
    labelKey: 'status.active',
    className: 'invert-surface border-transparent',
  },
  [UserStatus.INACTIVE]: {
    labelKey: 'status.inactive',
    className: 'border-(--line) bg-transparent text-(--muted)',
  },
  // Active is the ordinary state and stays ink; only the one that is a
  // consequence takes color.
  [UserStatus.SUSPENDED]: {
    labelKey: 'status.suspended',
    className: 'border-(--danger-line) bg-(--danger-surface) text-(--danger)',
  },
};

export const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ 
  status, 
  className 
}) => {
  const { t } = useI18n();
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
      {t(config.labelKey)}
    </Badge>
  );
};
