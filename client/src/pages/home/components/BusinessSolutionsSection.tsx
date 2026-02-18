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
    <section className="w-full py-20 lg:py-28 border-y border-slate-200/80 bg-[#f2f3ef]">
      <motion.article
        className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-14"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <figure className="grid grid-cols-1 gap-12 lg:gap-20 items-center lg:grid-cols-2">
          <motion.figcaption variants={slideInLeft}>
            <motion.span
              className="inline-block rounded-full border border-slate-300 bg-white px-3 py-1 !text-[10px] font-medium tracking-[0.12em] uppercase text-slate-600 mb-4"
              whileInView={{ opacity: [0, 1], x: [-20, 0] }}
              viewport={{ once: true }}
            >
              {badgeLabel}
            </motion.span>
            <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-medium text-slate-900 leading-[1.08] mb-6">
              {title1}
              <br />
              <span className="text-slate-700">{title2}</span>
            </h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed max-w-xl">{subtitle}</p>

            <ul className="space-y-4 mb-10">
              {features.map((feature) => (
                <motion.li
                  key={feature.title}
                  className="group flex items-start gap-4 rounded-xl border border-slate-300/70 bg-white/90 p-4"
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45 }}
                  whileHover={{ y: -2 }}
                >
                  <span className="w-10 h-10 rounded-lg border border-slate-300 bg-[#edf1e7] flex items-center justify-center flex-shrink-0 text-slate-700">
                    <FontAwesomeIcon icon={feature.icon} className="text-black" />
                  </span>
                  <section>
                    <h4 className="text-slate-900 font-medium mb-1">{feature.title}</h4>
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

          {/* Analytics card — always visible */}
          <motion.aside className="relative" variants={slideInRight}>
            <div className="rounded-2xl border border-slate-300 bg-white/95 shadow-[0_24px_48px_-40px_rgba(15,23,42,0.5)] overflow-hidden">

              {/* Card header */}
              <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100">
                <div>
                  <p className="text-[10px] font-medium tracking-[0.14em] uppercase text-slate-400 mb-0.5">
                    Business Dashboard
                  </p>
                  <h3 className="text-sm font-semibold text-slate-900">Delivery Analytics</h3>
                </div>
                <span className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-full px-2.5 py-1">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>

              {/* Bar chart */}
              <div className="px-6 pt-5 pb-2">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-slate-400 font-medium">Packages · this week</p>
                  <span className="text-[11px] text-slate-500 tabular-nums font-medium">
                    {WEEK_TOTAL} total
                  </span>
                </div>

                {/* Bars area */}
                <div className="relative h-28">
                  {/* Subtle grid lines */}
                  {[25, 50, 75].map((pct) => (
                    <div
                      key={pct}
                      className="absolute left-0 right-0 border-t border-slate-100 pointer-events-none"
                      style={{ bottom: `${pct}%` }}
                    />
                  ))}
                  {/* Bars */}
                  <div className="absolute inset-0 flex items-end gap-1.5">
                    {WEEK_DATA.map((item, index) => {
                      const heightPct = (item.deliveries / MAX_DELIVERIES) * 100;
                      const isPeak = item.deliveries === MAX_DELIVERIES;
                      return (
                        <motion.div
                          key={index}
                          className={`flex-1 rounded-t-[3px] ${
                            isPeak ? 'bg-slate-800' : 'bg-[#d4dbc8]'
                          }`}
                          initial={{ scaleY: 0 }}
                          whileInView={{ scaleY: 1 }}
                          viewport={{ once: true }}
                          transition={{
                            duration: 0.55,
                            delay: 0.1 + index * 0.065,
                            ease: [0.25, 0.46, 0.45, 0.94],
                          }}
                          style={{ height: `${heightPct}%`, originY: 1 }}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Day labels */}
                <div className="flex gap-1.5 mt-2">
                  {WEEK_DATA.map((item, index) => {
                    const isPeak = item.deliveries === MAX_DELIVERIES;
                    return (
                      <span
                        key={index}
                        className={`flex-1 text-center text-[9px] leading-none ${
                          isPeak ? 'text-slate-700 font-semibold' : 'text-slate-400'
                        }`}
                      >
                        {item.day}
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Divider */}
              <div className="h-px bg-slate-100 mx-6 mt-4" />

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2.5 px-6 py-5">
                {METRICS.map((metric, i) => (
                  <motion.div
                    key={metric.label}
                    className="text-center py-3 px-2 rounded-xl bg-slate-50 border border-slate-100"
                    initial={{ opacity: 0, y: 8 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + i * 0.08, duration: 0.35 }}
                  >
                    <p className="text-base font-semibold text-slate-900 tabular-nums leading-tight">
                      {metric.value}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{metric.label}</p>
                    <p className="text-[10px] font-medium text-emerald-600 mt-1">{metric.trend}</p>
                  </motion.div>
                ))}
              </div>

              {/* Backward-compat: render stats if provided */}
              {hasStats && (
                <>
                  <div className="h-px bg-slate-100 mx-6" />
                  <ul className="grid grid-cols-2 gap-4 px-6 py-5">
                    {stats?.map((stat, index) => (
                      <motion.li
                        key={stat.label}
                        className="group text-center p-3 rounded-xl hover:bg-primary-50 transition-colors cursor-default"
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.1, type: 'spring', stiffness: 200 }}
                        whileHover={{ scale: 1.08 }}
                      >
                        <figure className="w-10 h-10 rounded-xl border border-slate-300 bg-slate-100 flex items-center justify-center mx-auto mb-2">
                          <FontAwesomeIcon icon={stat.icon} className="text-black text-sm" />
                        </figure>
                        <span className="block text-xl font-semibold text-slate-900 mb-0.5">
                          {stat.value}
                        </span>
                        <span className="text-xs text-slate-500 font-normal">{stat.label}</span>
                      </motion.li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </motion.aside>
        </figure>
      </motion.article>
    </section>
  );
};

export default BusinessSolutionsSection;
