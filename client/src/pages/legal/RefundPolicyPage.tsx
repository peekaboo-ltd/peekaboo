import { useI18n } from '@/i18n/i18n';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
} from '@/components/layout/PublicPage';

const RefundPolicyPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('legal.refund.docTitle'));

  return (
    <PublicPage className="max-lg:mt-16">
      <PublicPageHero
        eyebrow={t('legal.eyebrow')}
        title={t('legal.refund.title')}
        description={t('legal.refund.description')}
      />

      <div className="flex flex-col gap-4">
        <PublicSectionCard title={t('legal.refund.section1Title')}>
          <p className="text-sm leading-6 text-slate-600">{t('legal.placeholderParagraph')}</p>
        </PublicSectionCard>
        <PublicSectionCard title={t('legal.refund.section2Title')}>
          <p className="text-sm leading-6 text-slate-600">{t('legal.placeholderParagraph')}</p>
        </PublicSectionCard>
        <PublicSectionCard title={t('legal.refund.section3Title')}>
          <p className="text-sm leading-6 text-slate-600">{t('legal.placeholderParagraph')}</p>
        </PublicSectionCard>
      </div>
    </PublicPage>
  );
};

export default RefundPolicyPage;
