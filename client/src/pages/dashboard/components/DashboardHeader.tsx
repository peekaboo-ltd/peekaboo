import { motion, type Variants } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { RoleTypes } from '@/types/auth.type';
import { useI18n } from '@/i18n/i18n';
import DatePicker from '@/components/inputs/DatePicker';
import type { DashboardActionLink } from '@/types/dashboard.type';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import Button from '@/components/inputs/Button';

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
        ? t('dashboard.header.riderDescription')
        : role === RoleTypes.BUSINESS
          ? t('dashboard.header.businessDescription')
          : t('dashboard.header.customerDescription');

  return (
    <motion.header className="w-full" variants={variants}>
      <div className="overflow-hidden rounded-xl bg-(--surface)">
        <div className="border-b border-(--line) px-5 py-4 sm:px-6">
          <p className="type-eyebrow">
            {t('dashboard.header.commandCenter')}
          </p>
          <div className="mt-3 flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <h1 className="type-display">
                {t('nav.dashboard')}
              </h1>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-(--muted) sm:text-[15px]">
                {userName ? `${t('dashboard.welcome', { name: userName })}. ` : ''}
                {description}
              </p>
            </div>

            {actions.length > 0 && (
              <div className="flex flex-wrap gap-2 xl:max-w-[28rem] xl:justify-end">
                {actions.slice(0, 3).map((action) => (
                  <Button
                    key={action.label}
                    variant='outline'
                    className='border-(--line) bg-(--surface) hover:bg-(--surface-hover)'
                  >
                    <FontAwesomeIcon icon={action.icon} className="type-meta" />
                    {action.label}
                  </Button>
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
                placeholder={t('dashboard.header.startDate')}
                toDate={endDate}
              />
            </div>
            <span className="hidden text-center text-xs text-(--muted) sm:block">
              {t('dashboard.header.to')}
            </span>
            <div className="w-full">
              <DatePicker
                value={endDate}
                onChange={(e) => onEndDateChange?.(e as unknown as Date | undefined)}
                placeholder={t('dashboard.header.endDate')}
                fromDate={startDate}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-start gap-2 xl:justify-end">
            <Button
              variant="outline"
              className='border-(--line) bg-(--surface) hover:bg-(--surface-hover)'
            >
              <FontAwesomeIcon icon={faFileLines} className="type-meta" />
              {t('dashboard.header.export')}
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default DashboardHeader;
