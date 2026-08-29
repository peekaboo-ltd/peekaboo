import { motion, Variants } from 'framer-motion';
import { useI18n } from '@/i18n/i18n';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
}

interface DashboardSystemStatusProps {
  services?: ServiceStatus[];
  variants?: Variants;
}

const dotColor: Record<ServiceStatus['status'], string> = {
  operational: 'bg-(--ink)',
  degraded: 'border border-(--ink) bg-transparent',
  outage: 'rotate-45 bg-(--ink)',
};

const DashboardSystemStatus = ({
  services,
  variants,
}: DashboardSystemStatusProps) => {
  const { t } = useI18n();
  const resolvedServices = services ?? [
    { name: t('dashboard.system.orderProcessing'), status: 'operational' as const },
    { name: t('dashboard.system.deliveryApi'), status: 'operational' as const },
    { name: t('dashboard.system.notifications'), status: 'operational' as const },
    { name: t('dashboard.system.payments'), status: 'operational' as const },
  ];
  const allOperational = resolvedServices.every((s) => s.status === 'operational');

  return (
    <motion.div variants={variants}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 py-2">
        {/* Left: overall status indicator */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={`relative inline-flex h-2 w-2 ${allOperational ? 'rounded-full bg-(--ink)' : 'rotate-45 bg-(--ink)'}`}
            />
          </span>
          <span className="type-meta">
            {allOperational ? t('dashboard.system.operational') : t('dashboard.system.disruption')}
          </span>
        </div>

        {/* Right: service list as plain inline text */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {resolvedServices.map((service, i) => (
            <span
              key={service.name}
              className="flex items-center gap-1.5 text-xs text-(--muted)"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor[service.status]}`}
                aria-hidden="true"
              />
              {service.name}
              {i < resolvedServices.length - 1 && (
                <span className="ml-5 hidden sm:inline text-(--muted)" aria-hidden="true">
                  ·
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default DashboardSystemStatus;
