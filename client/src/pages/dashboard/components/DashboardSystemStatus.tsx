import { motion, Variants } from 'framer-motion';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'outage';
}

interface DashboardSystemStatusProps {
  services?: ServiceStatus[];
  variants?: Variants;
}

const defaultServices: ServiceStatus[] = [
  { name: 'Order Processing', status: 'operational' },
  { name: 'Delivery API', status: 'operational' },
  { name: 'Notifications', status: 'operational' },
  { name: 'Payments', status: 'operational' },
];

const dotColor: Record<ServiceStatus['status'], string> = {
  operational: 'bg-emerald-500',
  degraded: 'bg-amber-500',
  outage: 'bg-rose-500',
};

const DashboardSystemStatus = ({
  services = defaultServices,
  variants,
}: DashboardSystemStatusProps) => {
  const allOperational = services.every((s) => s.status === 'operational');

  return (
    <motion.div variants={variants}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between px-1 py-2">
        {/* Left: overall status indicator */}
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2 w-2 shrink-0">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-50 ${
                allOperational ? 'bg-emerald-400' : 'bg-amber-400'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                allOperational ? 'bg-emerald-500' : 'bg-amber-500'
              }`}
            />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:rgba(37,52,63,0.55)]">
            {allOperational ? 'All Systems Operational' : 'Partial Disruption'}
          </span>
        </div>

        {/* Right: service list as plain inline text */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          {services.map((service, i) => (
            <span
              key={service.name}
              className="flex items-center gap-1.5 text-xs text-[color:rgba(37,52,63,0.45)]"
            >
              <span
                className={`h-1.5 w-1.5 rounded-full shrink-0 ${dotColor[service.status]}`}
                aria-hidden="true"
              />
              {service.name}
              {i < services.length - 1 && (
                <span className="ml-5 hidden sm:inline text-[color:rgba(37,52,63,0.2)]" aria-hidden="true">
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
