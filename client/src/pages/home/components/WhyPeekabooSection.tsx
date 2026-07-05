import type { LucideIcon } from 'lucide-react';
import type { LandingStats } from '@/types/landing.type';

interface WhyItem {
  icon: LucideIcon;
  title: string;
  description: string;
}

interface WhyPeekabooSectionProps {
  items: WhyItem[];
  landingStats?: LandingStats;
  activeCustomersLabel: string;
  completedOrdersLabel: string;
}

const WhyPeekabooSection = ({
  items,
  landingStats,
  activeCustomersLabel,
  completedOrdersLabel,
}: WhyPeekabooSectionProps) => {
  const stats = [
    typeof landingStats?.activeCustomers === 'number'
      ? {
          value: landingStats.activeCustomers.toLocaleString(),
          label: activeCustomersLabel,
        }
      : null,
    typeof landingStats?.customersWithOrders === 'number'
      ? {
          value: landingStats.customersWithOrders.toLocaleString(),
          label: completedOrdersLabel,
        }
      : null,
  ].filter((stat): stat is { value: string; label: string } => stat !== null);

  return (
    <section className="w-full border-t border-[#ececea] bg-white py-12 lg:py-16">
      <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
        <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <hgroup>
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6f76]">
              Why Peekaboo
            </p>
            <h2 className="mt-3 text-[24px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[#0a0a0a] sm:text-[34px]">
              The trusted way
              <br />
              to send.
            </h2>
          </hgroup>
          {stats.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-[#6b6f76]">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-[11px] font-semibold uppercase tracking-[0.08em]">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-[18px] font-extrabold tracking-[-0.02em] text-[#0a0a0a]">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="group border-t border-[#ececea] px-1 py-5 transition-all duration-300 hover:bg-[#f7f6f1] sm:px-5">
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#fff4be] text-[#0a0a0a] transition-all duration-300 group-hover:bg-[#edb100] group-hover:scale-110">
                  <Icon className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-[14px] font-bold tracking-[-0.01em] text-[#0a0a0a]">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-[13px] leading-relaxed text-[#6b6f76]">
                  {item.description}
                </p>
              </li>
            );
          })}
        </ul>
      </article>
    </section>
  );
};

export default WhyPeekabooSection;
