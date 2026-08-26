import type { Variants } from 'framer-motion';

export const entranceVariants: Variants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.2, ease: [0, 0, 1, 1] },
  },
};

export const containerVariants = entranceVariants;
export const itemVariants = entranceVariants;
export const fadeInUp = entranceVariants;
export const scaleIn = entranceVariants;
export const slideInLeft = entranceVariants;
export const slideInRight = entranceVariants;
