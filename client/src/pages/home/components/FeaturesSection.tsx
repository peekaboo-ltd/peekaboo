import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { FeatureItem } from '../home.types';
import { containerVariants, fadeInUp, scaleIn } from '../home.animations';

interface FeaturesSectionProps {
  badgeLabel: string;
  title: string;
  subtitle: string;
  features: FeatureItem[];
}

const FeaturesSection = ({ badgeLabel, title, subtitle, features }: FeaturesSectionProps) => (
  <section className="w-full py-20 lg:py-28 bg-white">
    <motion.article
      className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-14"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.header className="text-center mb-14 lg:mb-16" variants={fadeInUp}>
        <motion.span
          className="inline-block rounded-full border border-slate-300 bg-slate-50 px-3 py-1 text-[11px] font-medium tracking-[0.12em] uppercase text-slate-600 mb-4"
          whileInView={{ opacity: [0, 1], y: [20, 0] }}
          viewport={{ once: true }}
        >
          {badgeLabel}
        </motion.span>
        <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-medium text-slate-900 leading-[1.08] mb-4">
          {title}
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
      </motion.header>

      <motion.ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {features.map((feature) => (
          <motion.li
            key={feature.title}
            variants={scaleIn}
            whileHover={{
              y: -3,
              transition: { type: 'spring', stiffness: 280, damping: 26 },
            }}
          >
            <article className="group h-full rounded-2xl p-7 border border-slate-200 bg-[#f9f9f7] shadow-[0_16px_34px_-28px_rgba(15,23,42,0.45)] transition-all duration-300 hover:border-slate-300">
              <motion.figure className="w-12 h-12 rounded-xl border border-slate-300 bg-white flex items-center justify-center mb-5 text-slate-700">
                <FontAwesomeIcon icon={feature.icon} className="text-black text-xl" />
              </motion.figure>
              <h3 className="text-lg !font-medium text-slate-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </article>
          </motion.li>
        ))}
      </motion.ul>
    </motion.article>
  </section>
);

export default FeaturesSection;
