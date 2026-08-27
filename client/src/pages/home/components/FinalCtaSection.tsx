import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { containerVariants, itemVariants } from '../home.animations';
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
  <section className="section-rhythm relative w-full">
    <motion.article
      className="relative mx-auto max-w-[720px] px-5 text-center sm:px-8 lg:px-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={containerVariants}
    >
      <motion.header variants={itemVariants}>
        <p className="type-eyebrow">
          Get started
        </p>
        <h2 className="type-h2 mt-2">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] text-base font-normal leading-[1.6] text-(--muted)">
          {subtitle}
        </p>

        <Button
          type="button"
          primary
          onClick={onScrollToForm}
          className="mt-6"
        >
          {buttonLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </motion.header>
    </motion.article>
  </section>
);

export default FinalCtaSection;
