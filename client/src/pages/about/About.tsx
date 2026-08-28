import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  faArrowRight,
  faBolt,
  faHandshake,
  faRocket,
  faShieldHalved,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { Button } from '@/components/ui/button';

type Stats = {
  deliveriesToday: number;
  activeRiders: number;
  businessPartners: number;
};

const fallbackStats: Stats = {
  deliveriesToday: 128,
  activeRiders: 42,
  businessPartners: 65,
};

const milestones = [
  {
    year: '2022',
    title: 'The first route',
    description: 'Peekaboo started in Kigali with a small team of riders and one promise: every handoff should feel accountable.',
  },
  {
    year: '2023',
    title: 'Built for local business',
    description: 'We introduced business logistics for merchants who needed repeatable dispatch, clear records, and a dependable partner.',
  },
  {
    year: '2024',
    title: 'Kigali-wide coverage',
    description: 'Our rider network expanded across the city, connecting more neighbourhoods without losing live visibility.',
  },
  {
    year: '2025',
    title: 'A daily delivery network',
    description: 'Hundreds of businesses and individuals now rely on Peekaboo to move everyday orders across Kigali.',
  },
];

const coreValues = [
  { icon: faRocket, title: 'Speed', description: 'Every delivery is optimised for the fastest possible route and pickup.' },
  { icon: faShieldHalved, title: 'Trust', description: 'Verified riders, proof of delivery, and transparent tracking at every step.' },
  { icon: faHandshake, title: 'Partnership', description: 'We grow with the businesses and people we serve across Kigali.' },
  { icon: faBolt, title: 'Simplicity', description: 'A straightforward experience from order to drop-off.' },
];

const timelineCardVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? 30 : -30,
    scale: 0.985,
  }),
  center: { opacity: 1, y: 0, scale: 1 },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction > 0 ? -30 : 30,
    scale: 0.985,
  }),
};

