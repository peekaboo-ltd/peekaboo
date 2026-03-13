import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faMapLocationDot,
  faPhone,
  faEnvelope,
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
      className="bg-gray-900 py-20 md:py-24"
    >
      <article
        className={`max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 sm:grid-cols-3 gap-10 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-gray-400">
            Deliveries today
          </p>
          <p className="text-4xl font-semibold text-white tabular-nums">
            {stats.deliveriesToday.toLocaleString()}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-gray-400">
            Active riders
          </p>
          <p className="text-4xl font-semibold text-white tabular-nums">
            {stats.activeRiders.toLocaleString()}
          </p>
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-gray-400">
            Businesses served
          </p>
          <p className="text-4xl font-semibold text-white tabular-nums">
            {stats.businessPartners.toLocaleString()}
          </p>
        </div>
      </article>
    </section>
  );
};

const About = () => {
  useDocumentTitle('About');

  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="bg-white py-24 md:py-32">
        <article className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <p className="text-[11px] uppercase tracking-[0.16em] text-primary-600 font-medium mb-4">
            About Peekaboo
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-bold text-gray-900 leading-tight mb-6">
            We move what matters
            <br className="hidden sm:block" />
            across Kigali.
          </h1>
          <p className="text-lg text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Peekaboo connects individuals, small businesses, and growing brands with a
            trusted network of professional riders — so every parcel arrives quickly,
            safely, and with a smile.
          </p>
        </article>
      </section>

      {/* Our Story */}
      <section className="bg-gray-50 py-24 md:py-32">
        <article className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
            <div>
              <p className="text-[11px] uppercase tracking-[0.16em] text-primary-600 font-medium mb-4">
                Our Story
              </p>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Built from the streets of Kigali.
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Peekaboo started with a simple observation: sending a package across
                  Kigali shouldn't be complicated. What began as a small team of riders
                  and a shared phone has grown into a technology-driven delivery platform
                  trusted by thousands.
                </p>
                <blockquote className="border-l-2 border-primary-500 pl-5 italic text-gray-700 my-6">
                  "We believe every delivery is a promise — and we take promises seriously."
                </blockquote>
                <p>
                  Today, Peekaboo combines routing logic, rider location data, and smart
                  notifications so each delivery moves smoothly from order to drop-off.
                  We serve both individuals running personal errands and businesses
                  managing daily logistics.
                </p>
              </div>
            </div>

            <div className="flex items-start justify-center lg:justify-end">
              <div className="relative pl-8">
                <div className="absolute left-0 top-0 bottom-0 w-px bg-gray-200" />
                <div className="space-y-10">
                  {milestones.map((m) => (
                    <div key={m.year} className="relative">
                      <div className="absolute -left-8 top-0.5 w-2 h-2 rounded-full bg-primary-500 ring-4 ring-gray-50" />
                      <p className="text-[11px] uppercase tracking-[0.14em] font-semibold text-primary-600 mb-1">
                        {m.year}
                      </p>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {m.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </article>
      </section>

      {/* Mission & Vision */}
      <section className="bg-gray-900 py-24 md:py-32">
        <article className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
          <p className="text-[11px] uppercase tracking-[0.16em] text-gray-400 font-medium mb-10 text-center">
            What drives us
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="border-t-2 border-primary-500 bg-gray-800/50 rounded-lg p-8">
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-medium mb-4">
                Mission
              </h3>
              <p className="text-xl text-white italic leading-relaxed">
                To make sending and receiving parcels across Kigali simple,
                transparent, and stress-free — for every person and every business.
              </p>
            </div>
            <div className="border-t-2 border-primary-500 bg-gray-800/50 rounded-lg p-8">
              <h3 className="text-[11px] uppercase tracking-[0.14em] text-gray-400 font-medium mb-4">
                Vision
              </h3>
              <p className="text-xl text-white italic leading-relaxed">
                To be Rwanda's most trusted last-mile delivery partner,
                connecting communities and businesses through reliable logistics.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* Core Values */}
      <section className="bg-white py-24 md:py-32">
        <article className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary-600 font-medium mb-4">
              Core Values
            </p>
            <h2 className="text-3xl font-bold text-gray-900">
              What we stand for.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {coreValues.map((v) => (
              <div
                key={v.title}
                className="group p-6 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors duration-200"
              >
                <FontAwesomeIcon
                  icon={v.icon}
                  className="text-primary-600 text-lg mb-4"
                />
                <h3 className="font-semibold text-gray-900 mb-2 text-sm">
                  {v.title}
                </h3>
                <p className="text-gray-500 text-sm leading-relaxed">
                  {v.description}
                </p>
              </div>
            ))}
          </div>
        </article>
      </section>

      <Statistics />

      {/* Contact / Office */}
      <section className="bg-white py-24 md:py-32">
        <article className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center mb-14">
            <p className="text-[11px] uppercase tracking-[0.16em] text-primary-600 font-medium mb-4">
              Get in touch
            </p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Registered Office
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Peekaboo Ltd is fully registered and based in Kigali, Rwanda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="text-center p-6">
              <FontAwesomeIcon
                icon={faMapLocationDot}
                className="text-gray-900 text-xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Address</h3>
              <address className="text-gray-500 text-sm not-italic leading-relaxed">
                Niboye, Kicukiro
                <br />
                Umujyi wa Kigali
                <br />
                RWANDA
              </address>
            </div>

            <div className="text-center p-6">
              <FontAwesomeIcon
                icon={faPhone}
                className="text-gray-900 text-xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Phone</h3>
              <p className="text-gray-500 text-sm">+250 794 892 784</p>
            </div>

            <div className="text-center p-6">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-gray-900 text-xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 text-sm mb-2">Email</h3>
              <p className="text-gray-500 text-sm">info@peekaboo.co.rw</p>
            </div>
          </div>
        </article>
      </section>

      {/* CTA */}
      <section className="bg-primary-900 py-16">
        <article className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            Ready to get started?
          </h2>
          <p className="text-primary-200 mb-8 max-w-lg mx-auto">
            Join thousands of satisfied customers using Peekaboo for their delivery needs.
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-primary-900 px-8 py-2.5 rounded-md text-[13px] font-medium hover:bg-gray-100 transition-colors duration-200"
          >
            Get Started
          </Link>
        </article>
      </section>
    </main>
  );
};

export default About;
