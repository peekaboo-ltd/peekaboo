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
  <section className="w-full py-20 lg:py-28 bg-gray-50">
    <motion.article
      className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.header className="text-center mb-14" variants={fadeInUp}>
        <span className="inline-block text-[11px] uppercase tracking-[0.14em] font-medium text-primary-600 mb-4">
          {badgeLabel}
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {title}
        </h2>
        <p className="text-base text-gray-500 max-w-2xl mx-auto">{subtitle}</p>
      </motion.header>

      <motion.ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {features.map((feature) => (
          <motion.li key={feature.title} variants={scaleIn}>
            <article className="h-full rounded-lg p-6 border border-gray-100 bg-white transition-colors duration-200 hover:border-gray-200">
              <figure className="w-10 h-10 rounded-md bg-gray-50 border border-gray-100 flex items-center justify-center mb-4">
                <FontAwesomeIcon icon={feature.icon} className="text-gray-700 text-sm" />
              </figure>
              <h3 className="text-sm font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-500 text-[13px] leading-relaxed">
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
