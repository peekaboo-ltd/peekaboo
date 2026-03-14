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
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.header className="text-center mb-14" variants={fadeInUp}>
        <span className="inline-block text-[11px] uppercase tracking-[0.14em] font-semibold text-secondary-600 mb-4">
          {badgeLabel}
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-900 leading-tight mb-4">
          {title}
        </h2>
        <p className="text-[13px] text-primary-500 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
      </motion.header>

      <motion.ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {features.map((feature) => (
          <motion.li key={feature.title} variants={scaleIn}>
            <article className="h-full rounded-xl p-6 border border-primary-100 bg-[#FAFAF7] transition-all duration-300 hover:border-secondary-300 hover:shadow-sm">
              <figure className="w-10 h-10 rounded-lg bg-secondary-50 border border-secondary-200 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={feature.icon} className="text-secondary-700 text-[13px]" />
              </figure>
              <h3 className="text-[13px] font-semibold text-primary-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-primary-500 text-[13px] leading-relaxed">
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
