import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BusinessPlan } from '../home.types';
import { containerVariants, itemVariants } from '../home.animations';

interface BusinessPlansSectionProps {
  badgeLabel: string;
  title: string;
  subtitle: string;
  popularLabel: string;
  perMonthLabel: string;
  ctaLabel: string;
  detailsCtaLabel?: string;
  plans: BusinessPlan[];
  isLoading?: boolean;
}

const BusinessPlansSection = ({
  badgeLabel,
  title,
  subtitle,
  popularLabel,
  perMonthLabel,
  ctaLabel,
  detailsCtaLabel = 'View plan details',
  plans,
  isLoading,
}: BusinessPlansSectionProps) => {
  const hasPlans = !isLoading && plans.length > 0;

  return (
    <section id="business-plans" className="w-full bg-[var(--peekaboo-surface)] py-12 lg:py-16">
      <motion.article
        className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <motion.header className="mb-8 max-w-[640px]" variants={itemVariants}>
          <p className="text-[11px] font-normal uppercase text-muted-foreground">
            {badgeLabel}
          </p>
          <h2 className="mt-3 text-[24px] font-semibold leading-[1.05] text-foreground sm:text-[34px]">
            {title}
          </h2>
          <p className="mt-3 text-[13px] font-normal leading-relaxed text-muted-foreground">{subtitle}</p>
        </motion.header>

        {isLoading ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li
                key={index}
                className="h-[420px] animate-pulse rounded-md border border-border bg-[var(--peekaboo-surface)]"
              />
            ))}
          </ul>
        ) : hasPlans ? (
          <motion.ul
            className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {plans.map((plan) => (
              <motion.li
                key={plan.name}
                variants={itemVariants}
                className={plan.isPopular ? 'lg:-mt-2' : undefined}
              >
                <article
                  className={`group relative flex h-full flex-col rounded-md border p-5 transition-all duration-300 ${
                    plan.isPopular
                      ? 'bg-white shadow-md hover:shadow-xl'
                      : 'border-border bg-[var(--peekaboo-surface)]'
                  }`}
                >
                  <header className="flex items-start justify-between gap-4">
                    <hgroup>
                      <h3 className="text-[16px] font-normal text-foreground">
                        {plan.name}
                      </h3>
                      <p className="mt-1.5 text-[12px] font-normal leading-relaxed text-muted-foreground">
                        {plan.description}
                      </p>
                    </hgroup>
                    {plan.isPopular ? (
                      <span className="rounded-full bg-[#edb100] px-2.5 py-1 text-[8px] font-normal uppercase text-[#0a0a0a]">
                        {popularLabel}
                      </span>
                    ) : null}
                  </header>

                  <section className="mt-5 pt-4">
                    <p className="text-[22px] font-semibold text-foreground">
                      {plan.price}
                    </p>
                    <p className="mt-1 text-[11px] font-normal uppercase text-muted-foreground">
                      {perMonthLabel}
                    </p>
                  </section>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[12.5px] font-normal leading-relaxed text-muted-foreground"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#d49e00] transition-transform duration-300 group-hover:scale-110"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      to="/contact"
                      className={`group/link inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-normal transition-all duration-300 ${
                        plan.isPopular
                          ? 'bg-[#0a0a0a] text-white hover:bg-[#1c1c1c] hover:shadow-[0_4px_12px_-2px_rgba(10,10,10,0.3)]'
                          : 'bg-[#edb100] text-[#0a0a0a] hover:bg-[#d49e00] hover:shadow-[0_4px_12px_-2px_rgba(237,177,0,0.3)]'
                      }`}
                    >
                      {ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:translate-x-1" aria-hidden="true" />
                    </Link>

                    {plan.detailsTo ? (
                      <Link
                        to={plan.detailsTo}
                        className="inline-flex items-center justify-center rounded-md border border-border bg-[var(--peekaboo-surface)] px-4 py-2 text-[12px] font-normal text-foreground transition-all duration-300 hover:bg-[var(--peekaboo-warm)] hover:border-border"
                      >
                        {detailsCtaLabel}
                      </Link>
                    ) : null}
                  </div>
                </article>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <p className="rounded-md border border-border bg-[var(--peekaboo-surface)] px-5 py-8 text-[13px] font-normal text-muted-foreground">
            Business plans are being updated. Contact our team for current pricing.
          </p>
        )}
      </motion.article>
    </section>
  );
};

export default BusinessPlansSection;
