import { motion } from 'framer-motion';

const HeroScrollIndicator = () => (
  <motion.figure
    className="absolute bottom-6 left-1/2 -translate-x-1/2"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ delay: 1.2 }}
    aria-label="Scroll down"
  >
    <motion.span
      className="w-5 h-9 rounded-full border border-primary-300 flex justify-center pt-2"
      animate={{ y: [0, 4, 0] }}
      transition={{ duration: 1.5, repeat: Infinity }}
    >
      <motion.span
        className="block w-1 h-1.5 rounded-full bg-primary-400"
        animate={{ y: [0, 8, 0], opacity: [1, 0.4, 1] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      />
    </motion.span>
  </motion.figure>
);

export default HeroScrollIndicator;
