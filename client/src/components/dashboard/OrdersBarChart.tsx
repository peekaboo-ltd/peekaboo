import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import SeriesChart from '@/components/charts/SeriesChart';
import type { ChartDataPoint } from '@/types/dashboard.type';

export default function OrdersBarChart({
  data,
  title = 'Orders',
}: {
  data: ChartDataPoint[];
  title?: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <SeriesChart data={data} kind="bar" series={2} ariaLabel={title} />
    </Card>
  );
}
