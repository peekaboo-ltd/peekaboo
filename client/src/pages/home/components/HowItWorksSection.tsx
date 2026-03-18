import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { HowItWorksStep } from '../home.types';
import { containerVariants, fadeInUp } from '../home.animations';

interface HowItWorksSectionProps {
  badgeLabel: string;
  title: string;
  subtitle: string;
  steps: HowItWorksStep[];
}

const HowItWorksSection = ({ badgeLabel, title, subtitle, steps }: HowItWorksSectionProps) => (
  <section className="w-full py-20 lg:py-28 bg-[#FAFAF7]">
    <motion.article
      className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.header className="text-center mb-16" variants={fadeInUp}>
        <span className="inline-block text-[11px] uppercase tracking-[0.14em] font-semibold text-secondary-600 mb-4">
          {badgeLabel}
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-primary-900 leading-tight mb-4">
          {title}
        </h2>
        <p className="text-[13px] text-primary-500 max-w-2xl mx-auto leading-relaxed">{subtitle}</p>
      </motion.header>

      <motion.ol
        className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        variants={containerVariants}
      >
        <motion.hr
          className="hidden md:block absolute top-12 left-[15%] right-[15%] h-px bg-secondary-200/70 border-0 origin-left"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4, ease: 'easeOut' }}
        />

        {steps.map((step, index) => (
          <motion.li
            key={step.title}
            className="relative text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.15, duration: 0.5 }}
          >
            <figure className="relative inline-flex flex-col items-center mb-5">
              <span className="text-4xl sm:text-5xl font-bold text-secondary-400 tracking-tight mb-3">
                {step.step}
              </span>
              <figcaption className="w-12 h-12 rounded-xl bg-secondary-50 border border-secondary-200 flex items-center justify-center shadow-sm">
                <FontAwesomeIcon icon={step.icon} className="text-lg text-secondary-600" />
              </figcaption>
            </figure>

            <h3 className="text-[13px] font-semibold text-primary-900 mb-2">
              {step.title}
            </h3>
            <p className="text-primary-500 max-w-xs mx-auto text-[13px] leading-relaxed">
              {step.description}
            </p>
          </motion.li>
        ))}
      </motion.ol>
    </motion.article>
  </section>
);

export default HowItWorksSection;
