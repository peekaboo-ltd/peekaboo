import { ArrowUpRight } from 'lucide-react';
import ImageSlot from './ImageSlot';

const services = [
  {
    title: 'Same-day in Kigali',
    blurb:
      'Door-to-door across all 30 sectors, picked up within 15 minutes and dropped before sundown.',
    tone: 'black',
    featured: true,
  },
  {
    title: 'Business & e-commerce',
    blurb: 'API + dashboard, batch uploads, weekly invoices.',
    tone: 'yellow',
  },
  {
    title: 'Province delivery',
    blurb: 'Next-day to Musanze, Huye, Rubavu, Nyagatare.',
    tone: 'white',
  },
  {
    title: 'Document delivery',
    blurb: 'Signed paperwork, contracts, ID cards. Tamper-evident sleeves.',
    tone: 'white',
  },
  {
    title: 'Food & small parcels',
    blurb: 'Insulated bags, careful handling, restaurant integrations.',
    tone: 'white',
  },
  {
    title: 'Scheduled bulk runs',
    blurb: 'Plan your week. We dispatch riders to your door at fixed slots.',
    tone: 'white',
  },
];

const toneClasses = {
  black: {
    card: 'border-transparent bg-[#0a0a0a] text-white',
    chip: 'bg-[#ffc400] text-[#0a0a0a]',
    body: 'text-white/65',
    arrow: 'bg-white/[0.06] text-white',
  },
  yellow: {
    card: 'border-transparent bg-[#ffc400] text-[#0a0a0a]',
    chip: 'bg-[#0a0a0a] text-white',
    body: 'text-black/60',
    arrow: 'bg-[#0a0a0a] text-white',
  },
  white: {
    card: 'home-card-interactive border-[#ececea] bg-white text-[#0a0a0a]',
    chip: 'bg-[#fff4be] text-[#6b4d00]',
    body: 'text-[#6b6f76]',
    arrow: 'bg-[var(--peekaboo-warm)] text-[#0a0a0a]',
  },
} as const;

const ServicesSection = () => (
  <section id="services" className="w-full border-t border-[#ececea] bg-white py-10 lg:py-14">
    <article className="mx-auto max-w-[1280px] px-5 sm:px-8 lg:px-10">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <hgroup className="max-w-[660px]">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#6b6f76]">
            Top solutions
          </p>
          <h2 className="mt-3 text-[24px] font-extrabold leading-[1.02] tracking-[-0.025em] text-[#0a0a0a] sm:text-[34px]">
            Built for the way
            <br />
            Kigali moves.
          </h2>
        </hgroup>
        <p className="max-w-[380px] text-[13px] leading-relaxed text-[#6b6f76]">
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
                className={`flex h-full min-h-[178px] flex-col justify-between rounded-[12px] border p-5 ${tone.card} ${
                  service.featured ? 'lg:min-h-[300px]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`inline-flex h-[22px] items-center rounded-full px-2.5 text-[11px] font-bold ${tone.chip}`}
                    >
                      {service.tone === 'yellow'
                        ? '01'
                        : service.featured
                          ? 'Featured'
                          : 'Service'}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${tone.arrow}`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden="true" />
                    </span>
                  </div>
                  <h3
                    className={`mt-5 font-bold leading-[1.1] tracking-[-0.02em] ${
                      service.featured ? 'text-[22px]' : 'text-[16px]'
                    }`}
                  >
                    {service.title}
                  </h3>
                  <p className={`mt-2 text-[13px] leading-relaxed ${tone.body}`}>
                    {service.blurb}
                  </p>
                </div>

                {service.featured && (
                  <footer className="mt-6 flex flex-col gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[24px] font-extrabold tracking-[-0.02em]">
                        Avg 26 min
                      </p>
                      <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.08em] text-white/60">
                        city-wide drop-off
                      </p>
                    </div>
                    <ImageSlot
                      label="map · live route"
                      dark
                      className="h-[72px] w-full sm:w-[160px]"
                    />
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
