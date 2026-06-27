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
    <section id="business-plans" className="w-full border-t border-[#ececea] bg-white py-10 lg:py-14">
      <motion.article
        className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <motion.header className="mb-8 max-w-[640px]" variants={itemVariants}>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6f76]">
            {badgeLabel}
          </p>
          <h2 className="mt-3 text-[24px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[#0a0a0a] sm:text-[34px]">
            {title}
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-[#6b6f76]">{subtitle}</p>
        </motion.header>

        {isLoading ? (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li
                key={index}
                className="h-[420px] animate-pulse rounded-[12px] border border-[#ececea] bg-[var(--peekaboo-warm)]"
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
                  className={`home-card-interactive flex h-full flex-col rounded-[12px] border p-5 ${
                    plan.isPopular
                      ? 'border-[#ffc400] bg-[#fffdf5] shadow-[0_0_0_1px_rgba(255,196,0,0.25)]'
                      : 'border-[#ececea] bg-[var(--peekaboo-warm)]'
                  }`}
                >
                  <header className="flex items-start justify-between gap-4">
                    <hgroup>
                      <h3 className="text-[16px] font-bold tracking-[-0.01em] text-[#0a0a0a]">
                        {plan.name}
                      </h3>
                      <p className="mt-1.5 text-[12px] leading-relaxed text-[#6b6f76]">
                        {plan.description}
                      </p>
                    </hgroup>
                    {plan.isPopular ? (
                      <span className="rounded-full bg-[#ffc400] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0a0a0a]">
                        {popularLabel}
                      </span>
                    ) : null}
                  </header>

                  <section className="mt-5 border-t border-[#ececea] pt-4">
                    <p className="text-[22px] font-extrabold tracking-[-0.02em] text-[#0a0a0a]">
                      {plan.price}
                    </p>
                    <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#6b6f76]">
                      {perMonthLabel}
                    </p>
                  </section>

                  <ul className="mt-5 flex-1 space-y-2.5">
                    {plan.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start gap-2 text-[12.5px] leading-relaxed text-[#6b6f76]"
                      >
                        <Check
                          className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#e6ad00]"
                          aria-hidden="true"
                        />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex flex-col gap-2">
                    <Link
                      to="/contact"
                      className={`inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-[13px] font-semibold transition ${
                        plan.isPopular
                          ? 'bg-[#0a0a0a] text-white hover:bg-[#1c1c1c]'
                          : 'bg-[#ffc400] text-[#0a0a0a] hover:bg-[#e6ad00]'
                      }`}
                    >
                      {ctaLabel}
                      <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </Link>

                    {plan.detailsTo ? (
                      <Link
                        to={plan.detailsTo}
                        className="inline-flex items-center justify-center rounded-md border border-[#ececea] bg-white px-4 py-2 text-[12px] font-semibold text-[#0a0a0a] transition hover:bg-[#f7f6f1]"
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
          <p className="rounded-[12px] border border-[#ececea] bg-[var(--peekaboo-warm)] px-5 py-8 text-[13px] text-[#6b6f76]">
            Business plans are being updated. Contact our team for current pricing.
          </p>
        )}
      </motion.article>
    </section>
  );
};

export default BusinessPlansSection;
