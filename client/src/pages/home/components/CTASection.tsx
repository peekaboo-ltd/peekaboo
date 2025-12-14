import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { ctaContent } from '../constants/cta.constants';

export const CTASection = () => {
  return (
    <section className="relative py-12 sm:py-16 md:py-20 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800" />
      <motion.div
        className="absolute top-0 left-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, 100, 0],
          y: [0, 50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute bottom-0 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-primary-400/20 rounded-full blur-3xl"
        animate={{
          x: [0, -100, 0],
          y: [0, -50, 0],
          scale: [1.2, 1, 1.2],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <motion.h2
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {ctaContent.title}
          </motion.h2>

          <motion.p
            className="text-base sm:text-lg md:text-xl text-primary-100 mb-8 sm:mb-10 max-w-2xl mx-auto px-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            {ctaContent.subtitle}
          </motion.p>

          <motion.nav
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
            className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 justify-center px-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => document.getElementById('order-form')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white text-primary-700 rounded-xl font-semibold shadow-2xl hover:shadow-3xl transition-all flex items-center justify-center gap-2 text-sm sm:text-base"
            >
              {ctaContent.primaryButtonText}
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </motion.button>

            <motion.a
              href={ctaContent.secondaryButtonHref}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 sm:px-8 py-3 sm:py-4 bg-white/10 backdrop-blur-sm border-2 border-white/30 text-white rounded-xl font-semibold hover:bg-white/20 transition-all text-sm sm:text-base"
            >
              {ctaContent.secondaryButtonText}
            </motion.a>
          </motion.nav>
        </motion.div>
      </div>
    </section>
  );
};
