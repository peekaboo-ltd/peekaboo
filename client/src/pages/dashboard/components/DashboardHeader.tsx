import { useState } from 'react';
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
}

const DashboardHeader = ({
  userName,
  role,
  actions = [],
  variants,
}: DashboardHeaderProps) => {
  const { t } = useI18n();

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [startDate, setStartDate] = useState<Date | undefined>(thirtyDaysAgo);
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());

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
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <h1 className="mt-4 text-[2rem] font-bold tracking-[-0.04em] text-slate-950 sm:text-[2.35rem]">
              Dashboard
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600 sm:text-[15px]">
              {userName ? `${t('dashboard.welcome', { name: userName })}. ` : ''}
              {description}
            </p>

            {actions.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">
                {actions.slice(0, 3).map((action) => (
                  <Link
                    key={action.label}
                    to={action.to}
                    className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-normal text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
                  >
                    <FontAwesomeIcon icon={action.icon} className="text-xs text-slate-500" />
                    {action.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="grid gap-3 sm:min-w-[20rem]">
            <div className="grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
              <div className="w-full">
                <DatePicker
                  value={startDate}
                  onChange={(e) => setStartDate(e as unknown as Date)}
                  placeholder="Start date"
                  toDate={endDate}
                />
              </div>
              <span className="hidden text-center text-sm text-slate-400 sm:block">—</span>
              <div className="w-full">
                <DatePicker
                  value={endDate}
                  onChange={(e) => setEndDate(e as unknown as Date)}
                  placeholder="End date"
                  fromDate={startDate}
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="outline" size="sm" className="h-10 gap-2 rounded-md px-4">
                <FontAwesomeIcon icon={faFileLines} className="text-xs" />
                Export
              </Button>
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
