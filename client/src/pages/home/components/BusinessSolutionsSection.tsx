import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import type { BusinessFeatureItem, BusinessHighlightStat } from '../home.types';
import { containerVariants, fadeInUp, slideInLeft, slideInRight } from '../home.animations';

interface BusinessSolutionsSectionProps {
  badgeLabel: string;
  title1: string;
  title2: string;
  subtitle: string;
  features: BusinessFeatureItem[];
  primaryCtaLabel: string;
  secondaryCtaLabel: string;
  stats: BusinessHighlightStat[];
  onContactClick?: () => void;
}

const BusinessSolutionsSection = ({
  badgeLabel,
  title1,
  title2,
  subtitle,
  features,
  primaryCtaLabel,
  secondaryCtaLabel,
  stats,
  onContactClick,
}: BusinessSolutionsSectionProps) => (
  <section className="w-full py-20 lg:py-28 border-y border-slate-100">
    <motion.article
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <figure className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.figcaption variants={slideInLeft}>
          <motion.span
            className="inline-block text-primary-600 font-medium text-sm tracking-wider uppercase mb-4"
            whileInView={{ opacity: [0, 1], x: [-20, 0] }}
            viewport={{ once: true }}
          >
            {badgeLabel}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
            {title1}
            <br />
            <span className="text-primary-600">{title2}</span>
          </h2>
          <p className="text-lg text-slate-600 mb-8 leading-relaxed font-normal">{subtitle}</p>

          <ul className="space-y-4 mb-10">
            {features.map((feature, index) => (
              <motion.li
                key={feature.title}
                className="group flex items-start gap-4"
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.12, duration: 0.5 }}
                whileHover={{ x: 8 }}
              >
                <motion.mark
                  className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center flex-shrink-0 group-hover:bg-primary-100 transition-colors"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  <FontAwesomeIcon icon={feature.icon} className="text-primary-600" />
                </motion.mark>
                <section>
                  <h4 className="text-slate-900 font-semibold mb-1 group-hover:text-primary-700 transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-slate-500 text-sm font-normal">{feature.description}</p>
                </section>
              </motion.li>
            ))}
          </ul>

          <motion.nav className="flex flex-wrap gap-4" variants={fadeInUp}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={onContactClick}
                className="inline-flex items-center gap-2 px-8 py-4 bg-primary-600 text-white rounded-xl font-normal hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/25 cursor-pointer"
              >
                {primaryCtaLabel}
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </motion.span>
              </button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <button
                onClick={onContactClick}
                className="inline-flex items-center gap-2 px-8 py-4 border-2 border-slate-200 text-slate-700 hover:border-primary-300 hover:text-primary-700 rounded-xl font-normal transition-all cursor-pointer"
              >
                {secondaryCtaLabel}
              </button>
            </motion.div>
          </motion.nav>
        </motion.figcaption>

        <motion.aside className="relative" variants={slideInRight}>
          <motion.article
            className="rounded-2xl p-8 border border-slate-200 shadow-xl shadow-slate-900/5"
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
          >
            <ul className="grid grid-cols-2 gap-6">
              {stats.map((stat, index) => (
                <motion.li
                  key={stat.label}
                  className="group text-center p-4 rounded-xl hover:bg-primary-50 transition-colors cursor-default"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                  whileHover={{ scale: 1.08 }}
                >
                  <motion.figure
                    className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-primary-200 transition-colors"
                    whileHover={{ rotate: [0, -15, 15, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <FontAwesomeIcon icon={stat.icon} className="text-primary-600" />
                  </motion.figure>
                  <motion.data
                    className="block text-2xl font-bold text-slate-900 mb-1"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                  >
                    {stat.value}
                  </motion.data>
                  <span className="text-xs text-slate-500 font-normal">{stat.label}</span>
                </motion.li>
              ))}
            </ul>
          </motion.article>
        </motion.aside>
      </figure>
    </motion.article>
  </section>
);

export default BusinessSolutionsSection;
