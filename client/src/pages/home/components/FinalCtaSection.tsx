import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBuilding } from '@fortawesome/free-solid-svg-icons';
import { containerVariants, fadeInUp } from '../home.animations';

interface FinalCtaSectionProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  accountLabel: string;
  onScrollToForm: () => void;
  onContactClick?: () => void;
}

const FinalCtaSection = ({
  title,
  subtitle,
  buttonLabel,
  accountLabel,
  onScrollToForm,
  onContactClick,
}: FinalCtaSectionProps) => (
  <section className="w-full py-20 lg:py-28 border-t border-slate-100">
    <motion.article
      className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.header className="max-w-3xl mx-auto text-center" variants={fadeInUp}>
        <motion.h2
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-6"
          whileInView={{ opacity: [0, 1], y: [30, 0] }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          {title}
        </motion.h2>
        <motion.p
          className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mb-10 font-normal"
          whileInView={{ opacity: [0, 1] }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          {subtitle}
        </motion.p>

        <nav className="flex flex-wrap items-center justify-center gap-4">
          <motion.button
            onClick={onScrollToForm}
            className="group inline-flex items-center gap-3 bg-primary-600 text-white px-10 py-5 rounded-xl text-lg font-normal hover:bg-primary-700 transition-colors cursor-pointer shadow-xl shadow-primary-500/25"
            whileHover={{
              scale: 1.05,
              boxShadow: '0 25px 50px -12px rgba(95, 149, 152, 0.4)',
            }}
            whileTap={{ scale: 0.98 }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {buttonLabel}
            <motion.span
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
            >
              <FontAwesomeIcon icon={faArrowRight} />
            </motion.span>
          </motion.button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            whileHover={{ scale: 1.05 }}
          >
            <button
              onClick={onContactClick}
              className="inline-flex items-center gap-2 px-8 py-5 text-slate-700 hover:text-black text-lg font-normal transition-colors border-2 border-slate-200 hover:border-slate-300 rounded-xl cursor-pointer"
            >
              <FontAwesomeIcon icon={faBuilding} />
              {accountLabel}
            </button>
          </motion.div>
        </nav>
      </motion.header>
    </motion.article>
  </section>
);

export default FinalCtaSection;
