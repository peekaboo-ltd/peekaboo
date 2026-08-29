import type { LucideIcon } from 'lucide-react';
import type { LandingStats } from '@/types/landing.type';
import PublicIconBadge, { publicAccentAt } from '@/components/public/PublicIconBadge';

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
    <section className="section-rhythm w-full border-(--line) bg-(--paper)">
      <article className="app-container">
        <header className="mb-8 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <hgroup>
            <p className="type-eyebrow">
              Why Peekaboo
            </p>
            <h2 className="type-h2 mt-2">
              The trusted way
              <br />
              to send.
            </h2>
          </hgroup>
          {stats.length > 0 && (
            <dl className="grid grid-cols-2 gap-x-8 gap-y-3 text-muted-foreground">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <dt className="text-xs font-normal">
                    {stat.label}
                  </dt>
                  <dd className="mt-1 text-[18px] font-normal text-foreground">
                    {stat.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </header>

        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, index) => {
            const Icon = item.icon;
            return (
              <li key={item.title} className="rounded-md border border-(--line) p-6">
                <PublicIconBadge icon={Icon} tone={publicAccentAt(index)} />
                <h3 className="type-label mt-3">
                  {item.title}
                </h3>
                <p className="mt-1.5 text-sm font-normal leading-relaxed text-muted-foreground">
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
