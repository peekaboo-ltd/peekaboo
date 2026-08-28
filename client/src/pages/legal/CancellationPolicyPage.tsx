import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { PublicPage, PublicPageHero } from '@/components/layout/PublicPage';
import LegalBreadcrumb from './LegalBreadcrumb';
import { LegalPolicySections } from './LegalPolicySections';
import { CANCELLATION_SECTIONS } from './legalSectionDefs';

const CancellationPolicyPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('legal.cancellation.docTitle'));

  return (
    <PublicPage className="">
      <LegalBreadcrumb parent="legal" />

      <PublicPageHero
        eyebrow={t('legal.eyebrow')}
        title={t('legal.cancellation.title')}
        description={t('legal.cancellation.description')}
      />

      <LegalPolicySections sections={CANCELLATION_SECTIONS} t={t} />
    </PublicPage>
  );
};

export default CancellationPolicyPage;
