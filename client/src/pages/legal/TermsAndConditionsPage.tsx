import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import { PublicPage, PublicPageHero } from '@/components/layout/PublicPage';
import LegalBreadcrumb from './LegalBreadcrumb';
import { LegalPolicySections } from './LegalPolicySections';
import { TERMS_SECTIONS } from './legalSectionDefs';

const TermsAndConditionsPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('legal.terms.docTitle'));

  return (
    <PublicPage className="">
      <LegalBreadcrumb
        currentPage={{
          labelKey: 'legal.terms.title',
          path: '/legal/terms-and-conditions',
        }}
      />

      <PublicPageHero
        eyebrow={t('legal.eyebrow')}
        title={t('legal.terms.title')}
        description={t('legal.terms.description')}
      />

      <LegalPolicySections sections={TERMS_SECTIONS} t={t} />
    </PublicPage>
  );
};

export default TermsAndConditionsPage;
