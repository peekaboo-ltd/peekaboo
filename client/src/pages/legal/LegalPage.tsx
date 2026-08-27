import { Link } from 'react-router-dom';
import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { PublicPage, PublicPageHero, PublicSectionCard } from '@/components/layout/PublicPage';
import LegalBreadcrumb from './LegalBreadcrumb';

interface LegalHubLink {
  to: string;
  titleKey: string;
  summaryKey: string;
}

const hubLinks: LegalHubLink[] = [
  {
    to: '/legal/terms-and-conditions',
    titleKey: 'footer.termsAndConditions',
    summaryKey: 'legal.hub.termsSummary',
  },
  {
    to: '/legal/refund-policy',
    titleKey: 'footer.refundPolicy',
    summaryKey: 'legal.hub.refundSummary',
  },
  {
    to: '/legal/cancellation-policy',
    titleKey: 'footer.cancellationPolicy',
    summaryKey: 'legal.hub.cancellationSummary',
  },
];

const LegalPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('legal.hub.docTitle'));

  return (
    <PublicPage>
      <LegalBreadcrumb />

      <PublicPageHero
        eyebrow={t('legal.eyebrow')}
        title={t('legal.hub.title')}
        description={t('legal.hub.description')}
      />

      <PublicSectionCard title={t('legal.hub.linksHeading')} contentClassName="p-0 sm:p-0">
        <ul className="divide-y divide-(--line)">
          {hubLinks.map((item) => (
            <li key={item.to}>
              <Link
                to={item.to}
                className="group flex flex-col gap-1 px-5 py-4 transition-colors hover:bg-(--surface) sm:px-6 sm:py-5"
              >
                <span className="text-sm font-medium text-(--ink) group-hover:text-(--ink)">
                  {t(item.titleKey)}
                </span>
                <span className="text-sm leading-6 text-(--muted)">{t(item.summaryKey)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </PublicSectionCard>
    </PublicPage>
  );
};

export default LegalPage;
