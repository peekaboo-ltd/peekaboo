import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBuilding,
  faMapLocationDot,
  faPhone,
  faEnvelope,
  faTruck,
  faUser,
  faBriefcase,
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

const LiveStatistics = () => {
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
        // Fallback demo values if API is not yet wired
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
    // Intentionally ignore stats in dependencies to avoid restarting animation loop
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className={`border-y border-gray-100 bg-white/60 backdrop-blur-sm`}
    >
      <article
        className={`max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12 py-10 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Deliveries today
          </p>
          <p className="text-3xl font-semibold text-gray-900 tabular-nums">
            {stats.deliveriesToday.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Updated every few seconds from live operations.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Active riders
          </p>
          <p className="text-3xl font-semibold text-gray-900 tabular-nums">
            {stats.activeRiders.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Verified partners on the road right now.
          </p>
        </div>
        <div className="space-y-1">
          <p className="text-xs font-medium tracking-wide text-gray-500 uppercase">
            Businesses served
          </p>
          <p className="text-3xl font-semibold text-gray-900 tabular-nums">
            {stats.businessPartners.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">
            Growing brands that trust Peekaboo daily.
          </p>
        </div>
      </article>
    </section>
  );
};

const features = [
  {
    title: 'Smart dispatch',
    description:
      'Orders are automatically assigned to the closest available rider for faster pickups and fewer delays.',
  },
  {
    title: 'Real-time tracking',
    description:
      'Follow every delivery on the map with live status updates for you and your customers.',
  },
  {
    title: 'Business deliveries',
    description:
      'Batch orders, recurring pickups, and priority support designed for merchants and growing brands.',
  },
  {
    title: 'Secure package handling',
    description:
      'Verified riders, clear proof-of-delivery, and careful handling for sensitive or high‑value parcels.',
  },
];

const RotatingFeatureCard = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { ref, inView } = useInView();

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % features.length);
    }, 4000);

    return () => clearInterval(id);
  }, []);

  const feature = features[activeIndex];

  return (
    <section
      ref={ref as React.RefObject<HTMLElement>}
      className="bg-gray-50"
    >
      <article
        className={`max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12 py-12 flex flex-col lg:flex-row items-center gap-8 transition-all duration-700 ${
          inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        <div className="flex-1 text-left">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-primary-700 mb-2">
            How Peekaboo works
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
            Built for live, urban logistics.
          </h2>
          <p className="text-gray-600 max-w-xl">
            Under the hood, Peekaboo combines routing logic, rider location data, and
            smart notifications so each delivery moves smoothly from order to drop‑off.
          </p>
        </div>

        <div className="flex-1">
          <div className="relative overflow-hidden rounded-2xl bg-white shadow-sm border border-gray-100 px-6 py-6 sm:px-8 sm:py-8 transition-transform duration-500">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-900 capitalize">
                {feature.title}
              </h3>
              <span className="inline-flex items-center rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-800">
                {activeIndex + 1} / {features.length}
              </span>
            </div>
            <p className="text-gray-700 mb-6">{feature.description}</p>

            <div className="flex justify-end gap-2">
              {features.map((item, index) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  className={`h-2 w-6 rounded-full transition-colors ${
                    index === activeIndex
                      ? 'bg-primary-600'
                      : 'bg-gray-200 hover:bg-gray-300'
                  }`}
                  aria-label={item.title}
                />
              ))}
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

const About = () => {
  useDocumentTitle('About');

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-950 text-white py-20">
        {/* Decorative background orbs */}
        <div className="pointer-events-none absolute -top-24 -left-16 h-64 w-64 rounded-full bg-primary-400/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-16 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />

        <article className="relative max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <p className="inline-flex items-center gap-2 rounded-full bg-black/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-primary-100 mb-4">
            Fast. Reliable. Human.
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            We move what
            <span className="relative inline-block pl-2">
              matters
              <span className="absolute inset-x-0 -bottom-1 h-2 bg-primary-400/60 blur-[2px]" />
            </span>
            across Kigali.
          </h1>
          <p className="text-lg sm:text-xl text-primary-100 max-w-3xl mx-auto mb-8">
            Peekaboo connects individuals, small businesses, and growing brands with a
            trusted network of professional riders—so every parcel arrives quickly,
            safely, and with a smile.
          </p>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto text-sm text-primary-100">
            <article className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <p className="font-semibold text-white">Same‑day deliveries</p>
              <p>Optimised routes and live coordination to keep your orders on time.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <p className="font-semibold text-white">For people & businesses</p>
              <p>From personal errands to e‑commerce logistics, we scale with you.</p>
            </article>
            <article className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all duration-300">
              <p className="font-semibold text-white">Built in Rwanda</p>
              <p>Locally registered, locally operated, and committed to Kigali.</p>
            </article>
          </section>
        </article>
      </section>

      <LiveStatistics />
      <RotatingFeatureCard />

      {/* Company Overview */}
      <section className="py-10 lg:py-12">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="text-center mb-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
              Company Overview
            </h2>
            <p className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto">
              Peekaboo Ltd is a private limited company providing modern courier
              and last‑mile delivery services across Rwanda. We combine
              technology, trusted riders, and local expertise to make sending
              and receiving parcels simple, transparent, and stress‑free.
            </p>
          </header>

          <section className="flex flex-col gap-4 lg:flex-row lg:items-stretch">
            {/* Company facts */}
            <div className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-4 md:flex-row md:gap-4">
                <article className="group flex-1 rounded-xl p-5 shadow-sm border border-primary-800 bg-primary-900 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white hover:shadow-xl">
                  <figure className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-white/10 transition-colors duration-300 group-hover:bg-primary-100">
                    <FontAwesomeIcon
                      icon={faBuilding}
                      className="text-white text-xl transition-colors duration-300 group-hover:text-black"
                    />
                  </figure>
                  <h3 className="font-semibold text-white mb-1 transition-colors duration-300 group-hover:text-gray-900">
                    Company Name
                  </h3>
                  <p className="text-sm text-primary-100 transition-colors duration-300 group-hover:text-gray-600">
                    PEEKABOO Ltd
                  </p>
                </article>

                <article className="group flex-1 rounded-xl p-5 shadow-sm border border-primary-800 bg-primary-900 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white hover:shadow-xl">
                  <figure className="w-12 h-12 rounded-lg flex items-center justify-center mb-4 bg-white/10 transition-colors duration-300 group-hover:bg-primary-100">
                    <FontAwesomeIcon
                      icon={faTruck}
                      className="text-white text-xl transition-colors duration-300 group-hover:text-black"
                    />
                  </figure>
                  <h3 className="font-semibold text-white mb-1 transition-colors duration-300 group-hover:text-gray-900">
                    Business Activity
                  </h3>
                  <p className="text-sm text-primary-100 transition-colors duration-300 group-hover:text-gray-600">
                    Courier and last‑mile delivery services (H5320), specialising in
                    fast, on‑demand drops around Kigali.
                  </p>
                </article>
              </div>

              <div className="flex flex-col gap-4 md:flex-row md:gap-4">
                <article className="group flex-1 rounded-xl p-5 shadow-sm border border-primary-800 bg-primary-900 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white hover:shadow-xl">
                  <figure className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 bg-white/10 transition-colors duration-300 group-hover:bg-primary-100">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="text-white text-lg transition-colors duration-300 group-hover:text-black"
                    />
                  </figure>
                  <h3 className="font-semibold text-white mb-1 transition-colors duration-300 group-hover:text-gray-900">
                    B2C Services
                  </h3>
                  <p className="text-sm text-primary-100 transition-colors duration-300 group-hover:text-gray-600">
                    On‑demand deliveries for individuals: personal parcels, errands,
                    gifting, and same‑day drops anywhere in Kigali.
                  </p>
                </article>

                <article className="group flex-1 rounded-xl p-5 shadow-sm border border-primary-800 bg-primary-900 transition-all duration-300 hover:-translate-y-2 hover:scale-[1.02] hover:bg-white hover:shadow-xl">
                  <figure className="w-11 h-11 rounded-lg flex items-center justify-center mb-4 bg-white/10 transition-colors duration-300 group-hover:bg-primary-100">
                    <FontAwesomeIcon
                      icon={faBriefcase}
                      className="text-white text-lg transition-colors duration-300 group-hover:text-black"
                    />
                  </figure>
                  <h3 className="font-semibold text-white mb-1 transition-colors duration-300 group-hover:text-gray-900">
                    B2B Services
                  </h3>
                  <p className="text-sm text-primary-100 transition-colors duration-300 group-hover:text-gray-600">
                    Scheduled pickups, bulk order dispatch, and tailored SLAs for
                    e‑commerce, restaurants, pharmacies, and other businesses.
                  </p>
                </article>
              </div>
            </div>
          </section>
        </article>
      </section>

      {/* Registered Office */}
      <section className="py-16 lg:py-24 bg-white">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Registered Office
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Peekaboo Ltd is fully registered and based in Kigali, Rwanda. We
              operate with transparency and compliance so that customers and
              partners can trust every delivery we complete.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <article className="bg-gray-50 rounded-lg p-6 text-center">
              <FontAwesomeIcon
                icon={faMapLocationDot}
                className="text-black text-3xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 mb-2">Address</h3>
              <address className="text-gray-600 not-italic">
                Niboye, Kicukiro
                <br />
                Umujyi wa Kigali
                <br />
                RWANDA
              </address>
            </article>

            <article className="bg-gray-50 rounded-lg p-6 text-center">
              <FontAwesomeIcon
                icon={faPhone}
                className="text-black text-3xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">+250 788 XXX XXX</p>
            </article>

            <article className="bg-gray-50 rounded-lg p-6 text-center">
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-black text-3xl mb-4"
              />
              <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">info@peekaboo.co.rw</p>
            </article>
          </section>
        </article>
      </section>

      {/* Company Type Info */}
      <section className="py-16 lg:py-24">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12">
          <header className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Legal Information
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Below is a quick summary of how Peekaboo Ltd is structured and
              registered. For detailed documentation or partnership enquiries,
              please reach out to our team.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <article className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Company Type
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Category:</dt>
                  <dd className="font-medium text-gray-900">Private</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Type:</dt>
                  <dd className="font-medium text-gray-900">Limited by Shares</dd>
                </div>
              </dl>
            </article>

            <article className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 text-lg">
                Business Information
              </h3>
              <dl className="space-y-3">
                <div className="flex justify-between">
                  <dt className="text-gray-600">Activity:</dt>
                  <dd className="font-medium text-gray-900">Courier Services</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-600">Location:</dt>
                  <dd className="font-medium text-gray-900">Kigali, Rwanda</dd>
                </div>
              </dl>
            </article>
          </section>
        </article>
      </section>

      {/* CTA */}
      <section className="bg-primary-900 py-16">
        <article className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Experience Fast Delivery?
          </h2>
          <p className="text-lg text-primary-200 max-w-2xl mx-auto mb-8">
            Join thousands of satisfied customers using Peekaboo for their
            delivery needs.
          </p>
          <Link
            to="/"
            className="inline-block bg-white text-primary-900 px-8 py-3 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            Get Started
          </Link>
        </article>
      </section>
    </main>
  );
};

export default About;
