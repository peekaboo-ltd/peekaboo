import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHandshake,
  faShieldHalved,
  faRocket,
  faBolt,
} from '@fortawesome/free-solid-svg-icons';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';

type Stats = {
  deliveriesToday: number;
  activeRiders: number;
  businessPartners: number;
};

const useInView = (options?: IntersectionObserverInit) => {
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
      { threshold: 0.2, ...options },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [options]);

  return { ref, inView };
};

const milestones = [
  { year: '2022', label: 'Founded in Kigali with a small team of riders' },
  { year: '2023', label: 'Launched B2B logistics for local businesses' },
  { year: '2024', label: 'Expanded to full city-wide coverage' },
  { year: '2025', label: 'Serving hundreds of businesses and individuals daily' },
];

const coreValues = [
  {
    icon: faRocket,
    title: 'Speed',
    description: 'Every delivery is optimised for the fastest possible route and pickup.',
  },
  {
    icon: faShieldHalved,
    title: 'Trust',
    description: 'Verified riders, proof of delivery, and transparent tracking at every step.',
  },
  {
    icon: faHandshake,
    title: 'Partnership',
    description: 'We grow with the businesses and people we serve across Kigali.',
  },
  {
    icon: faBolt,
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

  const { ref, inView } = useInView();

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
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-primary-900 py-20 md:py-24"
    >
      <article
        className={`max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <figure className="space-y-2">
          <figcaption className="text-[11px] font-medium tracking-[0.16em] uppercase text-primary-400">
            Deliveries today
          </figcaption>
          <p className="text-4xl font-semibold text-white tabular-nums">
            {stats.deliveriesToday.toLocaleString()}
          </p>
        </figure>
        <figure className="space-y-2">
          <figcaption className="text-[11px] font-medium tracking-[0.16em] uppercase text-primary-400">
            Active riders
          </figcaption>
          <p className="text-4xl font-semibold text-white tabular-nums">
            {stats.activeRiders.toLocaleString()}
          </p>
        </figure>
        <figure className="space-y-2">
          <figcaption className="text-[11px] font-medium tracking-[0.16em] uppercase text-primary-400">
            Businesses served
          </figcaption>
          <p className="text-4xl font-semibold text-white tabular-nums">
            {stats.businessPartners.toLocaleString()}
          </p>
        </figure>
      </article>
    </section>
  );
};

const About = () => {
  useDocumentTitle('About');

  return (
    <main className="min-h-screen bg-[#FAFAF7]">
      <section className="relative overflow-hidden bg-primary-950 py-28 md:py-36">
        <figure
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(123,143,86,0.15),transparent_40%),radial-gradient(circle_at_80%_0%,rgba(37,52,63,0.3),transparent_35%)]"
          aria-hidden="true"
        />
        <article className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[11px] uppercase tracking-[0.16em] text-secondary-400 font-semibold mb-4">
            About Peekaboo
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-white leading-tight mb-6">
            We move what matters
            <br className="hidden sm:block" />
            <span className="text-secondary-300"> across Kigali.</span>
          </h1>
          <p className="text-[13px] text-primary-300 max-w-2xl mx-auto leading-relaxed">
            Peekaboo connects individuals, small businesses, and growing brands with a
            trusted network of professional riders — so every parcel arrives quickly,
            safely, and with a smile.
          </p>
        </article>
      </section>

      <section className="bg-[#FAFAF7] py-24 md:py-32">
        <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <article>
              <p className="text-[11px] uppercase tracking-[0.16em] text-secondary-600 font-semibold mb-4">
                Our Story
              </p>
              <h2 className="text-3xl font-bold text-primary-900 mb-6">
                Built from the streets of Kigali.
              </h2>
              <section className="space-y-4 text-primary-600 text-[13px] leading-relaxed">
                <p>
                  Peekaboo started with a simple observation: sending a package across
                  Kigali shouldn't be complicated. What began as a small team of riders
                  and a shared phone has grown into a technology-driven delivery platform
                  trusted by thousands.
                </p>
                <blockquote className="border-l-2 border-secondary-500 pl-5 italic text-primary-700 my-6 text-[13px]">
                  "We believe every delivery is a promise — and we take promises seriously."
                </blockquote>
                <p>
                  Today, Peekaboo combines routing logic, rider location data, and smart
                  notifications so each delivery moves smoothly from order to drop-off.
                  We serve both individuals running personal errands and businesses
                  managing daily logistics.
                </p>
              </section>
            </article>

            <aside className="flex items-start justify-center lg:justify-end">
              <nav className="relative pl-8" aria-label="Company milestones">
                <hr className="absolute left-0 top-0 bottom-0 w-px h-full bg-primary-200 border-0" />
                <ol className="space-y-10">
                  {milestones.map((m) => (
                    <li key={m.year} className="relative">
                      <mark className="absolute -left-8 top-0.5 w-2 h-2 rounded-full bg-secondary-500 ring-4 ring-[#FAFAF7] bg-clip-padding" />
                      <time className="text-[11px] uppercase tracking-[0.14em] font-semibold text-secondary-600 mb-1 block">
                        {m.year}
                      </time>
                      <p className="text-primary-600 text-[13px] leading-relaxed">
                        {m.label}
                      </p>
                    </li>
                  ))}
                </ol>
              </nav>
            </aside>
          </section>
        </article>
      </section>

      <section className="bg-primary-900 py-24 md:py-32">
        <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-[11px] uppercase tracking-[0.16em] text-primary-400 font-medium mb-10 text-center">
            What drives us
          </p>
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <article className="border-t-2 border-secondary-500 bg-primary-800/50 rounded-xl p-8">
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-primary-400 font-medium mb-4">
                Mission
              </h3>
              <p className="text-xl text-white italic leading-relaxed">
                To make sending and receiving parcels across Kigali simple,
                transparent, and stress-free — for every person and every business.
              </p>
            </article>
            <article className="border-t-2 border-secondary-500 bg-primary-800/50 rounded-xl p-8">
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-primary-400 font-medium mb-4">
                Vision
              </h3>
              <p className="text-xl text-white italic leading-relaxed">
                To be Rwanda's most trusted last-mile delivery partner,
                connecting communities and businesses through reliable logistics.
              </p>
            </article>
          </section>
        </article>
      </section>

      <section className="bg-white py-24 md:py-32">
        <article className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <header className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.16em] text-secondary-600 font-semibold mb-4">
              Core Values
            </p>
            <h2 className="text-3xl font-bold text-primary-900">
              What we stand for.
            </h2>
          </header>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v) => (
              <li key={v.title}>
                <article className="group p-6 rounded-xl border border-primary-100 hover:border-secondary-300 transition-all duration-300 hover:shadow-sm">
                  <FontAwesomeIcon
                    icon={v.icon}
                    className="text-secondary-600 text-lg mb-4"
                  />
                  <h3 className="font-semibold text-primary-900 mb-2 text-[13px]">
                    {v.title}
                  </h3>
                  <p className="text-primary-500 text-[13px] leading-relaxed">
                    {v.description}
                  </p>
                </article>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <Statistics />

      <section className="bg-primary-900 py-16">
        <article className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-primary-300 mb-8 max-w-lg mx-auto text-[13px]">
            Join thousands of satisfied customers using Peekaboo for their delivery needs.
          </p>
          <Link
            to="/"
            className="inline-block bg-secondary-500 text-white px-8 py-2.5 rounded-md text-[13px] font-medium hover:bg-secondary-600 transition-colors duration-200"
          >
            Get Started
          </Link>
        </article>
      </section>
    </main>
  );
};

export default About;
