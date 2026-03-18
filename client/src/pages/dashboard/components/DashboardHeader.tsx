import { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBolt, faFileExport } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { RoleTypes } from '@/types/auth.type';
import { useI18n } from '@/i18n/i18n';
import { Button } from '@/components/ui/button';
import DatePicker from '@/components/inputs/DatePicker';
import type { DashboardActionLink } from '@/types/dashboard.type';

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
      <div className="overflow-hidden rounded-[32px] border border-[rgba(148,163,184,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(246,249,252,0.95))] p-5 shadow-[0_28px_80px_-52px_rgba(15,23,42,0.45)] sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <span className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-700">
              <FontAwesomeIcon icon={faBolt} className="text-[10px]" />
              Operations overview
            </span>
            <h1 className="mt-4 text-[2rem] font-semibold tracking-[-0.04em] text-slate-950 sm:text-[2.35rem]">
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
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition-colors duration-200 hover:border-slate-300 hover:bg-slate-50"
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
              <Button variant="outline" size="sm" className="h-11 gap-2 rounded-full px-4">
                <FontAwesomeIcon icon={faFileExport} className="text-xs" />
                Export
              </Button>
              {actions[0] && (
                <Button
                  asChild
                  size="sm"
                  className="h-11 rounded-full bg-[#2563eb] px-5 text-white hover:bg-[#1d4ed8]"
                >
                  <Link to={actions[0].to}>
                    <FontAwesomeIcon icon={actions[0].icon} className="text-xs" />
                    {actions[0].label}
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
