import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { FleetEfficiencyData } from '@/types/dashboard.type';
import { useI18n } from '@/i18n/i18n';
import DonutChart from '@/components/charts/DonutChart';

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

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>{title ?? t('dashboard.fleetEfficiency')}</CardTitle>
      </CardHeader>
      <DonutChart
        data={data.map((item) => ({
          name: t(`dashboard.${item.name}`),
          value: item.value,
        }))}
        ariaLabel={`Fleet efficiency: ${centerValue}%`}
        centerValue={`${centerValue}%`}
        centerLabel={t('dashboard.efficiency')}
      />
    </Card>
  );
};

export default FleetEfficiencyChart;
