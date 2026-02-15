import { motion } from 'framer-motion';
import { Suspense } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import type { BusinessFeatureItem, BusinessHighlightStat } from '../home.types';
import { containerVariants, fadeInUp, slideInLeft, slideInRight } from '../home.animations';
import Button from '@/components/inputs/Button';
import BusinessScene from '@/components/three/BusinessScene';

interface BusinessSolutionsSectionProps {
  badgeLabel: string;
  title1: string;
  title2: string;
  subtitle: string;
  features: BusinessFeatureItem[];
  primaryCtaLabel: string;
  stats?: BusinessHighlightStat[];
  onContactClick?: () => void;
}

const BusinessSolutionsSection = ({
  badgeLabel,
  title1,
  title2,
  subtitle,
  features,
  primaryCtaLabel,
  stats,
  onContactClick,
}: BusinessSolutionsSectionProps) => {
  const hasStats = Boolean(stats?.length);

  return (
    <section className="w-full py-20 lg:py-28 border-y border-slate-100 bg-white">
      <motion.article
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <figure className="grid grid-cols-1 gap-12 lg:gap-20 items-center lg:grid-cols-2">
        <motion.figcaption variants={slideInLeft}>
          <motion.span
            className="inline-block text-black font-medium text-sm tracking-wider uppercase mb-4"
            whileInView={{ opacity: [0, 1], x: [-20, 0] }}
            viewport={{ once: true }}
          >
            {badgeLabel}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 mb-6">
            {title1}
            <br />
            <span className="text-black">{title2}</span>
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
                  <FontAwesomeIcon icon={feature.icon} className="text-black" />
                </motion.mark>
                <section>
                  <h4 className="text-slate-900 font-medium mb-1 group-hover:text-black transition-colors">
                    {feature.title}
                  </h4>
                  <p className="text-slate-500 text-sm font-normal">{feature.description}</p>
                </section>
              </motion.li>
            ))}
          </ul>

          <motion.nav className="flex flex-wrap gap-4" variants={fadeInUp}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  if (onContactClick) {
                    onContactClick();
                  }
                }}
                primary
              >
                {primaryCtaLabel}
                <motion.span
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <FontAwesomeIcon icon={faArrowRight} />
                </motion.span>
              </Button>
            </motion.div>
          </motion.nav>
        </motion.figcaption>

        {hasStats ? (
          <motion.aside className="relative" variants={slideInRight}>
            <motion.article
              className="rounded-2xl p-8 border border-slate-200 bg-white/95 shadow-xl shadow-slate-900/5"
              animate={{ y: [-8, 8, -8] }}
              transition={{ duration: 4, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
            >
              <ul className="grid grid-cols-2 gap-6">
                {stats?.map((stat, index) => (
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
                      <FontAwesomeIcon icon={stat.icon} className="text-black" />
                    </motion.figure>
                    <motion.data
                      className="block text-2xl font-semibold text-slate-900 mb-1"
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
        ) : (
          <motion.aside className="relative h-[340px] sm:h-[400px] lg:h-[460px]" variants={slideInRight}>
            <span
              className="pointer-events-none absolute inset-x-8 bottom-2 h-20 rounded-full bg-slate-200/40 blur-3xl"
              aria-hidden="true"
            />
            <div className="relative h-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-50/60">
              <Suspense fallback={null}>
                <BusinessScene />
              </Suspense>
            </div>
          </motion.aside>
        )}
      </figure>
      </motion.article>
    </section>
  );
};

export default BusinessSolutionsSection;
