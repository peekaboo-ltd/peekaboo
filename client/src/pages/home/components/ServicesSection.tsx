import { ArrowUpRight } from 'lucide-react';
import { publicAccentAt, publicAccentSoftClass } from '@/components/public/PublicIconBadge';
import RoutePreviewMap from './RoutePreviewMap';
import { useI18n } from '@/i18n/i18n';

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

const ServicesSection = () => {
  const { t } = useI18n();
  const services = [
    { title: t('home.services.sameDay.title'), blurb: t('home.services.sameDay.description'), tone: 'inverted', tag: t('home.services.featured'), featured: true },
    { title: t('home.services.business.title'), blurb: t('home.services.business.description'), tone: 'quiet', tag: t('home.services.businessTag') },
    { title: t('home.services.documents.title'), blurb: t('home.services.documents.description'), tone: 'quiet', tag: t('home.services.serviceTag') },
    { title: t('home.services.food.title'), blurb: t('home.services.food.description'), tone: 'quiet', tag: t('home.services.serviceTag') },
    { title: t('home.services.bulk.title'), blurb: t('home.services.bulk.description'), tone: 'quiet', tag: t('home.services.serviceTag') },
  ];
  return (
  <section id="services" className="section-rhythm w-full border-(--line) bg-(--paper)">
    <article className="app-container">
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <hgroup className="max-w-[660px]">
          <p className="type-eyebrow">
            {t('home.services.eyebrow')}
          </p>
          <h2 className="type-h2 mt-2">
            {t('home.services.title1')}
            <br />
            {t('home.services.title2')}
          </h2>
        </hgroup>
        <p className="type-body-sm max-w-[380px] text-(--muted)">
          {t('home.services.description')}
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
                        {t('home.services.tracking')}
                      </p>
                      <p className="mt-1 text-xs font-normal text-(--paper)">
                        {t('home.services.pickupDropoff')}
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
};

export default ServicesSection;
