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
    <section className="section-rhythm w-full border-t border-(--line) bg-(--paper)">
      <motion.article
        className="app-container"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <motion.header className="mb-8 max-w-[640px]" variants={itemVariants}>
          <p className="text-[11px] font-medium text-muted-foreground">
            {badgeLabel}
          </p>
          <h2 className="mt-3 text-[24px] font-medium leading-[1.05] text-foreground sm:text-[34px]">
            {title}
          </h2>
          <p className="mt-3 text-[13px] font-normal leading-relaxed text-muted-foreground">{subtitle}</p>
        </motion.header>

        <motion.figure className="relative" variants={itemVariants}>
          <blockquote className="relative overflow-hidden rounded-(--radius-card) border border-(--line) bg-(--paper) p-6 sm:p-8 lg:p-10">
            <Quote
              className="absolute right-6 top-6 h-10 w-10 text-[var(--surface)]"
              aria-hidden="true"
            />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTestimonial}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, y: 0 }}
                transition={{ duration: 0.2, ease: [0, 0, 1, 1] }}
                className="relative z-10 max-w-[720px]"
              >
                <p className="text-[18px] font-normal leading-relaxed text-foreground sm:text-[22px]">
                  &ldquo;{current.content}&rdquo;
                </p>

                <figcaption className="mt-6 flex items-center gap-4">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--ink)] text-[15px] font-medium text-[var(--paper)]">
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
                  aria-selected={index === activeTestimonial}
                  className="flex size-6 items-center justify-center rounded-(--radius-pill) border border-(--line) text-xs text-(--muted) outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] aria-selected:border-(--ink) aria-selected:bg-(--ink) aria-selected:text-(--paper) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
                  aria-label={`Go to testimonial ${index + 1}`}
                >
                  {index + 1}
                </button>
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
                className="pointer-events-auto group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[var(--surface)] text-muted-foreground transition-[background-color,color,border-color,box-shadow] duration-200 hover:border-[var(--surface-hover)] hover:text-foreground"
                aria-label="Previous testimonial"
              >
                <ChevronLeft className="h-4 w-4 transition-transform duration-200" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
                }
                className="pointer-events-auto group flex h-10 w-10 items-center justify-center rounded-full border border-border bg-[var(--surface)] text-muted-foreground transition-[background-color,color,border-color,box-shadow] duration-200 hover:border-[var(--surface-hover)] hover:text-foreground"
                aria-label="Next testimonial"
              >
                <ChevronRight className="h-4 w-4 transition-transform duration-200" />
              </button>
            </nav>
          )}
        </motion.figure>
      </motion.article>
    </section>
  );
};

export default TestimonialsSection;
