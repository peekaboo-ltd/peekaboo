import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import SeriesChart from '@/components/charts/SeriesChart';
import type { ChartDataPoint } from '@/types/dashboard.type';

export default function RevenueLineChart({
  data,
  title = 'Revenue',
}: {
  data: ChartDataPoint[];
  title?: string;
}) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <SeriesChart data={data} kind="line" series={1} ariaLabel={title} />
    </Card>
  );
}
