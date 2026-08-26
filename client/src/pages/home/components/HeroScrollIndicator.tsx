import { motion } from 'framer-motion';

const HeroScrollIndicator = () => (
  <motion.figure
    className="pointer-events-none absolute bottom-5 left-1/2 hidden -translate-x-1/2 lg:block"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.2 }}
    aria-label="Scroll down"
  >
    <motion.span
      className="flex h-9 w-5 justify-center rounded-full border border-border pt-2"
      animate={{ y: [0, 4, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.span
        className="block h-1.5 w-1 rounded-full bg-[var(--ink)]"
        animate={{ y: [0, 8, 0], opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.span>
  </motion.figure>
);

export default HeroScrollIndicator;
