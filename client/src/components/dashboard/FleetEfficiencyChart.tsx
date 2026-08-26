import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FleetEfficiencyData } from '@/types/dashboard.type';
import { useI18n } from '@/i18n/i18n';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from 'recharts';

interface FleetEfficiencyChartProps {
  data: FleetEfficiencyData[];
  title?: string;
  centerValue?: number;
}

const FleetEfficiencyChart = ({
  data,
  title,
  centerValue = 65,
}: FleetEfficiencyChartProps) => {
  const { t } = useI18n();

  const translatedData = data.map((item) => ({
    ...item,
    translatedName: t(`dashboard.${item.name}`),
  }));

  const total = data.reduce((sum, item) => sum + item.value, 0);

  const renderCustomizedLabel = ({
    cx,
    cy,
  }: {
    cx: number;
    cy: number;
  }) => {
    return (
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        dominantBaseline="central"
        className="fill-foreground"
      >
        <tspan
          x={cx}
          dy="-0.5em"
          className="text-2xl font-medium fill-foreground"
        >
          {centerValue}%
        </tspan>
        <tspan
          x={cx}
          dy="1.5em"
          className="text-xs fill-muted-foreground"
        >
          {t('dashboard.lastMonth')}
        </tspan>
      </text>
    );
  };

  const CustomTooltip = ({
    active,
    payload,
  }: {
    active?: boolean;
    payload?: Array<{ payload: FleetEfficiencyData & { translatedName: string } }>;
  }) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      return (
        <div className="rounded-[--radius-control] border border-[--line] bg-[--paper] px-3 py-2 shadow-[var(--shadow-popover)]">
          <p className="text-sm font-medium text-foreground">
            {item.translatedName}
          </p>
          <p className="text-xs text-muted-foreground">
            {item.value} ({Math.round((item.value / total) * 100)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const renderLegend = ({
    payload,
  }: {
    payload?: Array<{
      value: string;
      color: string;
      payload: FleetEfficiencyData & { translatedName: string };
    }>;
  }) => {
    if (!payload) return null;
    return (
      <ul className="flex flex-col gap-2 mt-4">
        {payload.map((entry, index) => (
          <li
            key={`legend-${index}`}
            className="flex items-center justify-between text-sm"
          >
            <span className="flex items-center gap-2">
              <span
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-muted-foreground">
                {entry.payload.translatedName}
              </span>
            </span>
            <span className="font-medium text-foreground">
              {entry.payload.value}
            </span>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Card className="h-full border-[--line] bg-[--paper]">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-medium">
          {title || t('dashboard.fleetEfficiency')}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={translatedData}
                cx="50%"
                cy="45%"
                innerRadius={55}
                outerRadius={80}
                paddingAngle={3}
                dataKey="value"
                labelLine={false}
                label={renderCustomizedLabel}
              >
                {translatedData.map((_entry, index) => (
                  <Cell key={`cell-${index}`} fill={`var(--chart-${(index % 5) + 1})`} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                content={renderLegend}
                verticalAlign="bottom"
                align="center"
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default FleetEfficiencyChart;
