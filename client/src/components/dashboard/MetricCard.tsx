import { Card, CardContent } from '@/components/ui/card';
import { MetricCardData } from '@/types/dashboard.type';

interface MetricCardProps extends MetricCardData {}

const MetricCard = ({ label, value, trend, colorClass }: MetricCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <header className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-muted-foreground">{label}</span>
          {trend && (
            <span
              className={`text-xs font-medium ${
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              {trend.isPositive ? '+' : ''}
              {trend.value}%
            </span>
          )}
        </header>
        <p className={`text-2xl font-bold ${colorClass || 'text-primary'}`}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </p>
      </CardContent>
    </Card>
  );
};

export default MetricCard;
