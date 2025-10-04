import React from 'react';
import { Badge } from '../ui/badge';
import { RoleTypes } from '../../types/auth.type';
import { cn } from '../../lib/utils';

interface RoleBadgesProps {
  roles: RoleTypes[];
  className?: string;
}

const roleConfig: Record<RoleTypes, { 
  label: string; 
  className: string;
}> = {
  [RoleTypes.ADMIN]: {
    label: 'Admin',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
  },
  [RoleTypes.RIDER]: {
    label: 'Rider',
    className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
  },
  [RoleTypes.CUSTOMER]: {
    label: 'Customer',
    className: 'bg-green-100 text-green-800 hover:bg-green-200',
  },
  [RoleTypes.STAFF]: {
    label: 'Staff',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
  },
};

export const RoleBadges: React.FC<RoleBadgesProps> = ({ 
  roles, 
  className 
}) => {
  return (
    <div className={cn('flex flex-wrap gap-1', className)}>
      {roles.map((role) => {
        const config = roleConfig[role];
        if (!config) return null;

        return (
          <Badge
            key={role}
            className={config.className}
            variant="secondary"
          >
            {config.label}
          </Badge>
        );
      })}
    </div>
  );
};