import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import type { BusinessPlan } from '../home.types';
import { containerVariants, fadeInUp } from '../home.animations';

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
  detailsCtaLabel = 'View more details',
  plans,
  isLoading,
}: BusinessPlansSectionProps) => {
  const hasPlans = !isLoading && plans.length > 0;

  return (
    <section className="w-full py-20 lg:py-28">
      <motion.article
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.header className="text-center mb-4 lg:mb-6" variants={fadeInUp}>
          <motion.span
            className="inline-block text-primary-900 font-medium text-[13px] tracking-wider uppercase"
            whileInView={{ opacity: [0, 1], y: [20, 0] }}
            viewport={{ once: true }}
          >
            {badgeLabel}
          </motion.span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-primary-900">
            {title}
          </h2>
          <p className="mt-4 max-w-3xl mx-auto text-[13px] leading-relaxed text-primary-500">
            {subtitle}
          </p>
        </motion.header>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={index}
                className="h-[520px] rounded-2xl border border-primary-100 bg-white animate-pulse"
              />
            ))}
          </div>
        ) : (
          <motion.ul
            key="plans-loaded"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            initial="hidden"
            animate={hasPlans ? 'visible' : 'hidden'}
            variants={containerVariants}
          >
            {plans.map((plan) => (
              <motion.li
                key={plan.name}
                variants={fadeInUp}
                className={`relative ${
                  plan.isPopular ? 'md:-mt-4' : ''
                }`}
              >
                <article
                className={`home-card-interactive flex h-full flex-col gap-6 rounded-2xl border p-6 ${
                  plan.isPopular
                    ? 'border-secondary-300 bg-secondary-50/40'
                    : 'border-primary-100 bg-white'
                }`}
                >
                  <header className="flex items-start justify-between gap-4">
                    <hgroup>
                      <h3 className="text-xl font-semibold text-primary-900">
                        {plan.name}
                      </h3>
                      <p className="text-[13px] text-primary-500 mt-2">
                        {plan.description}
                      </p>
                    </hgroup>
                    {plan.isPopular ? (
                      <mark className="text-xs font-semibold uppercase tracking-wide text-white bg-secondary-600 px-2.5 py-1 rounded-full shadow-sm">
                        {popularLabel}
                      </mark>
                    ) : null}
                  </header>

                  <section>
                    <p className="text-3xl font-bold text-primary-900">
                      {plan.price}
                    </p>
                    <p className="text-xs text-primary-500 mt-1">
                      {perMonthLabel}
                    </p>
                  </section>

                  <ul className="space-y-3 text-[13px] text-primary-600 flex-1">
                    {plan.features.map((feature: string) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-0.5 text-secondary-600">
                          <FontAwesomeIcon icon={faCheck} />
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto flex flex-col gap-3">
                    <Link
                      to="/contact"
                      className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[13px] font-medium transition-colors duration-300 ${
                        plan.isPopular
                          ? 'bg-secondary-600 text-white hover:bg-secondary-700'
                          : 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                      }`}
                    >
                      {ctaLabel}
                      <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
                    </Link>

                    {plan.detailsTo ? (
                      <Link
                        to={plan.detailsTo}
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-primary-200 px-4 py-2 text-[12px] font-medium text-primary-700 transition-colors duration-300 hover:bg-primary-50"
                      >
                        {detailsCtaLabel}
                      </Link>
                    ) : null}
                  </div>
                </article>
              </motion.li>
            ))}
          </motion.ul>
        )}
      </motion.article>
    </section>
  );
};

export default BusinessPlansSection;
