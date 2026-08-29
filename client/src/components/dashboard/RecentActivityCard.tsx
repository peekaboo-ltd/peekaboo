import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/inputs/StatusBadge';
import { RecentActivity } from '@/types/dashboard.type';
import { useI18n } from '@/i18n/i18n';

interface RecentActivityCardProps {
  activities: RecentActivity[];
}

const RecentActivityCard = ({ activities }: RecentActivityCardProps) => {
  const { t, language } = useI18n();
  if (!activities || activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.activity.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('dashboard.activity.empty')}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('dashboard.activity.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-4">
          {activities.map((activity) => (
            <li
              key={activity.id}
              className="flex items-center justify-between py-2 border-b border-border last:border-0"
            >
              <article className="flex flex-col gap-1">
                <span className="font-normal text-sm">{activity.title}</span>
                <span className="type-meta">
                  {activity.description}
                </span>
              </article>
              <aside className="flex flex-col items-end gap-1">
                <StatusBadge status={activity.status} />
                <time className="type-meta">
                  {new Intl.DateTimeFormat(language, { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(activity.timestamp))}
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
