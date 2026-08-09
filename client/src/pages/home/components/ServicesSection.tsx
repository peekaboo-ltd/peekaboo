import { ArrowUpRight } from 'lucide-react';
import RoutePreviewMap from './RoutePreviewMap';

const services = [
  {
    title: 'Same-day in Kigali',
    blurb:
      'Door-to-door across all 30 sectors of Kigali, picked up fast and dropped the same day.',
    tone: 'black',
    tag: 'Featured',
    featured: true,
  },
  {
    title: 'Business & e-commerce',
    blurb: 'API + dashboard, batch uploads, weekly invoices.',
    tone: 'yellow',
    tag: 'Business',
  },
  {
    title: 'Document delivery',
    blurb: 'Signed paperwork, contracts, ID cards. Tamper-evident sleeves.',
    tone: 'white',
    tag: 'Service',
  },
  {
    title: 'Food & small parcels',
    blurb: 'Insulated bags, careful handling, restaurant integrations.',
    tone: 'white',
    tag: 'Service',
  },
  {
    title: 'Scheduled bulk runs',
    blurb: 'Plan your week. We dispatch riders to your door at fixed slots.',
    tone: 'white',
    tag: 'Service',
  },
];

const toneClasses = {
  black: {
    card: 'group border-transparent bg-[#0a0a0a] text-white transition-all duration-300 hover:shadow-[0_18px_50px_-32px_rgba(10,10,10,0.7)]',
    chip: 'bg-[#edb100] text-[#0a0a0a]',
    body: 'text-white/65',
    arrow: 'bg-white/[0.06] text-white transition-all duration-300 group-hover:bg-white/10 group-hover:scale-110',
  },
  yellow: {
    card: 'group border-transparent bg-[#edb100] text-[#0a0a0a] transition-all duration-300 hover:shadow-[0_18px_50px_-32px_rgba(10,10,10,0.28)]',
    chip: 'bg-[#0a0a0a] text-white',
    body: 'text-black/60',
    arrow: 'bg-[#0a0a0a] text-white transition-all duration-300 group-hover:bg-black/80 group-hover:scale-110',
  },
  white: {
    card: 'home-card-interactive group border-border bg-[var(--peekaboo-surface)] text-foreground',
    chip: 'bg-[#fff4be] text-[#6b4d00]',
    body: 'text-muted-foreground',
    arrow: 'bg-[var(--peekaboo-surface)] text-foreground transition-all duration-300 group-hover:bg-[#edb100] group-hover:scale-110',
  },
} as const;

const ServicesSection = () => (
  <section id="services" className="w-full bg-[var(--peekaboo-surface)] py-12 lg:py-16">
    <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <hgroup className="max-w-[660px]">
          <p className="text-[11px] font-medium uppercase text-muted-foreground">
            Top solutions
          </p>
          <h2 className="mt-3 text-[24px] font-semibold leading-[1.05] text-foreground sm:text-[34px]">
            Built for the way
            <br />
            Kigali moves.
          </h2>
        </hgroup>
        <p className="max-w-[380px] text-[13px] font-normal leading-relaxed text-muted-foreground">
          From a single envelope to a hundred-stop run, choose the service that fits
          every order tracked end to end.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        {services.map((service) => {
          const tone = toneClasses[service.tone as keyof typeof toneClasses];
          return (
            <li key={service.title} className={service.featured ? 'lg:row-span-2' : undefined}>
              <article
                className={`flex h-full min-h-[178px] flex-col justify-between rounded-md border p-5 ${tone.card} ${
                  service.featured ? 'lg:min-h-[300px]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-medium ${tone.chip}`}
                    >
                      {service.tag}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${tone.arrow}`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-45" aria-hidden="true" />
                    </span>
                  </div>
                  <h3
                    className={`mt-5 font-semibold leading-[1.15] ${
                      service.featured ? 'text-[22px]' : 'text-[16px]'
                    }`}
                  >
                    {service.title}
                  </h3>
                  <p className={`mt-2 text-[13px] font-normal leading-relaxed ${tone.body}`}>
                    {service.blurb}
                  </p>
                </div>

                {service.featured && (
                  <footer className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[15px] font-medium">
                        Live tracking, end to end
                      </p>
                      <p className="mt-1 text-[11px] font-medium uppercase text-white/60">
                        pickup to drop-off
                      </p>
                    </div>
                    <RoutePreviewMap dark className="h-[72px] w-full sm:w-[160px]" />
                  </footer>
                )}
              </article>
            </li>
          );
        })}
      </ul>
    </article>
  </section>
);

export default ServicesSection;
