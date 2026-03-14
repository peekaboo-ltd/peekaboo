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
  popularLabel,
  perMonthLabel,
  ctaLabel,
  plans,
}: BusinessPlansSectionProps) => (
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
         
      </motion.span>
        
      </motion.header>

      <motion.ul
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {plans.map((plan) => (
          <motion.li
            key={plan.name}
            variants={scaleIn}
            whileHover={{ y: -8, scale: 1.02 }}
            className={`relative transition-all duration-300 ${
              plan.isPopular ? 'md:-mt-4' : ''
            } hover:z-10`}
          >
            <article
              className={`group h-full rounded-2xl border p-6 flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-900/10 hover:-translate-y-1 hover:bg-primary-900 hover:border-primary-700 ${
                plan.isPopular
                  ? 'border-secondary-300 shadow-xl shadow-secondary-500/10 bg-secondary-50/40'
                  : 'border-primary-100 bg-white'
              }`}
            >
              <header className="flex items-start justify-between gap-4">
                <hgroup>
                  <h3 className="text-xl font-semibold text-primary-900 transition-colors duration-300 group-hover:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-[13px] text-primary-500 mt-2 transition-colors duration-300 group-hover:text-primary-200">
                    {plan.description}
                  </p>
                </hgroup>
                {plan.isPopular && (
                  <mark className="text-xs font-semibold uppercase tracking-wide text-white bg-secondary-600 px-2.5 py-1 rounded-full shadow-sm transition-colors duration-300 group-hover:bg-white group-hover:text-primary-900">
                    {popularLabel}
                  </mark>
                )}
              </header>

              <section>
                <p className="text-3xl font-bold text-primary-900 transition-colors duration-300 group-hover:text-white">
                  {plan.price}
                </p>
                <p className="text-xs text-primary-500 mt-1 transition-colors duration-300 group-hover:text-primary-300">
                  {perMonthLabel}
                </p>
              </section>

              <ul className="space-y-3 text-[13px] text-primary-600 flex-1">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-secondary-600 transition-colors duration-300 group-hover:text-secondary-300">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className="transition-colors duration-300 group-hover:text-primary-100">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/onboarding/organization"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-[13px] font-medium transition-colors duration-300 ${
                  plan.isPopular
                    ? 'bg-secondary-600 text-white hover:bg-secondary-700 group-hover:bg-secondary-500 group-hover:text-white'
                    : 'bg-primary-50 text-primary-700 hover:bg-primary-100 group-hover:bg-white group-hover:text-primary-900'
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