const StoryTimeline = () => {
  const timelineRef = useRef<HTMLElement>(null);
  const activeMilestoneRef = useRef(0);
  const reduceMotion = useReducedMotion();
  const [activeMilestone, setActiveMilestone] = useState(0);
  const [direction, setDirection] = useState(1);
  const { scrollYProgress } = useScroll({
    target: timelineRef,
    offset: ['start start', 'end end'],
  });

  useMotionValueEvent(scrollYProgress, 'change', (latest) => {
    const nextMilestone = Math.min(
      milestones.length - 1,
      Math.floor(latest * milestones.length),
    );

    if (nextMilestone === activeMilestoneRef.current) return;
    setDirection(nextMilestone > activeMilestoneRef.current ? 1 : -1);
    activeMilestoneRef.current = nextMilestone;
    setActiveMilestone(nextMilestone);
  });

  const milestone = milestones[activeMilestone];

  return (
    <section
      ref={timelineRef}
      className="relative border-b border-(--line)"
      style={{ height: `${milestones.length * 100}svh` }}
      aria-labelledby="story-timeline-title"
    >
      <div className="sticky top-16 flex min-h-[calc(100svh-4rem)] items-center overflow-hidden py-10 sm:py-14">
        <div className="app-container grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.72fr)] lg:gap-20">
          <div className="relative order-2 min-h-[320px] sm:min-h-[350px] lg:order-1" aria-hidden="true">
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.article
                key={milestone.year}
                custom={direction}
                variants={timelineCardVariants}
                initial={reduceMotion ? false : 'enter'}
                animate="center"
                exit={reduceMotion ? undefined : 'exit'}
                transition={{
                  duration: reduceMotion ? 0 : 0.38,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="card-framed absolute inset-0 flex flex-col overflow-hidden p-7 sm:p-9"
              >
                <header className="flex items-start justify-between gap-6 border-b border-(--line) pb-6">
                  <div>
                    <span className="type-eyebrow block">Milestone</span>
                    <time className="mt-2 block text-4xl font-medium tabular-nums tracking-[-0.045em] text-(--ink) sm:text-5xl">
                      {milestone.year}
                    </time>
                  </div>
                  <span className="type-meta tabular-nums">
                    {String(activeMilestone + 1).padStart(2, '0')}
                  </span>
                </header>

                <div className="mt-auto pt-8">
                  <h3 className="type-h2 max-w-[18ch]">{milestone.title}</h3>
                  <p className="type-body-sm mt-3 max-w-[54ch] text-(--muted)">
                    {milestone.description}
                  </p>
                </div>

                <footer className="mt-8 flex gap-2 border-t border-(--line) pt-5" aria-hidden="true">
                  {milestones.map((item, index) => (
                    <span
                      key={item.year}
                      className={`h-1 flex-1 transition-colors duration-300 ${index <= activeMilestone ? 'bg-(--ink)' : 'bg-(--line)'}`}
                    />
                  ))}
                </footer>
              </motion.article>
            </AnimatePresence>
          </div>

          <header className="order-1 lg:order-2">
            <p className="type-eyebrow">Our story</p>
            <h2 id="story-timeline-title" className="type-h2 mt-2 max-w-[14ch]">
              Built in Kigali, one dependable route at a time.
            </h2>
            <div className="mt-5 max-w-[48ch] space-y-3 text-sm leading-[1.6] text-(--muted) sm:text-base">
              <p>Peekaboo started with a simple idea: city delivery should feel dependable, not uncertain.</p>
              <p>Each chapter strengthened the same promise—clear progress, accountable handoffs, and a delivery partner Kigali can rely on.</p>
            </div>
            <p className="type-meta mt-7 text-xs">
              Continue down the page to move through the story.
            </p>
          </header>

          <ol className="sr-only">
            {milestones.map((item) => (
              <li key={item.year}>
                <time>{item.year}</time>: {item.title}. {item.description}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

const About = () => {
  const [stats, setStats] = useState<Stats>(fallbackStats);
  useDocumentTitle('About');

  useEffect(() => {
    let active = true;
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');
        if (!response.ok) return;
        const data = (await response.json()) as Partial<Stats>;
        if (active) setStats({ ...fallbackStats, ...data });
      } catch {
        if (active) setStats(fallbackStats);
      }
    };
    fetchStats();
    const interval = window.setInterval(fetchStats, 15000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <main className="relative min-h-screen bg-(--paper) text-(--ink)">
      <section className="section-rhythm border-b border-(--line)">
        <div className="app-container">
          <p className="type-eyebrow">About Peekaboo</p>
          <h1 className="type-display mt-3 max-w-[18ch]">
            Kigali moves quickly. Delivery should too.
          </h1>
          <p className="mt-6 max-w-[46ch] text-base leading-[1.6] text-(--muted)">
            We connect people and businesses with verified riders, clear pricing, and live progress from pickup to handoff.
          </p>
        </div>
      </section>

      <StoryTimeline />

      <section className="invert-surface py-16 w-full flex justify-center items-center">
        <dl className="flex w-full items-center gap-8 justify-evenly">
          {[
            ['Deliveries today', stats.deliveriesToday],
            ['Active riders', stats.activeRiders],
            ['Businesses served', stats.businessPartners],
          ].map(([label, value]) => (
            <div key={label} className='flex flex-col items-center justify-center w-full'>
              <dt className="type-meta text-center">{label}</dt>
              <dd className="mt-2 text-[2.25rem] font-medium leading-none tabular-nums text-center">{Number(value).toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section-rhythm border-b border-(--line)">
        <div className="app-container">
          <p className="type-eyebrow">Core values</p>
          <h2 className="type-h2 mt-2">What we stand for.</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value) => {
              return (
                <li key={value.title} className="rounded-md border border-(--line) p-6">
                  <span className="flex size-10 items-center justify-center rounded-(--radius-control) border border-(--ink)">
                    <FontAwesomeIcon icon={value.icon} className="size-4" />
                  </span>
                  <h3 className="type-card-title mt-6">{value.title}</h3>
                  <p className="mt-2 text-sm leading-[1.55] text-(--muted)">{value.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section-rhythm">
        <div className="app-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="type-eyebrow">Ready when you are</p>
            <h2 className="type-h2 mt-2">Move something across Kigali.</h2>
          </div>
          <Button asChild size="lg" className="link-arrow">
            <Link to="/contact">
              Talk to our team
              <FontAwesomeIcon icon={faArrowRight} data-slot="icon" className="size-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default About;
