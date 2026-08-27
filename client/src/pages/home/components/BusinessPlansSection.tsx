import { motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import type { BusinessPlan } from '../home.types';
import { containerVariants, itemVariants } from '../home.animations';
import Button from '@/components/inputs/Button';

interface BusinessPlansSectionProps {
  badgeLabel: string;
  title: string;
  subtitle: string;
  popularLabel: string;
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
  ctaLabel,
  detailsCtaLabel = 'View plan details',
  plans,
  isLoading,
}: BusinessPlansSectionProps) => {
  const hasPlans = !isLoading && plans.length > 0;

  return (
    <section id="business-plans" className="section-rhythm w-full border-(--line) bg-(--paper)">
      <motion.article
        className="app-container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <motion.header className="mb-8 max-w-[640px]" variants={itemVariants}>
          <p className="type-eyebrow">
            {badgeLabel}
          </p>
          <h2 className="type-h2 mt-2">
            {title}
          </h2>
          <p className="mt-3 text-sm font-normal leading-relaxed text-muted-foreground">{subtitle}</p>
        </motion.header>

        {isLoading ? (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li
                key={index}
                className="h-[420px] animate-pulse rounded-(--radius-control) border border-border bg-(--surface)"
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
                  className={`group relative flex h-full flex-col p-6 ${
                    plan.isPopular ? 'card-framed border-(--ink)' : 'card-quiet'
                  }`}
                >
                  <header className="flex items-start justify-between gap-4">
                    <hgroup>
                      <h3 className="type-card-title">
                        {plan.name}
                      </h3>
                      <p className="type-meta mt-1.5">
                        {plan.description}
                      </p>
                    </hgroup>
                    {plan.isPopular ? (
                      <span className="invert-surface inline-flex h-6 shrink-0 items-center whitespace-nowrap rounded-(--radius-pill) px-2.5 text-xs font-medium">
                        {popularLabel}
                      </span>
                    ) : null}
                  </header>

                  <section className="mt-4">
                    <p className="type-metric">
                      {plan.price}
                    </p>
                  </section>

                  <ul className="mt-4 flex-1 space-y-2">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="type-meta flex items-start gap-2"
                      >
                        <Check
                          className="mt-0.5 size-3.5 shrink-0 text-(--ink)"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-5 flex flex-col gap-2">
                    <Button
                      route="/contact"
                      variant='primary'
                    >
                      {ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/link:translate-x-1" aria-hidden="true" />
                    </Button>

                    {plan.detailsTo ? (
                      <Button
                      variant='outline'
                        route={plan.detailsTo}
                      >
                        {detailsCtaLabel}
                      </Button>
                    ) : null}
                  </div>
                </article>
              </motion.li>
            ))}
          </motion.ul>
        ) : (
          <p className="rounded-(--radius-control) border border-border bg-(--surface) px-5 py-8 text-sm font-normal text-muted-foreground">
            Business plans are being updated. Contact our team for current pricing.
          </p>
        )}
      </motion.article>
    </section>
  );
};

export default BusinessPlansSection;
