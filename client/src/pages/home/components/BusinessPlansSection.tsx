import { motion } from 'framer-motion';
import type { BusinessPlan } from '@/types/businessPlan.type';
import { containerVariants, itemVariants } from '../home.animations';
import PlanCard from '@/pages/services/PlanCard';
import { useI18n } from '@/i18n/i18n';

interface BusinessPlansSectionProps {
  badgeLabel?: string;
  title: string;
  subtitle: string;
  popularLabel?: string;
  ctaLabel?: string;
  plans: BusinessPlan[];
  isLoading?: boolean;
  /** Set when the section stands alone and the page has no hero above it. */
  showHeader?: boolean;
}

/**
 * The plan row. Cards sit on the grey surface rather than on paper, so a white
 * card reads as raised — previously the recommended plan was the only white
 * card among grey ones, which made the one plan being recommended the least
 * prominent thing in the row.
 */
const BusinessPlansSection = ({
  badgeLabel,
  title,
  subtitle,
  popularLabel,
  ctaLabel,
  plans,
  isLoading,
  showHeader = true,
}: BusinessPlansSectionProps) => {
  const { t } = useI18n();
  const hasPlans = !isLoading && plans.length > 0;

  return (
    <section
      id="business-plans"
      className="section-rhythm w-full border-y border-(--line) bg-(--surface)"
    >
      <motion.article
        className="app-container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        {showHeader ? (
          <motion.header className="mb-8 max-w-[640px]" variants={itemVariants}>
            {badgeLabel ? <p className="type-eyebrow">{badgeLabel}</p> : null}
            <h2 className="type-h2 mt-2">{title}</h2>
            <p className="type-body mt-3 text-(--muted)">{subtitle}</p>
          </motion.header>
        ) : null}

        {isLoading ? (
          <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <li
                key={index}
                className="h-[420px] animate-pulse rounded-(--radius-card) border border-(--line) bg-(--paper)"
              />
            ))}
          </ul>
        ) : hasPlans ? (
          <motion.ul
            className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
            variants={containerVariants}
          >
            {plans.map((plan) => (
                <PlanCard
                  plan={plan}
                  recommendedLabel={popularLabel ?? t('plans.mostPopular')}
                  ctaLabel={ctaLabel ?? t('plans.seePricing')}
                />
            ))}
          </motion.ul>
        ) : (
          <p className="card-framed type-body-sm px-5 py-8 text-(--muted)">
            {t('plans.updating')}
          </p>
        )}
      </motion.article>
    </section>
  );
};

export default BusinessPlansSection;
