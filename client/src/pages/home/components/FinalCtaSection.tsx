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
  <section className="w-full py-20 lg:py-28 border-t border-slate-100">
    <motion.article
      className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-12"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.section
        className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 px-6 py-12 sm:px-10 lg:px-16 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]"
        variants={fadeInUp}
      >
        <span
          className="pointer-events-none absolute -right-20 -top-24 h-48 w-48 rounded-full bg-primary/10 blur-3xl"
          aria-hidden="true"
        />
        <span
          className="pointer-events-none absolute -left-16 bottom-0 h-40 w-40 rounded-full bg-emerald-200/40 blur-3xl"
          aria-hidden="true"
        />

        <motion.header className="relative max-w-3xl mx-auto text-center">
          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-slate-900 mb-5"
            whileInView={{ opacity: [0, 1], y: [30, 0] }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {title}
          </motion.h2>
          <motion.p
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto mb-8 font-normal"
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
