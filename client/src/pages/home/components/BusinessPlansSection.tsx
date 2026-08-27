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
    <section id="business-plans" className="section-rhythm w-full border-t border-(--line) bg-(--paper)">
      <motion.article
        className="app-container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <motion.header className="mb-8 max-w-[640px]" variants={itemVariants}>
          <p className="text-[11px] font-normal text-muted-foreground">
            {badgeLabel}
          </p>
          <h2 className="mt-3 text-[24px] font-medium leading-[1.05] text-foreground sm:text-[34px]">
            {title}
          </h2>
          <p className="mt-3 text-[13px] font-normal leading-relaxed text-muted-foreground">{subtitle}</p>
        </motion.header>

        {isLoading ? (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li
                key={index}
                className="h-[420px] animate-pulse rounded-(--radius-control) border border-border bg-[var(--surface)]"
              />
            ))}
          </ul>
        ) : hasPlans ? (
          <motion.ul
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {plans.map((plan) => (
              <motion.li
                key={plan.name}
                variants={itemVariants}
              >
                <article
                  className={`group relative flex h-full flex-col rounded-(--radius-card) border p-6 transition-[background-color,color,border-color] duration-200 ${
                    plan.isPopular
                      ? 'bg-(--paper)'
                      : 'border-border bg-[var(--surface)]'
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
                      <span className="rounded-full bg-[var(--ink)] px-2.5 py-1 text-[11px] font-normal text-[var(--paper)]">
                        {popularLabel}
                      </span>
                    ) : null}
                  </header>

                  <section className="mt-5 pt-4">
                    <p className="text-[22px] font-medium text-foreground">
                      {plan.price}
                    </p>
                    <p className="mt-1 text-[11px] font-normal text-muted-foreground">
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
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--surface-hover)] transition-transform duration-200"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      to="/contact"
                      className={`group/link inline-flex items-center justify-center gap-2 rounded-(--radius-control) px-4 py-2.5 text-[13px] font-normal transition-[background-color,color,border-color,box-shadow] duration-200 ${
                        plan.isPopular
                          ? 'bg-[var(--ink)] text-(--paper) hover:bg-[var(--surface-hover)]'
                          : 'bg-[var(--ink)] text-[var(--paper)] hover:bg-[var(--surface-hover)]'
                      }`}
                    >
                      {ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden="true" />
                    </Link>

                    {plan.detailsTo ? (
                      <Link
                        to={plan.detailsTo}
                        className="inline-flex items-center justify-center rounded-(--radius-control) border border-border bg-[var(--surface)] px-4 py-2 text-[12px] font-normal text-foreground transition-[background-color,color,border-color,box-shadow] duration-200 hover:bg-[var(--surface)] hover:border-border"
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
          <p className="rounded-(--radius-control) border border-border bg-[var(--surface)] px-5 py-8 text-[13px] font-normal text-muted-foreground">
            Business plans are being updated. Contact our team for current pricing.
          </p>
        )}
      </motion.article>
    </section>
  );
};

export default BusinessPlansSection;
