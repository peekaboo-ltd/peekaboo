import { useRef, useState, useEffect } from 'react';
import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from 'framer-motion';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { useGetLandingStatsQuery } from '@/api/queries/landing.queries';
import HeroTrustIndicators from '@/pages/home/components/HeroTrustIndicators';
import FinalCtaSection from '@/pages/home/components/FinalCtaSection';
import PublicHeadquartersMap from '@/components/maps/PublicHeadquartersMap';
import ValueCharacter, {
  type ValueCharacterVariant,
} from './components/ValueCharacter';
import { useHomeContent } from '@/pages/home/useHomeContent';
import { entranceVariants } from '@/pages/home/home.animations';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';

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
  const { t } = useI18n();
  const milestones = ['2022', '2023', '2024', '2025'].map((year) => ({
    year,
    title: t(`about.milestone.${year}.title`),
    description: t(`about.milestone.${year}.description`),
  }));
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
      className="relative border-b border-(--line) bg-(--paper)"
      style={{ height: `${milestones.length * 100}svh` }}
      aria-labelledby="story-timeline-title"
    >
      <div className="sticky top-16 flex min-h-[calc(100svh-4rem)] items-center overflow-hidden py-10 sm:py-14">
        <div className="app-container grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1.08fr)_minmax(320px,0.72fr)] lg:gap-20">
          <div
            className="relative order-2 min-h-[320px] sm:min-h-[350px] lg:order-1"
            aria-hidden="true"
          >
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
                    <span className="type-eyebrow block">{t('about.milestone')}</span>
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

                <footer
                  className="mt-8 flex gap-2 border-t border-(--line) pt-5"
                  aria-hidden="true"
                >
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
            <p className="type-eyebrow">{t('about.storyEyebrow')}</p>
            <h2 id="story-timeline-title" className="type-h2 mt-2 max-w-[14ch]">
              {t('about.storyTitle')}
            </h2>
            <div className="mt-5 max-w-[48ch] space-y-3 text-sm leading-[1.6] text-(--muted) sm:text-base">
              <p>
                {t('about.storyP1')}
              </p>
              <p>
                {t('about.storyP2')}
              </p>
            </div>
            <p className="type-meta mt-7 text-xs">
              {t('about.storyScroll')}
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
  const { t } = useI18n();
  const [stats, setStats] = useState<Stats>(fallbackStats);
  const { data: landingStats } = useGetLandingStatsQuery();
  const { heroCopy } = useHomeContent();

  useDocumentTitle(t('about.docTitle'));
  const coreValues: Array<{ variant: ValueCharacterVariant; title: string; description: string }> =
    (['speed', 'trust', 'partnership', 'simplicity'] as ValueCharacterVariant[]).map((variant) => ({
      variant,
      title: t(`about.values.${variant}.title`),
      description: t(`about.values.${variant}.description`),
    }));

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
    <main className="home-page relative min-h-screen w-full overflow-x-clip bg-(--paper)">
      <section className="flex min-h-[calc(100vh-64px)] w-full items-center justify-center bg-(--paper) text-(--ink)">
        <div className="app-container pb-10 pt-8 lg:pb-14 lg:pt-10">
          <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.92fr)] lg:gap-14">
            <motion.div
              className="flex flex-col items-start gap-5"
              variants={entranceVariants}
              initial="hidden"
              animate="visible"
            >
              <hgroup className="space-y-3">
                <p className="type-eyebrow">{t('about.eyebrow')}</p>
                <h1 className="type-display max-w-[16ch] text-(--ink)">
                  {t('about.heroTitle')}
                </h1>
                <p className="type-body max-w-[52ch] text-(--muted)">
                  {t('about.heroDescription')}
                </p>
              </hgroup>

              <dl className="flex w-full max-w-md flex-wrap gap-x-10 gap-y-4 border-t border-(--line) pt-6">
                <div>
                  <dt className="type-eyebrow">{t('about.deliveriesToday')}</dt>
                  <dd className="type-card-title mt-2 tabular-nums">
                    {stats.deliveriesToday.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="type-eyebrow">{t('about.activeRiders')}</dt>
                  <dd className="type-card-title mt-2 tabular-nums">
                    {stats.activeRiders.toLocaleString()}
                  </dd>
                </div>
                <div>
                  <dt className="type-eyebrow">{t('about.businessesServed')}</dt>
                  <dd className="type-card-title mt-2 tabular-nums">
                    {stats.businessPartners.toLocaleString()}
                  </dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={() => {
                  document.getElementById('our-story')?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start',
                  });
                }}
                className="link-sweep inline-flex items-center gap-1.5 text-sm text-(--ink)"
              >
                {t('about.readStory')}
                <FontAwesomeIcon icon={faChevronDown} className="size-4" aria-hidden="true" />
              </button>

              <HeroTrustIndicators
                landingStats={landingStats}
                activeCustomersLabel={heroCopy.activeCustomersLabel}
                completedOrdersLabel={heroCopy.completedOrdersLabel}
                fallbackLabel={heroCopy.growingCommunityLabel}
              />
            </motion.div>

            <div className="max-lg:hidden">
              <PublicHeadquartersMap
                ridersLabel={t('about.ridersActive', { count: stats.activeRiders })}
              />
            </div>
          </div>
        </div>
      </section>

      <div id="our-story">
        <StoryTimeline />
      </div>

      <section className="section-rhythm w-full border-(--line) bg-(--paper)">
        <div className="app-container">
          <header className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <hgroup>
              <p className="type-eyebrow">{t('about.values.eyebrow')}</p>
              <h2 className="type-h2 mt-2">
                {t('about.values.title1')}
                <br />
                {t('about.values.title2')}
              </h2>
            </hgroup>
            <p className="max-w-[46ch] text-sm leading-[1.55] text-(--muted)">
              {t('about.values.description')}
            </p>
          </header>

          <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value) => (
              <li
                key={value.title}
                className="rounded-md border border-(--line) p-6"
              >
                <ValueCharacter variant={value.variant} />
                <h3 className="type-h3 mt-6">{value.title}</h3>
                <p className="mt-3 text-sm leading-[1.55] text-(--muted)">
                  {value.description}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <FinalCtaSection
        title={t('about.ctaTitle')}
        subtitle={t('about.ctaSubtitle')}
        buttonLabel={t('about.ctaButton')}
      />
    </main>
  );
};

export default About;
