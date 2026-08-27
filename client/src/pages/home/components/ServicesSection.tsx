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
    tone: 'inverted',
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
    card: 'group border-transparent bg-[var(--ink)] text-(--paper) transition-[background-color,color,border-color,box-shadow] duration-200',
    chip: 'bg-[var(--ink)] text-[var(--paper)]',
    body: 'text-(--paper)',
    arrow: 'bg-(--paper)/[0.06] text-(--paper) transition-[background-color,color,border-color,box-shadow] duration-200 group-hover:bg-(--paper)',
  },
  inverted: {
    card: 'group border-transparent bg-[var(--ink)] text-[var(--paper)] transition-[background-color,color,border-color,box-shadow] duration-200',
    chip: 'bg-[var(--ink)] text-(--paper)',
    body: 'text-(--paper)',
    arrow: 'bg-[var(--ink)] text-(--paper) transition-[background-color,color,border-color,box-shadow] duration-200 group-hover:bg-(--ink)',
  },
  white: {
    card: 'border border-(--line) transition-[border-color] duration-200 hover:border-(--ink) group bg-[var(--surface)] text-foreground',
    chip: 'bg-[var(--surface)] text-[var(--muted)]',
    body: 'text-muted-foreground',
    arrow: 'bg-[var(--surface)] text-foreground transition-[background-color,color,border-color,box-shadow] duration-200 group-hover:bg-[var(--ink)]',
  },
} as const;

const ServicesSection = () => (
  <section id="services" className="section-rhythm w-full border-t border-(--line) bg-(--paper)">
    <article className="app-container">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <hgroup className="max-w-[660px]">
          <p className="text-[11px] font-medium text-muted-foreground">
            Top solutions
          </p>
          <h2 className="mt-3 text-[24px] font-medium leading-[1.05] text-foreground sm:text-[34px]">
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

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        {services.map((service) => {
          const tone = toneClasses[service.tone as keyof typeof toneClasses];
          return (
            <li key={service.title} className={service.featured ? 'lg:row-span-2' : undefined}>
              <article
                className={`flex h-full min-h-[178px] flex-col justify-between rounded-(--radius-card) border p-6 ${tone.card} ${
                  service.featured ? 'lg:min-h-[300px]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`inline-flex h-6 items-center rounded-(--radius-pill) px-2.5 text-xs font-medium ${tone.chip}`}
                    >
                      {service.tag}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full ${tone.arrow}`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200" aria-hidden="true" />
                    </span>
                  </div>
                  <h3
                    className={`mt-5 font-medium leading-[1.15] ${
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
                  <footer className="mt-6 flex flex-col gap-4 border-t border-(--line) pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[15px] font-medium">
                        Live tracking, end to end
                      </p>
                      <p className="mt-1 text-[11px] font-medium text-(--paper)">
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
