import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import type { BusinessFeatureItem, BusinessHighlightStat } from '../home.types';
import { containerVariants, fadeInUp, slideInLeft, slideInRight } from '../home.animations';
import Button from '@/components/inputs/Button';

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

const WEEK_DATA = [
  { day: 'M', deliveries: 62 },
  { day: 'T', deliveries: 78 },
  { day: 'W', deliveries: 54 },
  { day: 'T', deliveries: 91 },
  { day: 'F', deliveries: 87 },
  { day: 'S', deliveries: 69 },
  { day: 'S', deliveries: 43 },
];

const MAX_DELIVERIES = Math.max(...WEEK_DATA.map((d) => d.deliveries));
const WEEK_TOTAL = WEEK_DATA.reduce((s, d) => s + d.deliveries, 0);

const METRICS = [
  { value: `${WEEK_TOTAL}`, label: 'This week', trend: '+12%' },
  { value: '97.3%', label: 'On-time', trend: '+2.1%' },
  { value: '28 min', label: 'Avg delivery', trend: '−3 min' },
];

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
    <section className="w-full py-20 lg:py-28 bg-primary-900">
      <motion.article
        className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <figure className="grid grid-cols-1 gap-12 lg:gap-16 items-center lg:grid-cols-2">
          <motion.figcaption variants={slideInLeft}>
            <span className="inline-block text-[11px] uppercase tracking-[0.14em] font-medium text-primary-400 mb-4">
              {badgeLabel}
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-5">
              {title1}
              <br />
              <span className="text-secondary-400">{title2}</span>
            </h2>
            <p className="text-[14px] text-primary-300 mb-8 leading-relaxed max-w-xl">{subtitle}</p>

            <ul className="space-y-3 mb-8">
              {features.map((feature) => (
                <motion.li
                  key={feature.title}
                  className="flex items-start gap-3 rounded-xl border border-primary-700/50 bg-primary-800/40 p-4"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4 }}
                >
                  <span className="w-9 h-9 rounded-lg bg-secondary-600/20 flex items-center justify-center flex-shrink-0">
                    <FontAwesomeIcon icon={feature.icon} className="text-secondary-300 text-[14px]" />
                  </span>
                  <section>
                    <h4 className="text-white text-[14px] font-medium mb-0.5">{feature.title}</h4>
                    <p className="text-primary-300 text-[14px]">{feature.description}</p>
                  </section>
                </motion.li>
              ))}
            </ul>

            <motion.nav variants={fadeInUp}>
              <Button
                onClick={(e) => {
                  e.preventDefault();
                  if (onContactClick) {
                    onContactClick();
                  }
                }}
                className="bg-secondary-500 text-white border-secondary-500 hover:bg-secondary-600 hover:border-secondary-600 hover:text-white"
              >
                {primaryCtaLabel}
                <FontAwesomeIcon icon={faArrowRight} className="text-[11px]" />
              </Button>
            </motion.nav>
          </motion.figcaption>

          <motion.aside className="relative" variants={slideInRight}>
            <article className="rounded-xl border border-primary-700/50 bg-primary-800/60 overflow-hidden">
              <header className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-primary-700/30">
                <hgroup>
                  <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-primary-500 mb-0.5">
                    Business Dashboard
                  </p>
                  <h3 className="text-[14px] font-semibold text-white">Delivery Analytics</h3>
                </hgroup>
                <span className="flex items-center gap-1.5 text-[10px] font-medium text-secondary-400 bg-secondary-900/30 border border-secondary-800/40 rounded-full px-2 py-0.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-secondary-400" />
                  </span>
                  Live
                </span>
              </header>

              <section className="px-6 pt-5 pb-2">
                <header className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-primary-500 font-medium">Packages · this week</p>
                  <span className="text-[11px] text-primary-400 tabular-nums font-medium">
                    {WEEK_TOTAL} total
                  </span>
                </header>

                <figure className="relative h-28">
                  {[25, 50, 75].map((pct) => (
                    <hr
                      key={pct}
                      className="absolute left-0 right-0 border-t border-primary-700/30 pointer-events-none"
                      style={{ bottom: `${pct}%` }}
                    />
                  ))}
                  <figcaption className="absolute inset-0 flex items-end gap-1.5">
                    {WEEK_DATA.map((item, index) => {
                      const heightPct = (item.deliveries / MAX_DELIVERIES) * 100;
                      const isPeak = item.deliveries === MAX_DELIVERIES;
                      return (
                        <motion.span
                          key={index}
                          className={`flex-1 rounded-t-sm ${
                            isPeak ? 'bg-secondary-400' : 'bg-primary-600'
                          }`}
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.5,
                            delay: 0.1 + index * 0.06,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          style={{ height: `${heightPct}%`, originY: 1 }}
                        />
                      );
                    })}
                  </figcaption>
                </figure>

                <footer className="flex gap-1.5 mt-2">
                  {WEEK_DATA.map((item, index) => {
                    const isPeak = item.deliveries === MAX_DELIVERIES;
                    return (
                      <span
                        key={index}
                        className={`flex-1 text-center text-[9px] leading-none ${
                          isPeak ? 'text-secondary-300 font-medium' : 'text-primary-500'
                        }`}
                      >
                        {item.day}
                      </span>
                    );
                  })}
                </footer>
              </section>

              <hr className="border-primary-700/30 mx-6 mt-4" />

              <section className="grid grid-cols-3 gap-2 px-6 py-5">
                {METRICS.map((metric, i) => (
                  <motion.article
                    key={metric.label}
                    className="text-center py-3 px-2 rounded-lg bg-primary-700/30 border border-primary-700/20"
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.3 }}
                  >
                    <p className="text-base font-semibold text-white tabular-nums leading-tight">
                      {metric.value}
                    </p>
                    <p className="text-[10px] text-primary-500 mt-0.5 leading-tight">{metric.label}</p>
                    <p className="text-[10px] font-medium text-secondary-400 mt-1">{metric.trend}</p>
                  </motion.article>
                ))}
              </section>

              {hasStats && (
                <>
                  <hr className="border-primary-700/30 mx-6" />
                  <ul className="grid grid-cols-2 gap-4 px-6 py-5">
                    {stats?.map((stat, index) => (
                      <motion.li
                        key={stat.label}
                        className="text-center p-3 rounded-lg"
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                      >
                        <figure className="w-9 h-9 rounded-lg bg-primary-700/40 flex items-center justify-center mx-auto mb-2">
                          <FontAwesomeIcon icon={stat.icon} className="text-primary-300 text-[14px]" />
                        </figure>
                        <span className="block text-lg font-semibold text-white mb-0.5">
                          {stat.value}
                        </span>
                        <span className="text-[11px] text-primary-400">{stat.label}</span>
                      </motion.li>
                    ))}
                  </ul>
                </>
              )}
            </article>
          </motion.aside>
        </figure>
      </motion.article>
    </section>
  );
};

export default BusinessSolutionsSection;
