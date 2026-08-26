import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bolt,
  Handshake,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Target,
} from 'lucide-react';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  containerVariants,
  fadeInUp,
  itemVariants,
  scaleIn,
  slideInLeft,
  slideInRight,
} from '../home/home.animations';

type Stats = {
  deliveriesToday: number;
  activeRiders: number;
  businessPartners: number;
};

const milestones = [
  { year: '2022', label: 'Founded in Kigali with a small team of riders' },
  { year: '2023', label: 'Launched B2B logistics for local businesses' },
  { year: '2024', label: 'Expanded to full city-wide coverage' },
  { year: '2025', label: 'Serving hundreds of businesses and individuals daily' },
];

const coreValues = [
  {
    icon: Rocket,
    title: 'Speed',
    description: 'Every delivery is optimised for the fastest possible route and pickup.',
  },
  {
    icon: ShieldCheck,
    title: 'Trust',
    description: 'Verified riders, proof of delivery, and transparent tracking at every step.',
  },
  {
    icon: Handshake,
    title: 'Partnership',
    description: 'We grow with the businesses and people we serve across Kigali.',
  },
  {
    icon: Bolt,
    title: 'Simplicity',
    description: 'A clean, straightforward experience from order to drop-off.',
  },
];

const Statistics = () => {
  const [stats, setStats] = useState<Stats>({
    deliveriesToday: 0,
    activeRiders: 0,
    businessPartners: 0,
  });
  const ref = useRef<HTMLElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const animateTo = (next: Stats) => {
      const start = { ...stats };
      const duration = 700;
      const startTime = performance.now();

      const step = (now: number) => {
        if (!isMounted) return;
        const progress = Math.min((now - startTime) / duration, 1);

        const interpolated: Stats = {
          deliveriesToday: Math.round(
            start.deliveriesToday +
              (next.deliveriesToday - start.deliveriesToday) * progress,
          ),
          activeRiders: Math.round(
            start.activeRiders +
              (next.activeRiders - start.activeRiders) * progress,
          ),
          businessPartners: Math.round(
            start.businessPartners +
              (next.businessPartners - start.businessPartners) * progress,
          ),
        };

        setStats(interpolated);

        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };

      requestAnimationFrame(step);
    };

    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats');

        if (!response.ok) {
          throw new Error('Failed to fetch stats');
        }

        const data = (await response.json()) as Partial<Stats>;

        const next: Stats = {
          deliveriesToday: data.deliveriesToday ?? 128,
          activeRiders: data.activeRiders ?? 42,
          businessPartners: data.businessPartners ?? 65,
        };

        animateTo(next);
      } catch {
        animateTo({
          deliveriesToday: 128,
          activeRiders: 42,
          businessPartners: 65,
        });
      }
    };

    fetchStats();
    const id = setInterval(fetchStats, 15000);

    return () => {
      isMounted = false;
      clearInterval(id);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={ref}
      className="relative w-full overflow-hidden bg-[#0a0a0a] py-8 pb-6 lg:py-20"
    >
      <figure
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <article
        className={`relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
          <figure className="space-y-2 text-center">
            <figcaption className="text-[11px] font-medium uppercase text-[#edb100]">
              Deliveries today
            </figcaption>
            <p className="text-[40px] font-extrabold leading-[1.02] text-white tabular-nums">
              {stats.deliveriesToday.toLocaleString()}
            </p>
          </figure>
          <figure className="space-y-2 text-center">
            <figcaption className="text-[11px] font-medium uppercase text-[#edb100]">
              Active riders
            </figcaption>
            <p className="text-[40px] font-extrabold leading-[1.02] text-white tabular-nums">
              {stats.activeRiders.toLocaleString()}
            </p>
          </figure>
          <figure className="space-y-2 text-center">
            <figcaption className="text-[11px] font-medium uppercase text-[#edb100]">
              Businesses served
            </figcaption>
            <p className="text-[40px] font-extrabold leading-[1.02] text-white tabular-nums">
              {stats.businessPartners.toLocaleString()}
            </p>
          </figure>
        </div>
      </article>
    </section>
  );
};

const About = () => {
  useDocumentTitle('About');

  return (
    <main className="min-h-screen bg-[#f7f6f1]">
      <motion.section
        className="relative w-full overflow-hidden bg-[#0a0a0a] py-20 text-white lg:py-28"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <figure
          className="pointer-events-none absolute -right-32 -top-40 h-[520px] w-[520px] rounded-full"
          aria-hidden="true"
        />
        <figure
          className="pointer-events-none absolute -bottom-32 -left-24 h-[400px] w-[400px] rounded-full"
          aria-hidden="true"
        />
        <article className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 text-center">
          <motion.p
            variants={itemVariants}
            className="text-[11px] font-medium uppercase text-[#edb100] mb-4"
          >
            About Peekaboo
          </motion.p>
          <motion.h1
            variants={itemVariants}
            className="text-[32px] font-extrabold leading-[1.02] text-white sm:text-[42px] lg:text-[52px] mb-5"
          >
            We move what matters
            <br />
            <span className="text-[#edb100]">across Kigali.</span>
          </motion.h1>
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-[560px] text-[13px] leading-relaxed text-white/70"
          >
            Peekaboo connects individuals, small businesses, and growing brands with a
            trusted network of professional riders — so every parcel arrives quickly,
            safely, and with a smile.
          </motion.p>
        </article>
      </motion.section>

      <motion.section
        className="w-full bg-[#f7f6f1] py-14 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
            <motion.article variants={slideInLeft}>
              <p className="text-[11px] font-medium uppercase text-[#6b6f76] mb-4">
                Our Story
              </p>
              <h2 className="text-[24px] font-extrabold leading-[1.02] text-[#0a0a0a] sm:text-[30px] mb-6">
                Built from the streets of{' '}
                <span className="text-[#6b6f76]">Kigali.</span>
              </h2>
              <div className="space-y-4 text-[13px] leading-relaxed text-[#6b6f76]">
                <p>
                  Peekaboo started with a simple observation: sending a package across
                  Kigali shouldn't be complicated. What began as a small team of riders
                  and a shared phone has grown into a technology-driven delivery platform
                  trusted by thousands.
                </p>
                <blockquote className="text-[#1f1f1f] my-6 text-[13px]">
                  "We believe every delivery is a promise, and we take promises seriously."
                </blockquote>
                <p>
                  Today, Peekaboo combines routing logic, rider location data, and smart
                  notifications so each delivery moves smoothly from order to drop-off.
                  We serve both individuals running personal errands and businesses
                  managing daily logistics.
                </p>
              </div>
            </motion.article>

            <motion.aside
              variants={slideInRight}
              className="flex items-start justify-center lg:justify-end"
            >
              <nav className="relative pl-8" aria-label="Company milestones">
                <hr className="absolute left-0 top-0 bottom-0 w-px h-full bg-[#ececea] border-0" />
                <ol className="space-y-10">
                  {milestones.map((m) => (
                    <li key={m.year} className="relative">
                      <mark className="absolute -left-8 top-0.5 w-2 h-2 rounded-full bg-[#edb100] ring-4 ring-[#f7f6f1] bg-clip-padding" />
                      <time className="text-[11px] font-medium uppercase text-[#6b6f76] mb-1 block">
                        {m.year}
                      </time>
                      <p className="text-[13px] leading-relaxed text-[#0a0a0a]">
                        {m.label}
                      </p>
                    </li>
                  ))}
                </ol>
              </nav>
            </motion.aside>
          </div>
        </article>
      </motion.section>

      <motion.section
        className="relative w-full overflow-hidden bg-[#0a0a0a] py-14 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <figure
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <article className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <motion.p
            variants={fadeInUp}
            className="text-[11px] font-medium uppercase text-[#edb100] mb-10 text-center"
          >
            What drives us
          </motion.p>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <motion.article
              variants={scaleIn}
              className="rounded-[18px] border border-white/10 bg-white/[0.03] p-6 lg:p-8"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#edb100] text-[#0a0a0a] mb-4">
                <Target className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="text-[11px] font-medium uppercase text-[#edb100] mb-3">
                Mission
              </h3>
              <p className="text-[18px] font-medium leading-[1.2] text-white sm:text-[20px]">
                To make sending and receiving parcels across Kigali simple,
                transparent, and stress-free — for every person and every business.
              </p>
            </motion.article>
            <motion.article
              variants={scaleIn}
              className="rounded-[18px] border border-white/10 bg-white/[0.03] p-6 lg:p-8"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#edb100] text-[#0a0a0a] mb-4">
                <Lightbulb className="h-4 w-4" aria-hidden="true" />
              </span>
              <h3 className="text-[11px] font-medium uppercase text-[#edb100] mb-3">
                Vision
              </h3>
              <p className="text-[18px] font-medium leading-[1.2] text-white sm:text-[20px]">
                To be Rwanda's most trusted last-mile delivery partner,
                connecting communities and businesses through reliable logistics.
              </p>
            </motion.article>
          </div>
        </article>
      </motion.section>

      <motion.section
        className="w-full bg-white py-14 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
          <motion.header variants={fadeInUp} className="mb-10 text-center">
            <p className="text-[11px] font-medium uppercase text-[#6b6f76] mb-4">
              Core Values
            </p>
            <h2 className="text-[24px] font-extrabold leading-[1.02] text-[#0a0a0a] sm:text-[30px]">
              What we stand{' '}
              <span className="text-[#6b6f76]">for.</span>
            </h2>
          </motion.header>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((v) => (
              <motion.article
                key={v.title}
                variants={itemVariants}
                className="group rounded-[18px] border border-[#ececea] bg-white p-5 transition duration-200 hover:-translate-y-px hover:border-[#d9d8d4]"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#fff4be] text-[#0a0a0a] mb-4">
                  <v.icon className="h-4 w-4" aria-hidden="true" />
                </span>
                <h3 className="text-[14px] font-medium text-[#0a0a0a] mb-1">
                  {v.title}
                </h3>
                <p className="text-[12px] leading-relaxed text-[#6b6f76]">
                  {v.description}
                </p>
              </motion.article>
            ))}
          </div>
        </article>
      </motion.section>

      <Statistics />

      <motion.section
        className="relative w-full overflow-hidden bg-[#0a0a0a] py-14 lg:py-20"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-80px' }}
        variants={containerVariants}
      >
        <figure
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <article className="relative mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10 text-center">
          <motion.h2
            variants={fadeInUp}
            className="text-[24px] font-extrabold leading-[1.02] text-white sm:text-[30px] mb-3"
          >
            Ready to get started?
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mx-auto mb-8 max-w-[460px] text-[13px] leading-relaxed text-white/70"
          >
            Join thousands of satisfied customers using Peekaboo for their delivery needs.
          </motion.p>
          <motion.nav variants={scaleIn}>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full bg-[#edb100] px-6 py-2.5 text-[13px] font-semibold text-[#0a0a0a] shadow-[inset_0_0_0_1px_rgba(0,0,0,0.06)] transition hover:bg-[#d49e00]"
            >
              Get Started
            </Link>
          </motion.nav>
        </article>
      </motion.section>
    </main>
  );
};

export default About;
