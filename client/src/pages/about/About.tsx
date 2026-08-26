import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Bolt, Handshake, Rocket, ShieldCheck } from 'lucide-react';
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
  { year: '2022', label: 'Founded in Kigali with a small team of riders' },
  { year: '2023', label: 'Launched B2B logistics for local businesses' },
  { year: '2024', label: 'Expanded to full city-wide coverage' },
  { year: '2025', label: 'Serving hundreds of businesses and individuals daily' },
];

const coreValues = [
  { icon: Rocket, title: 'Speed', description: 'Every delivery is optimised for the fastest possible route and pickup.' },
  { icon: ShieldCheck, title: 'Trust', description: 'Verified riders, proof of delivery, and transparent tracking at every step.' },
  { icon: Handshake, title: 'Partnership', description: 'We grow with the businesses and people we serve across Kigali.' },
  { icon: Bolt, title: 'Simplicity', description: 'A straightforward experience from order to drop-off.' },
];

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
    <main className="min-h-screen bg-[--paper] text-[--ink]">
      <section className="invert-surface section-rhythm">
        <div className="app-container">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">About Peekaboo</p>
          <h1 className="mt-4 max-w-[18ch] text-[clamp(2.5rem,1.6rem+3.6vw,3.75rem)] font-medium leading-[1.06] tracking-[-0.03em]">
            Kigali moves quickly. Delivery should too.
          </h1>
          <p className="mt-6 max-w-[46ch] text-base leading-[1.6] text-[--muted]">
            We connect people and businesses with verified riders, clear pricing, and live progress from pickup to handoff.
          </p>
        </div>
      </section>

      <section className="section-rhythm border-b border-[--line]">
        <div className="app-container grid gap-12 lg:grid-cols-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">Our story</p>
            <h2 className="mt-3 text-[clamp(1.75rem,1.3rem+1.8vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.02em]">
              Built in Kigali, for Kigali.
            </h2>
            <div className="mt-6 max-w-[68ch] space-y-4 text-base leading-[1.6] text-[--muted]">
              <p>Peekaboo started with a simple idea: city delivery should feel dependable, not uncertain.</p>
              <p>Today we help families, merchants, and growing teams move everyday orders with one accountable delivery partner.</p>
            </div>
          </div>
          <ol className="border-l border-[--line] pl-8">
            {milestones.map((milestone) => (
              <li key={milestone.year} className="relative pb-8 last:pb-0">
                <span className="absolute -left-[37px] top-1 size-4 rounded-[--radius-pill] bg-[--ink]" aria-hidden="true" />
                <time className="text-xs font-medium text-[--muted]">{milestone.year}</time>
                <p className="mt-1 text-sm leading-[1.55]">{milestone.label}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="invert-surface py-16">
        <dl className="app-container grid gap-8 sm:grid-cols-3">
          {[
            ['Deliveries today', stats.deliveriesToday],
            ['Active riders', stats.activeRiders],
            ['Businesses served', stats.businessPartners],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">{label}</dt>
              <dd className="mt-2 text-5xl font-light leading-none tracking-[-0.03em] tabular-nums">{Number(value).toLocaleString()}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="section-rhythm border-b border-[--line]">
        <div className="app-container">
          <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">Core values</p>
          <h2 className="mt-3 text-[clamp(1.75rem,1.3rem+1.8vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.02em]">What we stand for.</h2>
          <ul className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {coreValues.map((value) => {
              const Icon = value.icon;
              return (
                <li key={value.title} className="rounded-[--radius-card] border border-[--line] p-6">
                  <span className="flex size-10 items-center justify-center rounded-[--radius-control] border border-[--ink]">
                    <Icon className="size-4" aria-hidden="true" />
                  </span>
                  <h3 className="mt-6 text-lg font-medium">{value.title}</h3>
                  <p className="mt-2 text-sm leading-[1.55] text-[--muted]">{value.description}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section className="section-rhythm">
        <div className="app-container flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.08em] text-[--muted]">Ready when you are</p>
            <h2 className="mt-3 text-[clamp(1.75rem,1.3rem+1.8vw,2.25rem)] font-medium leading-[1.15] tracking-[-0.02em]">Move something across Kigali.</h2>
          </div>
          <Button asChild size="lg" className="link-arrow">
            <Link to="/contact">
              Talk to our team
              <ArrowRight data-slot="icon" className="size-4" aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default About;
