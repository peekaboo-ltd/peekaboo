import { Card, CardContent } from '@/components/ui/card';
import { MetricCardData } from '@/types/dashboard.type';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts';

const MetricCard = ({
  label,
  value,
  trend,
  colorClass,
  href,
  icon,
  sparklineData,
  sparklineType,
}: MetricCardData) => {
  // Map text color classes to background color classes
  const getBgColorClass = (textColorClass?: string) => {
    if (!textColorClass) return 'bg-primary/10';
    const colorMap: Record<string, string> = {
      'text-blue-600': 'bg-blue-600/10',
      'text-blue-700': 'bg-blue-700/10',
      'text-green-600': 'bg-green-600/10',
      'text-amber-600': 'bg-amber-600/10',
      'text-purple-600': 'bg-purple-600/10',
      'text-pink-600': 'bg-pink-600/10',
      'text-emerald-600': 'bg-emerald-600/10',
      'text-teal-600': 'bg-teal-600/10',
      'text-cyan-600': 'bg-cyan-600/10',
      'text-indigo-600': 'bg-indigo-600/10',
      'text-primary': 'bg-primary/10',
    };
    return colorMap[textColorClass] || 'bg-primary/10';
  };

  // Map text color classes to stroke/fill colors for charts
  const getChartColor = (textColorClass?: string) => {
    if (!textColorClass) return 'hsl(var(--primary))';
    const colorMap: Record<string, string> = {
      'text-blue-600': '#2563eb',
      'text-blue-700': '#1d4ed8',
      'text-green-600': '#16a34a',
      'text-amber-600': '#d97706',
      'text-purple-600': '#9333ea',
      'text-pink-600': '#db2777',
      'text-emerald-600': '#059669',
      'text-teal-600': '#0d9488',
      'text-cyan-600': '#0891b2',
      'text-indigo-600': '#4f46e5',
      'text-primary': 'hsl(var(--primary))',
    };
    return colorMap[textColorClass] || 'hsl(var(--primary))';
  };

  const bgColorClass = getBgColorClass(colorClass);
  const chartColor = getChartColor(colorClass);

  // Format sparkline data for recharts
  const chartData = sparklineData?.map((val, idx) => ({ value: val, index: idx })) || [];

  const renderSparkline = () => {
    if (!sparklineData || sparklineData.length === 0 || !sparklineType) return null;

    return (
      <div className="h-10 w-20 ml-auto">
        <ResponsiveContainer width="100%" height="100%">
          {sparklineType === 'line' ? (
            <LineChart data={chartData}>
              <Line
                type="monotone"
                dataKey="value"
                stroke={chartColor}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          ) : (
            <BarChart data={chartData}>
              <Bar dataKey="value" fill={chartColor} radius={[2, 2, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    );
  };
  
  const cardContent = (
    <Card
      className={`group border border-slate-200 bg-white shadow-none transition-all duration-300 ${
        href
          ? 'hover:-translate-y-0.5 hover:shadow-sm cursor-pointer'
          : 'hover:shadow-sm'
      }`}
    >
      <CardContent className="p-4 sm:p-5 relative">
        <header className="flex items-start justify-between mb-3 sm:mb-4">
          <span className="flex items-center gap-2 sm:gap-3 min-w-0">
            {icon && (
              <span
                className={`p-2 sm:p-2.5 rounded-md ${bgColorClass} group-hover:scale-[1.02] transition-transform duration-300 shrink-0`}
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={icon}
                  className="text-base sm:text-lg text-slate-900"
                  aria-hidden="true"
                />
              </span>
            )}
            <span className="text-xs sm:text-sm font-medium text-slate-500 leading-tight truncate">
              {label}
            </span>
          </span>
          {trend && (
            <span
              className={`text-[10px] sm:text-xs font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                trend.isPositive
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-rose-700 bg-rose-50'
              }`}
              aria-label={`Trend: ${trend.isPositive ? 'increasing' : 'decreasing'} by ${Math.abs(trend.value)}%`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </header>
        <section className="flex items-end justify-between">
          <div className="flex flex-col min-w-0">
            <p
              className="text-2xl sm:text-3xl font-semibold leading-tight text-slate-900 truncate"
              aria-label={`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
            >
              {value}
            </p>
          </div>
          <div className="hidden sm:flex items-center gap-2">
            {renderSparkline()}
            {href && (
              <span
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="text-sm text-slate-700 transform group-hover:translate-x-1 transition-transform duration-300"
                  aria-hidden="true"
                />
              </span>
            )}
          </div>
        </section>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link to={href} className="block">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
};

export default MetricCard;
