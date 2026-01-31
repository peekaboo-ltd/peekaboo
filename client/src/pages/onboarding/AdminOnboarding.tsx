import { Link, useNavigate } from 'react-router-dom';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUserShield, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';

const AdminOnboarding = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-primary-600">{t('onboarding.step', { step: 2 })}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t('onboarding.admin.title')}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {t('onboarding.admin.subtitle')}
          </p>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            navigate('/onboarding/users');
          }}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <section className="flex items-center gap-3 text-slate-800">
            <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faUserShield} className="text-primary-600" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{t('onboarding.admin.detailsTitle')}</h2>
              <p className="text-sm text-slate-500">
                {t('onboarding.admin.detailsSubtitle')}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('onboarding.admin.name')} placeholder={t('onboarding.admin.namePlaceholder')} required />
            <Input
              label={t('onboarding.admin.email')}
              placeholder={t('onboarding.admin.emailPlaceholder')}
              type="email"
              required
            />
            <Input label={t('onboarding.admin.phone')} placeholder={t('onboarding.admin.phonePlaceholder')} required />
            <Input label={t('onboarding.admin.titleField')} placeholder={t('onboarding.admin.titlePlaceholder')} />
            <Input label={t('onboarding.admin.password')} placeholder={t('onboarding.admin.passwordPlaceholder')} type="password" required />
            <Input label={t('onboarding.admin.confirmPassword')} placeholder={t('onboarding.admin.confirmPasswordPlaceholder')} type="password" required />
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link to="/onboarding/organization" className="text-sm text-slate-500 hover:text-slate-700">
              {t('onboarding.admin.back')}
            </Link>
            <Button type="submit" primary className="px-6">
              {t('onboarding.admin.continue')}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
            </Button>
          </footer>
        </form>
      </article>
    </main>
  );
};

export default AdminOnboarding;
