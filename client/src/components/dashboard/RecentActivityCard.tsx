import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import { RecentActivity } from '@/types/dashboard.type';
import { formatDistanceToNow } from 'date-fns';

interface RecentActivityCardProps {
  activities: RecentActivity[];
}

const RecentActivityCard = ({ activities }: RecentActivityCardProps) => {
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No recent activity</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <article className="flex flex-col gap-1">
                <span className="font-medium text-sm">{activity.title}</span>
                <span className="text-xs text-muted-foreground">
                  {activity.description}
                </span>
              </article>
              <aside className="flex flex-col items-end gap-1">
                <StatusBadge status={activity.status} />
                <time className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(activity.timestamp), {
                    addSuffix: true,
                  })}
                </time>
              </aside>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default RecentActivityCard;
