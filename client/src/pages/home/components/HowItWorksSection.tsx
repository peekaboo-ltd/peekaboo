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
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: [0.42, 0, 0.58, 1] }}
        >
          {badgeLabel}
        </motion.span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">{title}</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto font-normal">{subtitle}</p>
      </motion.header>

      <motion.ol
        className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        variants={containerVariants}
      >
        <motion.hr
          className="hidden md:block absolute top-16 left-[20%] right-[20%] h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 border-0 origin-left"
          aria-hidden="true"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
        />

        {steps.map((step, index) => (
          <motion.li
            key={step.title}
            className="relative text-center"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.2, duration: 0.6 }}
          >
            <motion.figure
              className="relative inline-flex items-center justify-center mb-6"
              whileHover={{ scale: 1.1 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <motion.mark
                className="relative w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-primary-500/15 border border-primary-100"
                whileHover={{
                  boxShadow: '0 20px 40px -10px rgba(95, 149, 152, 0.3)',
                  borderColor: '#5f9598',
                }}
              >
                <FontAwesomeIcon icon={step.icon} className="text-2xl text-black" />
              </motion.mark>
              <motion.data
                className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-medium flex items-center justify-center shadow-lg"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 + 0.3, type: 'spring', stiffness: 500 }}
              >
                {step.step}
              </motion.data>
            </motion.figure>

            <motion.h3
              className="text-xl font-bold text-slate-900 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 + 0.2 }}
            >
              {step.title}
            </motion.h3>
            <motion.p
              className="text-slate-600 max-w-xs mx-auto font-normal"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 + 0.3 }}
            >
              {step.description}
            </motion.p>
          </motion.li>
        ))}
      </motion.ol>
    </motion.article>
  </section>
);

export default HowItWorksSection;
