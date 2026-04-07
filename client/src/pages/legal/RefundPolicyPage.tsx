import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { PublicPage, PublicPageHero } from '@/components/layout/PublicPage';
import LegalBreadcrumb from './LegalBreadcrumb';
import { LegalPolicySections } from './LegalPolicySections';
import { REFUND_SECTIONS } from './legalSectionDefs';

const RefundPolicyPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('legal.refund.docTitle'));

  return (
    <PublicPage className="max-lg:mt-16">
      <LegalBreadcrumb
        currentPage={{
          labelKey: 'legal.refund.title',
          path: '/legal/refund-policy',
        }}
      />

      <PublicPageHero
        eyebrow={t('legal.eyebrow')}
        title={t('legal.refund.title')}
        description={t('legal.refund.description')}
      />

      <LegalPolicySections sections={REFUND_SECTIONS} t={t} />
    </PublicPage>
  );
};

export default RefundPolicyPage;
