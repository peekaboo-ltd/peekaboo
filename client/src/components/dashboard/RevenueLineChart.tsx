import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ChartDataPoint } from '@/types/dashboard.type';

export default function RevenueLineChart({
  data,
  title = 'Revenue',
}: {
  data: ChartDataPoint[];
  title?: string;
}) {
  return (
    <Card className="border-(--line) bg-(--paper) shadow-none">
      <CardHeader className="px-4 pt-4 pb-2">
        <CardTitle className="text-sm font-medium text-(--ink)">{title}</CardTitle>
      </CardHeader>
      <CardContent className="h-56 sm:h-72 px-4 pb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ left: 0, right: 4, top: 8, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--line)" />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11 }}
              minTickGap={16}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={35} />
            <Tooltip
              contentStyle={{
                background: 'var(--paper)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--radius-control)',
                boxShadow: 'var(--shadow-popover)',
              }}
              labelStyle={{ color: 'var(--ink)' }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke="var(--chart-1)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
