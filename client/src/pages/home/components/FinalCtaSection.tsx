import { motion } from 'framer-motion';
import { containerVariants, itemVariants } from '../home.animations';
import Button from '@/components/inputs/Button';

interface FinalCtaSectionProps {
  title: string;
  subtitle: string;
  buttonLabel: string;
  onScrollToForm?: () => void;
}

const FinalCtaSection = ({
  title,
  subtitle,
  buttonLabel,
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
          variant="primary"
          route="/contact"
          className="mt-6"
        >
          {buttonLabel}
        </Button>
      </motion.header>
    </motion.article>
  </section>
);

export default FinalCtaSection;
