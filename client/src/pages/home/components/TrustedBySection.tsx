import { motion } from 'framer-motion';
import { containerVariants, fadeInUp } from '../home.animations';

interface TrustedBySectionProps {
  label: string;
  industries: string[];
}

const TrustedBySection = ({ label, industries }: TrustedBySectionProps) => (
  <section className="w-full py-12 border-y border-slate-100">
    <article className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16">
      <motion.figure
        className="flex flex-col md:flex-row items-center justify-between gap-8 rounded-2xl border border-slate-200 bg-white/90 px-6 py-5 shadow-sm"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={containerVariants}
      >
        <motion.figcaption
          className="text-sm text-slate-500 font-medium uppercase tracking-wider"
          variants={fadeInUp}
        >
          {label}
        </motion.figcaption>
        <ul className="flex flex-wrap items-center justify-center gap-8 lg:gap-12">
          {industries.map((industry, index) => (
            <motion.li
              key={industry}
              className="text-slate-400 font-normal text-sm uppercase tracking-wide hover:text-black transition-colors cursor-default"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08, duration: 0.5 }}
              whileHover={{ scale: 1.1, color: '#5f9598' }}
            >
              {industry}
            </motion.li>
          ))}
        </ul>
      </motion.figure>
    </article>
  </section>
);

export default TrustedBySection;
