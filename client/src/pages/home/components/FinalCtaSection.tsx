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
  <section className="w-full py-20 lg:py-28 bg-primary-900">
    <motion.article
      className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.header variants={fadeInUp}>
        <span className="inline-block text-[11px] uppercase tracking-[0.14em] font-medium text-primary-400 mb-6">
          Get started
        </span>
        <h2 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
          {title}
        </h2>
        <p className="text-[13px] text-primary-300 max-w-xl mx-auto mb-8 leading-relaxed">
          {subtitle}
        </p>

        <Button
          onClick={onScrollToForm}
          className="bg-secondary-500 text-white border-secondary-500 hover:bg-secondary-600 hover:border-secondary-600 hover:text-white px-8"
        >
          {buttonLabel}
          <FontAwesomeIcon icon={faArrowRight} className="text-[11px] ml-1" />
        </Button>
      </motion.header>
    </motion.article>
  </section>
);

export default FinalCtaSection;
