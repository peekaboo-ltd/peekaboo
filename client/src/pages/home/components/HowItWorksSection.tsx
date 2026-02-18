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
        >
          {badgeLabel}
        </motion.span>
        <h2 className="text-3xl sm:text-4xl lg:text-[3rem] font-medium text-slate-900 leading-[1.08] mb-4">{title}</h2>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">{subtitle}</p>
      </motion.header>

      <motion.ol
        className="relative grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12"
        variants={containerVariants}
      >
        <motion.hr
          className="hidden md:block absolute top-18 left-[20%] right-[20%] h-px bg-slate-300 border-0 origin-left"
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
            >
              <motion.mark
                className="relative w-16 h-16 rounded-2xl bg-[#f3f5ef] flex items-center justify-center shadow-[0_16px_40px_-28px_rgba(15,23,42,0.45)] border border-slate-300"
              >
                <FontAwesomeIcon icon={step.icon} className="text-2xl text-black" />
              </motion.mark>
              <motion.data
                className="absolute -top-2 -right-2 min-w-7 h-7 rounded-full border border-slate-300 bg-white px-1 text-[11px] font-medium flex items-center justify-center shadow-sm text-slate-700"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 + 0.3, type: 'spring', stiffness: 500 }}
              >
                {step.step}
              </motion.data>
            </motion.figure>

            <motion.h3
              className="text-[16px] font-medium text-slate-900 mb-3"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.2 + 0.2 }}
            >
              {step.title}
            </motion.h3>
            <motion.p
              className="text-slate-600 max-w-xs mx-auto text-[13px] font-normal"
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
