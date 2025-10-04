import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '../ui/card';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';
import {
  Clock,
  CheckCircle,
  XCircle,
  Package,
  Truck,
  User,
  FileText,
  Activity,
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    role: string;
  };
  metadata?: Record<string, any>;
}

interface ActivityTimelineProps {
  orderId: string;
}

// Mock data - replace with actual API call
const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'order_created',
    description: 'Order created',
    timestamp: new Date('2024-01-10T10:00:00'),
    user: { name: 'John Doe', role: 'Customer' },
  },
  {
    id: '2',
    type: 'status_changed',
    description: 'Status changed to CONFIRMED',
    timestamp: new Date('2024-01-10T10:30:00'),
    user: { name: 'Admin User', role: 'Admin' },
    metadata: { from: 'CREATED', to: 'CONFIRMED' },
  },
  {
    id: '3',
    type: 'rider_assigned',
    description: 'Rider assigned to order',
    timestamp: new Date('2024-01-10T11:00:00'),
    user: { name: 'Admin User', role: 'Admin' },
    metadata: { riderName: 'Mike Wilson' },
  },
  {
    id: '4',
    type: 'status_changed',
    description: 'Status changed to IN_TRANSIT',
    timestamp: new Date('2024-01-10T12:00:00'),
    user: { name: 'Mike Wilson', role: 'Rider' },
    metadata: { from: 'CONFIRMED', to: 'IN_TRANSIT' },
  },
];

const activityIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  order_created: Package,
  status_changed: Activity,
  rider_assigned: User,
  assignment_accepted: CheckCircle,
  assignment_rejected: XCircle,
  order_delivered: Truck,
  order_completed: CheckCircle,
  order_cancelled: XCircle,
  default: FileText,
};

const activityColors: Record<string, string> = {
  order_created: 'bg-blue-500',
  status_changed: 'bg-yellow-500',
  rider_assigned: 'bg-purple-500',
  assignment_accepted: 'bg-green-500',
  assignment_rejected: 'bg-red-500',
  order_delivered: 'bg-green-500',
  order_completed: 'bg-green-500',
  order_cancelled: 'bg-red-500',
  default: 'bg-gray-500',
};

export const ActivityTimeline: React.FC<ActivityTimelineProps> = ({ orderId }) => {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, [orderId]);

  const fetchActivities = async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      // const data = await orderActivityService.getActivities(orderId);
      // setActivities(data);
      
      // Using mock data for now
      setTimeout(() => {
        setActivities(mockActivities);
        setIsLoading(false);
      }, 1000);
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch activities');
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    const Icon = activityIcons[type] || activityIcons.default;
    return Icon;
  };

  const getActivityColor = (type: string) => {
    return activityColors[type] || activityColors.default;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-48" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex gap-4">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Activity Timeline</CardTitle>
        <CardDescription>
          Track all activities and status changes for this order
        </CardDescription>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">
            No activities recorded yet
          </p>
        ) : (
          <div className="space-y-4">
            {activities.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              const color = getActivityColor(activity.type);
              const isLast = index === activities.length - 1;

              return (
                <div key={activity.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full text-white',
                        color
                      )}
                    >
                      <Icon className="h-5 w-5" />
                    </div>
                    {!isLast && (
                      <div className="w-px flex-1 bg-gray-200 dark:bg-gray-700" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium">{activity.description}</p>
                        {activity.metadata && (
                          <div className="mt-1 space-y-1">
                            {activity.metadata.from && activity.metadata.to && (
                              <p className="text-sm text-muted-foreground">
                                <Badge variant="outline" className="mr-2">
                                  {activity.metadata.from}
                                </Badge>
                                →
                                <Badge variant="outline" className="ml-2">
                                  {activity.metadata.to}
                                </Badge>
                              </p>
                            )}
                            {activity.metadata.riderName && (
                              <p className="text-sm text-muted-foreground">
                                Assigned to: {activity.metadata.riderName}
                              </p>
                            )}
                          </div>
                        )}
                        <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(activity.timestamp, 'PPp')}
                          </span>
                          {activity.user && (
                            <span className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {activity.user.name} ({activity.user.role})
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};