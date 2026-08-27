import { motion, type Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from 'react-router-dom';
import { RoleTypes } from '@/types/auth.type';
import { useI18n } from '@/i18n/i18n';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/inputs/DatePicker';
import type { DashboardActionLink } from '@/types/dashboard.type';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';

interface DashboardHeaderProps {
  userName?: string | null;
  role?: RoleTypes;
  actions?: DashboardActionLink[];
  variants?: Variants;
  startDate?: Date;
  endDate?: Date;
  onStartDateChange?: (date?: Date) => void;
  onEndDateChange?: (date?: Date) => void;
}

const DashboardHeader = ({
  userName,
  role,
  actions = [],
  variants,
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DashboardHeaderProps) => {
  const { t } = useI18n();

  const description =
    role === RoleTypes.ADMIN || role === RoleTypes.STAFF
      ? t('dashboard.platformOverview')
      : role === RoleTypes.RIDER
        ? 'Your delivery performance at a glance'
        : role === RoleTypes.BUSINESS
          ? "Your organization's delivery operations"
          : 'Track your deliveries';

  return (
    <motion.header className="w-full" variants={variants}>
      <div className="overflow-hidden rounded-xl border border-[color:var(--line)] bg-[var(--surface)]">
        <div className="border-b border-[color:var(--line)] px-5 py-4 sm:px-6">
          <p className="text-[11px] font-medium text-(--muted)">
            Command center
          </p>
          <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h1 className="text-[2rem] font-medium text-[color:var(--ink)] sm:text-[2.3rem]">
                Dashboard
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted) sm:text-[15px]">
                {userName ? `${t('dashboard.welcome', { name: userName })}. ` : ''}
                {description}
              </p>
            </div>

            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 xl:max-w-[28rem] xl:justify-end">
                {actions.slice(0, 3).map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="inline-flex items-center gap-2 rounded-md border border-[color:var(--line)] bg-[var(--surface)] px-4 py-2 text-sm font-medium text-[color:var(--ink)] transition-colors duration-200 hover:bg-[var(--surface)]"
                  >
                    <FontAwesomeIcon icon={action.icon} className="text-xs text-(--muted)" />
                    {action.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-3 px-5 py-4 sm:px-6 xl:grid-cols-[1fr_auto] xl:items-end">
          <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center xl:min-w-[24rem]">
            <div className="w-full">
              <DatePicker
                value={startDate}
                onChange={(e) => onStartDateChange?.(e as unknown as Date | undefined)}
                placeholder="Start date"
                toDate={endDate}
              />
            </div>
            <span className="hidden text-center text-[11px] text-(--muted) sm:block">
              to
            </span>
            <div className="w-full">
              <DatePicker
                value={endDate}
                onChange={(e) => onEndDateChange?.(e as unknown as Date | undefined)}
                placeholder="End date"
                fromDate={startDate}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
            <Button
              variant="outline"
              size="sm"
              className="h-10 gap-2 rounded-md border-[color:var(--line)] bg-[var(--surface)] px-4 hover:bg-[var(--surface)]"
            >
              <FontAwesomeIcon icon={faFileLines} className="text-xs" />
              Export
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
