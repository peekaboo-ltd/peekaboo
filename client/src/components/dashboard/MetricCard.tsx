import { Card, CardContent } from '@/components/ui/card';
import { MetricCardData } from '@/types/dashboard.type';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';

const MetricCard = ({ label, value, trend, colorClass, href, icon }: MetricCardData) => {
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
      'text-primary': 'bg-primary/10',
    };
    return colorMap[textColorClass] || 'bg-primary/10';
  };

  const bgColorClass = getBgColorClass(colorClass);
  
  const cardContent = (
    <Card
      className={`group relative overflow-hidden transition-all duration-300 ${
        href
          ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer border-2 hover:border-primary/50'
          : 'hover:shadow-md'
      }`}
    >
      <span
        aria-hidden="true"
        className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity duration-300 ${bgColorClass.replace('/10', '')}`}
      />
      <CardContent className="p-6 relative">
        <header className="flex items-start justify-between mb-4">
          <span className="flex items-center gap-3">
            {icon && (
              <span
                className={`p-2.5 rounded-lg ${bgColorClass} group-hover:scale-110 transition-transform duration-300`}
                aria-hidden="true"
              >
                <FontAwesomeIcon
                  icon={icon}
                  className={`text-lg ${colorClass || 'text-primary'}`}
                  aria-hidden="true"
                />
              </span>
            )}
            <span className="text-sm font-medium text-muted-foreground leading-tight">
              {label}
            </span>
          </span>
          {trend && (
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                trend.isPositive
                  ? 'text-green-700 bg-green-100'
                  : 'text-red-700 bg-red-100'
              }`}
              aria-label={`Trend: ${trend.isPositive ? 'increasing' : 'decreasing'} by ${Math.abs(trend.value)}%`}
            >
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </span>
          )}
        </header>
        <section className="flex items-end justify-between">
          <p
            className={`text-3xl font-bold leading-tight ${
              colorClass || 'text-primary'
            }`}
            aria-label={`${label}: ${typeof value === 'number' ? value.toLocaleString() : value}`}
          >
            {value}
          </p>
          {href && (
            <span
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              aria-hidden="true"
            >
              <FontAwesomeIcon
                icon={faArrowRight}
                className={`text-sm ${colorClass || 'text-primary'} transform group-hover:translate-x-1 transition-transform duration-300`}
                aria-hidden="true"
              />
            </span>
          )}
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
