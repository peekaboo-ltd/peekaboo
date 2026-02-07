import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import type { BusinessPlan } from '../home.types';
import { containerVariants, fadeInUp, scaleIn } from '../home.animations';

interface BusinessPlansSectionProps {
  badgeLabel: string;
  title: string;
  subtitle: string;
  popularLabel: string;
  perMonthLabel: string;
  ctaLabel: string;
  plans: BusinessPlan[];
}

const BusinessPlansSection = ({
  badgeLabel,
  title,
  subtitle,
  popularLabel,
  perMonthLabel,
  ctaLabel,
  plans,
}: BusinessPlansSectionProps) => (
  <section className="w-full py-20 lg:py-28">
    <motion.article
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.header className="text-center mb-14 lg:mb-16" variants={fadeInUp}>
        <motion.span
          className="inline-block text-black font-medium text-sm tracking-wider uppercase mb-3"
          whileInView={{ opacity: [0, 1], y: [20, 0] }}
          viewport={{ once: true }}
        >
          {badgeLabel}
        </motion.span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
          {title}
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-normal">{subtitle}</p>
      </motion.header>

      <motion.ul className="grid grid-cols-1 md:grid-cols-3 gap-6" variants={containerVariants}>
        {plans.map((plan) => (
          <motion.li
            key={plan.name}
            variants={scaleIn}
            whileHover={{ y: -8, scale: 1.02 }}
            className={plan.isPopular ? 'md:-mt-4' : ''}
          >
            <article
              className={`h-full rounded-2xl border p-6 flex flex-col gap-6 transition-all duration-300 ${
                plan.isPopular
                  ? 'border-primary-300 shadow-xl shadow-primary-500/10 bg-primary-50/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <header className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">{plan.name}</h3>
                  <p className="text-sm text-slate-500 mt-2">{plan.description}</p>
                </div>
                {plan.isPopular && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-black bg-primary-100 px-2.5 py-1 rounded-full">
                    {popularLabel}
                  </span>
                )}
              </header>

              <div>
                <p className="text-3xl font-bold text-slate-900">{plan.price}</p>
                <p className="text-xs text-slate-500 mt-1">{perMonthLabel}</p>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 flex-1">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-black">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                to="/onboarding/organization"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                  plan.isPopular
                    ? 'bg-primary-600 text-white hover:bg-primary-700'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {ctaLabel}
                <FontAwesomeIcon icon={faArrowRight} className="text-xs" />
              </Link>
            </article>
          </motion.li>
        ))}
      </motion.ul>
    </motion.article>
  </section>
);

export default BusinessPlansSection;
