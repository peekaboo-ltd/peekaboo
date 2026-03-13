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
  <section className="w-full py-20 lg:py-28 bg-gray-50 border-t border-gray-100">
    <motion.article
      className="max-w-[900px] mx-auto px-4 sm:px-6 lg:px-12 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-100px' }}
      variants={containerVariants}
    >
      <motion.div variants={fadeInUp}>
        <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight mb-4">
          {title}
        </h2>
        <p className="text-base text-gray-500 max-w-xl mx-auto mb-8">
          {subtitle}
        </p>

        <Button onClick={onScrollToForm} primary>
          {buttonLabel}
          <FontAwesomeIcon icon={faArrowRight} className="text-[11px] ml-1" />
        </Button>
      </motion.div>
    </motion.article>
  </section>
);

export default FinalCtaSection;
