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
  <section className="relative w-full border-t border-[#ececea] bg-[#0a0a0a] py-12 text-white lg:py-16">
    <motion.article
      className="relative mx-auto max-w-[720px] px-5 text-center sm:px-8 lg:px-10"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-80px' }}
      variants={containerVariants}
    >
      <motion.header variants={itemVariants}>
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#edb100]">
          Get started
        </p>
        <h2 className="mt-3 text-[28px] font-extrabold leading-[1.05] tracking-[-0.025em] sm:text-[36px]">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-[480px] text-[13px] leading-relaxed text-white/70">
          {subtitle}
        </p>

        <Button
          type="button"
          primary
          onClick={onScrollToForm}
          className="mt-6 rounded-full px-6 font-semibold"
        >
          {buttonLabel}
          <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
        </Button>
      </motion.header>
    </motion.article>
  </section>
);

export default FinalCtaSection;
