import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faChevronLeft,
  faChevronRight,
  faQuoteLeft,
  faStore,
} from '@fortawesome/free-solid-svg-icons';
import type { Testimonial } from '../home.types';
import { containerVariants, fadeInUp, scaleIn } from '../home.animations';

interface TestimonialsSectionProps {
  badgeLabel: string;
  title: string;
  subtitle: string;
  testimonials: Testimonial[];
}

const TestimonialsSection = ({
  badgeLabel,
  title,
  subtitle,
  testimonials,
}: TestimonialsSectionProps) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <section className="w-full py-20 lg:py-28 border-t border-slate-100">
      <motion.article
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
      >
        <motion.header className="text-center mb-12" variants={fadeInUp}>
          <motion.span
            className="inline-block text-black font-medium text-sm tracking-wider uppercase mb-3"
            whileInView={{ opacity: [0, 1], scale: [0.8, 1] }}
            viewport={{ once: true }}
          >
            {badgeLabel}
          </motion.span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 mb-4">
            {title}
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto font-normal">{subtitle}</p>
        </motion.header>

        <motion.figure className="relative max-w-4xl mx-auto" variants={scaleIn}>
          <motion.blockquote
            className="rounded-2xl p-8 sm:p-12 lg:p-14 border border-slate-200 bg-white/95 shadow-lg shadow-slate-900/5"
            whileHover={{ boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)' }}
            transition={{ duration: 0.3 }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3, type: 'spring' }}
            >
              <FontAwesomeIcon
                icon={faQuoteLeft}
                className="absolute top-6 left-6 text-5xl text-primary-100"
                aria-hidden="true"
              />
            </motion.div>

            <AnimatePresence mode="wait">
              <motion.section
                key={activeTestimonial}
                initial={{ opacity: 0, y: 20, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10"
              >
                <p className="text-xl sm:text-2xl text-slate-700 font-normal leading-relaxed mb-8">
                  "{testimonials[activeTestimonial].content}"
                </p>

                <figcaption className="flex items-center gap-4">
                  <motion.mark
                    className="w-14 h-14 bg-primary-600 rounded-full flex items-center justify-center"
                    whileHover={{ scale: 1.1, rotate: 10 }}
                  >
                    <span className="text-xl font-medium text-white">
                      {testimonials[activeTestimonial].name.charAt(0)}
                    </span>
                  </motion.mark>
                  <cite className="not-italic">
                    <strong className="block text-lg font-semibold text-slate-900">
                      {testimonials[activeTestimonial].name}
                    </strong>
                    <span className="flex items-center gap-2 text-slate-500 font-normal">
                      <FontAwesomeIcon
                        icon={
                          testimonials[activeTestimonial].type === 'business'
                            ? faBuilding
                            : faStore
                        }
                        className="text-xs text-black"
                      />
                      {testimonials[activeTestimonial].role}
                    </span>
                  </cite>
                </figcaption>
              </motion.section>
            </AnimatePresence>

            <nav className="flex items-center justify-center gap-2.5 mt-8" aria-label="Testimonial navigation">
              {testimonials.map((_, index) => (
                <motion.button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    index === activeTestimonial
                      ? 'bg-primary-600 w-8'
                      : 'bg-slate-200 hover:bg-primary-300 w-2'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === activeTestimonial ? 'true' : undefined}
                  whileHover={{ scale: 1.3 }}
                  whileTap={{ scale: 0.9 }}
                />
              ))}
            </nav>
          </motion.blockquote>

          <nav className="flex justify-between absolute left-0 right-0 top-1/2 -translate-y-1/2 pointer-events-none">
            <motion.button
              onClick={() =>
                setActiveTestimonial(
                  (prev) => (prev - 1 + testimonials.length) % testimonials.length
                )
              }
              className="pointer-events-auto -translate-x-4 lg:-translate-x-14 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-black transition-all cursor-pointer border border-slate-200"
              aria-label="Previous testimonial"
              whileHover={{ scale: 1.15, x: -4 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </motion.button>
            <motion.button
              onClick={() =>
                setActiveTestimonial(
                  (prev) => (prev + 1) % testimonials.length
                )
              }
              className="pointer-events-auto translate-x-4 lg:translate-x-14 w-11 h-11 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-400 hover:text-black transition-all cursor-pointer border border-slate-200"
              aria-label="Next testimonial"
              whileHover={{ scale: 1.15, x: 4 }}
              whileTap={{ scale: 0.95 }}
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </motion.button>
          </nav>
        </motion.figure>
      </motion.article>
    </section>
  );
};

export default TestimonialsSection;
