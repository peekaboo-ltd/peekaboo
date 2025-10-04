import React from 'react';
import { Badge } from '../ui/badge';
import { OrderType } from '../../types/order.type';
import { cn } from '../../lib/utils';
import { Send, Package } from 'lucide-react';

interface OrderTypeBadgeProps {
  type: keyof typeof OrderType;
  className?: string;
}

const typeConfig: Record<keyof typeof OrderType, { 
  label: string; 
  className: string;
  icon: React.ComponentType<{ className?: string }>;
}> = {
  SEND: {
    label: 'Send',
    className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
    icon: Send,
  },
  RECEIVE: {
    label: 'Receive',
    className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
    icon: Package,
  },
};

export const OrderTypeBadge: React.FC<OrderTypeBadgeProps> = ({ 
  type, 
  className 
}) => {
  const config = typeConfig[type];

  if (!config) {
    return (
      <Badge variant="outline" className={className}>
        {type}
      </Badge>
    );
  }

  const Icon = config.icon;

  return (
    <Badge 
      className={cn(config.className, 'gap-1', className)}
      variant="secondary"
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};