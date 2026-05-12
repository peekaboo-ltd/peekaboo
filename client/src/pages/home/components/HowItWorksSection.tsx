import { useEffect, useRef, useState } from 'react';
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import type { ComponentType, SVGProps } from 'react';
import type { HowItWorksStep } from '../home.types';
import Button from '@/components/inputs/Button';

interface HowItWorksSectionProps {
  steps: HowItWorksStep[];
  onScrollToForm: () => void;
}

type StepIcon = ComponentType<SVGProps<SVGSVGElement> & { 'aria-hidden'?: boolean }>;

const NODE_TOPS = ['16%', '50%', '84%'];

const useIsDesktop = (query = '(min-width: 1024px)') => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener('change', update);
    return () => mql.removeEventListener('change', update);
  }, [query]);

  return matches;
};

const HowItWorksSection = ({ steps, onScrollToForm }: HowItWorksSectionProps) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const reducedMotion = useReducedMotion();
  const isDesktop = useIsDesktop();
  const railEnabled = isDesktop && !reducedMotion;

  const { scrollYProgress } = useScroll({
    target: stageRef,
    offset: ['start 65%', 'end 35%'],
  });

  const fillHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  const [activeIndex, setActiveIndex] = useState(0);
  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    if (!railEnabled) {
      return;
    }
    const next = value < 0.34 ? 0 : value < 0.67 ? 1 : 2;
    setActiveIndex((current) => (current === next ? current : next));
  });

  return (
    <section
      id="how-it-works"
      className="relative w-full bg-[#f7f6f1] py-14 lg:min-h-[280vh] lg:py-0"
    >
      <div className="mx-auto grid max-w-[1280px] grid-cols-1 gap-12 px-5 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:px-10">
        <header className="lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:justify-center lg:self-start lg:py-24">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6f76]">
            How it works
          </p>
          <h2 className="mt-4 text-[28px] font-extrabold leading-[1] tracking-[-0.03em] text-[#0a0a0a] sm:text-[36px] lg:text-[48px]">
            Three taps.
            <br />
            <span className="text-[#6b6f76]">One delivery.</span>
          </h2>
          <p className="mt-5 max-w-[360px] text-[13px] leading-relaxed text-[#6b6f76] lg:text-[14px]">
            Designed for senders who do not have time to think about logistics.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-4">
            <Button
              type="button"
              onClick={onScrollToForm}
              className="h-auto min-h-0 rounded-full border-[#0a0a0a] bg-[#0a0a0a] !py-2.5 !px-5 font-semibold text-white hover:border-[#1c1c1c] hover:bg-[#1c1c1c]"
            >
              See it in action
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Button>
            <span
              aria-hidden="true"
              className="hidden items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9e9d98] lg:inline-flex"
            >
              <span className="h-px w-6 bg-[#c8c7c2]" />0{activeIndex + 1} / 03
            </span>
          </div>
        </header>

        <div ref={stageRef} className="relative">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-0 hidden h-full w-px bg-[#e6e5e0] lg:block"
          >
            <motion.div
              style={{ height: reducedMotion ? '100%' : fillHeight }}
              className="absolute left-0 top-0 w-px origin-top bg-[#e6ad00]"
            />
            {steps.map((step, index) => {
              const isActive = index === activeIndex;
              return (
                <span
                  key={`node-${step.step}`}
                  style={{ top: NODE_TOPS[index] }}
                  className={`absolute -left-[5px] flex h-[11px] w-[11px] -translate-y-1/2 items-center justify-center rounded-full border transition-colors duration-300 ${
                    isActive
                      ? 'border-[#0a0a0a] bg-[#0a0a0a]'
                      : 'border-[#c8c7c2] bg-[#f7f6f1]'
                  }`}
                />
              );
            })}
          </div>

          <ol className="relative flex flex-col gap-12 lg:gap-0 lg:pl-16">
            {steps.map((step, index) => {
              const Icon = step.icon as StepIcon;
              const isActive = !railEnabled || index === activeIndex;
              const sceneOpacity = railEnabled ? (isActive ? 1 : 0.32) : 1;

              return (
                <motion.li
                  key={step.step}
                  animate={{ opacity: sceneOpacity }}
                  transition={{ duration: 0.45, ease: 'easeOut' }}
                  className="lg:flex lg:min-h-[90vh] lg:items-center"
                >
                  <Button
                    type="button"
                    styled={false}
                    onClick={onScrollToForm}
                    className="group flex h-auto min-h-0 w-full flex-col items-start gap-6 rounded-[22px] !p-0 text-left hover:opacity-100"
                  >
                    <div className="flex w-full items-end justify-between gap-6">
                      <span
                        aria-hidden="true"
                        className={`block font-black leading-[0.82] tracking-[-0.06em] text-[clamp(96px,26vw,160px)] lg:text-[clamp(140px,16vw,220px)] ${
                          isActive
                            ? 'text-[#0a0a0a]'
                            : 'text-[#0a0a0a] lg:text-transparent lg:[-webkit-text-stroke:1.25px_#c8c7c2]'
                        } transition-colors duration-500`}
                      >
                        {step.step}
                      </span>
                      <span
                        className={`hidden h-14 w-14 shrink-0 items-center justify-center rounded-[18px] border bg-white sm:flex lg:h-16 lg:w-16 ${
                          isActive
                            ? 'border-transparent shadow-[0_0_0_2px_rgba(255,196,0,0.55),0_18px_40px_-22px_rgba(10,10,10,0.45)]'
                            : 'border-[#ececea]'
                        } transition-shadow duration-500`}
                      >
                        <Icon
                          className="h-5 w-5 text-[#0a0a0a] lg:h-6 lg:w-6"
                          aria-hidden={true}
                        />
                      </span>
                    </div>
                    <div className="max-w-[480px]">
                      <span className="block text-[22px] font-extrabold leading-tight tracking-[-0.025em] text-[#0a0a0a] sm:text-[28px] lg:text-[36px]">
                        {step.title}
                      </span>
                      <span className="mt-3 block text-[13px] leading-relaxed text-[#6b6f76] lg:text-[15px]">
                        {step.description}
                      </span>
                      <span className="mt-6 inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#0a0a0a] transition-[gap] duration-200 group-hover:gap-3">
                        <span className="h-px w-6 bg-[#0a0a0a]" />
                        Step {index + 1}
                        <ArrowRight className="h-3 w-3" aria-hidden={true} />
                      </span>
                    </div>
                  </Button>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
