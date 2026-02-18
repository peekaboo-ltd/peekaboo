import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { containerVariants, fadeInUp } from '../home.animations';
import Button from '@/components/inputs/Button';

interface FinalCtaSectionProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onScrollToForm: () => void;
}

const FinalCtaSection = ({
  title,
  subtitle,
  buttonLabel,
  onScrollToForm,
}: FinalCtaSectionProps) => (
  <section className="w-full py-20 lg:py-28 border-t border-slate-200 bg-[#f4f4f1]">
    <motion.article
      className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.section
        className="relative overflow-hidden rounded-3xl border border-slate-300 bg-white px-6 py-12 sm:px-10 lg:px-16 shadow-[0_26px_60px_-48px_rgba(15,23,42,0.5)]"
        variants={fadeInUp}
      >
        <motion.header className="relative max-w-3xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-[3rem] font-medium text-slate-900 leading-[1.08] mb-5"
            whileInView={{ opacity: [0, 1], y: [30, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="text-base text-slate-600 max-w-2xl mx-auto mb-8"
            whileInView={{ opacity: [0, 1] }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {subtitle}
          </motion.p>

          <nav className="flex flex-wrap items-center justify-center gap-3">
            <Button
              onClick={onScrollToForm}
              primary
            >
              {buttonLabel}
              <motion.span
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <FontAwesomeIcon icon={faArrowRight} />
              </motion.span>
            </Button>
          </nav>
        </motion.header>
      </motion.section>
    </motion.article>
  </section>
);

export default FinalCtaSection;
