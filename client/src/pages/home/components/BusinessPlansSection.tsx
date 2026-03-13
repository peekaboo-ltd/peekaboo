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
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.header className="text-center mb-4 lg:mb-6" variants={fadeInUp}>
        <motion.span
          className="inline-block text-black font-medium text-sm tracking-wider uppercase"
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
              className={`group h-full rounded-2xl border p-6 flex flex-col gap-6 transition-all duration-300 hover:shadow-2xl hover:shadow-primary-500/20 hover:-translate-y-1 hover:bg-primary-900 hover:border-primary-700 ${
                plan.isPopular
                  ? 'border-primary-300 shadow-xl shadow-primary-500/10 bg-primary-50/40'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <header className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900 transition-colors duration-300 group-hover:text-white">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-slate-500 mt-2 transition-colors duration-300 group-hover:text-primary-100">
                    {plan.description}
                  </p>
                </div>
                {plan.isPopular && (
                  <span className="text-xs font-semibold uppercase tracking-wide text-white bg-primary-900 px-2.5 py-1 rounded-full shadow-sm transition-colors duration-300 group-hover:bg-white group-hover:text-primary-900">
                    {popularLabel}
                  </span>
                )}
              </header>

              <div>
                <p className="text-3xl font-bold text-slate-900 transition-colors duration-300 group-hover:text-white">
                  {plan.price}
                </p>
                <p className="text-xs text-slate-500 mt-1 transition-colors duration-300 group-hover:text-primary-100">
                  {perMonthLabel}
                </p>
              </div>

              <ul className="space-y-3 text-sm text-slate-600 flex-1">
                {plan.features.map((feature: string) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-black transition-colors duration-300 group-hover:text-primary-100">
                      <FontAwesomeIcon icon={faCheck} />
                    </span>
                    <span className="transition-colors duration-300 group-hover:text-primary-50">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                to="/onboarding/organization"
                className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors duration-300 ${
                  plan.isPopular
                    ? 'bg-primary-600 text-white hover:bg-primary-700 group-hover:bg-primary-600 group-hover:text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200 group-hover:bg-white group-hover:text-primary-900'
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
