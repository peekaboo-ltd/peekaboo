import { motion, Variants } from 'framer-motion';
import { RoleTypes } from '@/types/auth.type';
import OrderSearchBar from '@/components/dashboard/OrderSearchBar';
import { useI18n } from '@/i18n/i18n';

interface DashboardHeaderProps {
  userName?: string | null;
  role?: RoleTypes;
  variants?: Variants;
}

const DashboardHeader = ({ userName, role, variants }: DashboardHeaderProps) => {
  const { t } = useI18n();

  return (
    <motion.header
      className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white/90 px-5 py-6 shadow-[0_18px_40px_-30px_rgba(15,23,42,0.45)] sm:px-7"
      variants={variants}
    >
      <div className="pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-primary/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-10 left-6 h-28 w-28 rounded-full bg-emerald-200/40 blur-3xl" />

      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Overview</p>
          <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
            {userName
              ? t('dashboard.welcome', { name: userName })
              : t('dashboard.welcomeDefault')}
          </h1>
          <p className="mt-2 text-sm text-slate-600 sm:text-base">
            {role === RoleTypes.ADMIN || role === RoleTypes.STAFF
              ? t('dashboard.platformOverview')
              : t('dashboard.accountOverview')}
          </p>
        </div>
        <div className="w-full sm:max-w-xs">
          <OrderSearchBar placeholder={t('dashboard.searchPlaceholder')} />
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
