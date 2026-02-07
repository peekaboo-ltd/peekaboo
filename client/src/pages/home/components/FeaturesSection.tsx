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

      <motion.ul
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        variants={containerVariants}
      >
        {features.map((feature) => (
          <motion.li
            key={feature.title}
            variants={scaleIn}
            whileHover={{
              y: -8,
              scale: 1.02,
              transition: { type: 'spring', stiffness: 400, damping: 17 },
            }}
          >
            <article className="group h-full rounded-2xl p-7 border border-slate-200 hover:border-primary-300 hover:shadow-xl hover:shadow-primary-500/10 transition-all duration-500">
              <motion.figure
                className="w-14 h-14 bg-primary-50 rounded-xl flex items-center justify-center mb-5 group-hover:bg-primary-100 transition-colors duration-300"
                whileHover={{ rotate: [0, -10, 10, 0] }}
                transition={{ duration: 0.5 }}
              >
                <FontAwesomeIcon icon={feature.icon} className="text-black text-xl" />
              </motion.figure>
              <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-black transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed font-normal">
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
