import { useI18n } from '@/i18n/i18n';
import ContactUsForm from '@/pages/home/components/ContactUsForm';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import {
  PublicPage,
  PublicPageHero,
  PublicSectionCard,
} from '@/components/layout/PublicPage';

const ContactUsPage = () => {
  const { t } = useI18n();
  useDocumentTitle('Contact Us');

  return (
    <PublicPage>
      <PublicPageHero
        eyebrow="Contact"
        title={t('contact.title')}
        description={t('contact.subtitle')}
      />

      <PublicSectionCard
        className="mx-auto w-full max-w-3xl border-(--line)"
        title="Send us a message"
        description="Tell us about your business or delivery needs."
      >
        <ContactUsForm hideIntro />
      </PublicSectionCard>
    </PublicPage>
  );
};

export default ContactUsPage;
