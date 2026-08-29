import { ArrowUpRight } from 'lucide-react';
import { publicAccentAt, publicAccentSoftClass } from '@/components/public/PublicIconBadge';
import RoutePreviewMap from './RoutePreviewMap';

const services = [
  {
    title: 'Same-day in Kigali',
    blurb:
      'Door-to-door across all 30 sectors of Kigali, picked up fast and dropped the same day.',
    tone: 'inverted',
    tag: 'Featured',
    featured: true,
  },
  {
    title: 'Business & e-commerce',
    blurb: 'API + dashboard, batch uploads, weekly invoices.',
    tone: 'quiet',
    tag: 'Business',
  },
  {
    title: 'Document delivery',
    blurb: 'Signed paperwork, contracts, ID cards. Tamper-evident sleeves.',
    tone: 'quiet',
    tag: 'Service',
  },
  {
    title: 'Food & small parcels',
    blurb: 'Insulated bags, careful handling, restaurant integrations.',
    tone: 'quiet',
    tag: 'Service',
  },
  {
    title: 'Scheduled bulk runs',
    blurb: 'Plan your week. We dispatch riders to your door at fixed slots.',
    tone: 'quiet',
    tag: 'Service',
  },
];

const toneClasses = {
  // Inside .invert-surface, --ink and --paper are locally swapped, so these
  // children read the same tokens they would on a white card and stay correct
  // in dark mode, on focus, and under text selection.
  inverted: {
    card: 'invert-surface group',
    chip: 'bg-(--surface) text-(--muted)',
    body: 'text-(--muted)',
  },
  quiet: {
    card: 'card-quiet group',
    chip: 'bg-(--paper) text-(--muted)',
    body: 'text-(--muted)',
  },
} as const;

const ServicesSection = () => (
  <section id="services" className="section-rhythm w-full border-(--line) bg-(--paper)">
    <article className="app-container">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <hgroup className="max-w-[660px]">
          <p className="type-eyebrow">
            Top solutions
          </p>
          <h2 className="type-h2 mt-2">
            Built for the way
            <br />
            Kigali moves.
          </h2>
        </hgroup>
        <p className="type-body-sm max-w-[380px] text-(--muted)">
          From a single envelope to a hundred-stop run, choose the service that fits
          every order tracked end to end.
        </p>
      </header>

      <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        {services.map((service, index) => {
          const tone = toneClasses[service.tone as keyof typeof toneClasses];
          const arrowAccent = publicAccentSoftClass[publicAccentAt(index)];
          return (
            <li key={service.title} className={service.featured ? 'lg:row-span-2' : undefined}>
              <article
                className={`flex h-full min-h-[178px] flex-col justify-between rounded-(--radius-card) p-6 ${tone.card} ${
                  service.featured ? 'lg:min-h-[300px]' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-4">
                    <span
                      className={`inline-flex h-6 items-center rounded-(--radius-pill) px-2.5 text-xs font-normal ${tone.chip}`}
                    >
                      {service.tag}
                    </span>
                    <span
                      className={`flex h-8 w-8 items-center justify-center rounded-full transition-[background-color,color] duration-200 ${arrowAccent}`}
                    >
                      <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200" aria-hidden="true" />
                    </span>
                  </div>
                  <h3
                    className={service.featured ? 'type-h3 mt-4' : 'type-card-title mt-4'}
                  >
                    {service.title}
                  </h3>
                  <p className={`mt-2 text-sm font-normal leading-relaxed ${tone.body}`}>
                    {service.blurb}
                  </p>
                </div>

                {service.featured && (
                  <footer className="mt-6 flex flex-col gap-4 border-t border-(--line) pt-5 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <p className="text-[15px] font-normal">
                        Live tracking, end to end
                      </p>
                      <p className="mt-1 text-xs font-normal text-(--paper)">
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
