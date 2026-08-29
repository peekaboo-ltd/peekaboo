import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { VehicleStatusData } from '@/types/dashboard.type';
import { useI18n } from '@/i18n/i18n';
import DonutChart from '@/components/charts/DonutChart';

interface VehiclesStatusChartProps {
  data: VehicleStatusData[];
  title?: string;
  utilizationPercentage?: number;
}

const VehiclesStatusChart = ({
  data,
  title,
  utilizationPercentage,
}: VehiclesStatusChartProps) => {
  const { t } = useI18n();

  const total = data.reduce((sum, item) => sum + item.value, 0);
  const onRoadValue = data.find((item) => item.name === 'onRoad')?.value ?? 0;
  const utilization =
    utilizationPercentage ?? (total > 0 ? Math.round((onRoadValue / total) * 100) : 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title ?? t('dashboard.vehiclesStatus')}</CardTitle>
      </CardHeader>
      <DonutChart
        data={data.map((item) => ({
          name: t(`dashboard.${item.name}`),
          value: item.value,
        }))}
        ariaLabel={`Vehicle status: ${utilization}% utilisation across ${total} vehicles`}
        centerValue={`${utilization}%`}
        centerLabel={t('dashboard.utilization')}
      />
    </Card>
  );
};

export default VehiclesStatusChart;
