import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Building2, ChevronLeft, ChevronRight, Quote, Store } from 'lucide-react';
import type { Testimonial } from '../home.types';
import { containerVariants, itemVariants } from '../home.animations';

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
    if (testimonials.length <= 1) return undefined;

    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 6000);

    return () => clearInterval(interval);
  }, [testimonials.length]);

  if (!testimonials.length) return null;

  const current = testimonials[activeTestimonial];

  return (
    <section className="w-full border-t border-border bg-[var(--peekaboo-warm)] py-12 lg:py-16">
      <motion.article
        className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <motion.header className="mb-8 max-w-[640px]" variants={itemVariants}>
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
            {badgeLabel}
          </p>
          <h2 className="mt-3 text-[24px] font-semibold leading-[1.05] tracking-[-0.01em] text-foreground sm:text-[34px]">
            {title}
          </h2>
          <p className="mt-3 text-[13px] font-normal leading-relaxed text-muted-foreground">{subtitle}</p>
        </motion.header>

        <motion.figure className="relative" variants={itemVariants}>
          <blockquote className="relative overflow-hidden rounded-md border border-border bg-card p-6 sm:p-8 lg:p-10 shadow-[0_22px_70px_-52px_color-mix(in_oklab,var(--primary)_45%,transparent)]">
            <Quote
              className="absolute right-6 top-6 h-10 w-10 text-[#fff4be]"
              aria-hidden="true"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="relative z-10 max-w-[720px]"
              >
                <p className="text-[18px] font-normal leading-relaxed tracking-[-0.01em] text-foreground sm:text-[22px]">
                  &ldquo;{current.content}&rdquo;
                </p>

                <figcaption className="mt-6 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#0a0a0a] text-[15px] font-semibold text-[#edb100]">
                    {current.name.charAt(0)}
                  </span>
                  <cite className="not-italic">
                    <strong className="block text-[14px] font-medium text-foreground">
                      {current.name}
                    </strong>
                    <span className="mt-0.5 flex items-center gap-1.5 text-[12px] text-muted-foreground">
                      {current.type === 'business' ? (
                        <Building2 className="h-3 w-3" aria-hidden="true" />
                      ) : (
                        <Store className="h-3 w-3" aria-hidden="true" />
                      )}
                      {current.role}
                    </span>
                  </cite>
                </figcaption>
              </motion.div>
            </AnimatePresence>

            <nav
              className="relative z-10 mt-8 flex items-center gap-3"
              aria-label="Testimonial navigation"
            >
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => setActiveTestimonial(index)}
                  className={`group relative h-2 rounded-full transition-all duration-300 ${
                    index === activeTestimonial
                      ? 'w-8 bg-[#edb100] shadow-[0_0_8px_rgba(237,177,0,0.4)]'
                      : 'w-2 bg-border hover:bg-[#d9d8d4] hover:w-4'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                  aria-current={index === activeTestimonial ? 'true' : undefined}
                />
              ))}
            </nav>
          </blockquote>

          {testimonials.length > 1 && (
            <nav className="pointer-events-none absolute inset-y-0 -left-2 -right-2 flex items-center justify-between sm:-left-4 sm:-right-4">
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonial(
                    (prev) => (prev - 1 + testimonials.length) % testimonials.length
                  )
                }
                className="pointer-events-auto group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[0_8px_24px_-16px_rgba(10,10,10,0.35)] transition-all duration-300 hover:border-[#d49e00] hover:text-foreground hover:shadow-[0_8px_24px_-12px_rgba(237,177,0,0.25)]"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-0.5" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
                }
                className="pointer-events-auto group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-[0_8px_24px_-16px_rgba(10,10,10,0.35)] transition-all duration-300 hover:border-[#d49e00] hover:text-foreground hover:shadow-[0_8px_24px_-12px_rgba(237,177,0,0.25)]"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5" />
              </button>
            </nav>
          )}
        </motion.figure>
      </motion.article>
    </section>
  );
};

export default TestimonialsSection;
