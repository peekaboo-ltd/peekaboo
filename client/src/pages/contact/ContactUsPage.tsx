import { useI18n } from '@/i18n/i18n';
import ContactUsForm from '@/pages/home/components/ContactUsForm';

const ContactUsPage = () => {
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="bg-white border-b border-slate-200">
        <div className="max-w-[1330px] mx-auto px-4 sm:px-6 lg:px-12 py-12 text-center">
          <h1 className="text-3xl sm:text-4xl font-semibold text-slate-900">
            {t('contact.title')}
          </h1>
          <p className="mt-3 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-10">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8">
            <ContactUsForm />
          </div>
        </div>
      </section>
    </main>
  );
};

export default ContactUsPage;
