import { Link, useNavigate } from 'react-router-dom';
import Input from '@/components/inputs/Input';
import Select from '@/components/inputs/Select';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBuilding, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';

const OrganizationOnboarding = () => {
  const navigate = useNavigate();
  const { t } = useI18n();

  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-4xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-primary-600">{t('onboarding.step', { step: 1 })}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t('onboarding.organization.title')}
          </h1>
          <p className="text-slate-600 max-w-2xl">
            {t('onboarding.organization.subtitle')}
          </p>
          <Link
            to="/auth/login"
            className="text-sm font-medium text-primary-700 hover:text-primary-800 w-fit"
          >
            {t('onboarding.organization.signIn')}
          </Link>
        </header>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            navigate('/onboarding/admin');
          }}
          className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
        >
          <section className="flex items-center gap-3 text-slate-800">
            <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <FontAwesomeIcon icon={faBuilding} className="text-primary-600" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">{t('onboarding.organization.detailsTitle')}</h2>
              <p className="text-sm text-slate-500">
                {t('onboarding.organization.detailsSubtitle')}
              </p>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label={t('onboarding.organization.name')} placeholder={t('onboarding.organization.namePlaceholder')} required />
            <Input
              label={t('onboarding.organization.email')}
              placeholder={t('onboarding.organization.emailPlaceholder')}
              type="email"
              required
            />
            <Input label={t('onboarding.organization.phone')} placeholder={t('onboarding.organization.phonePlaceholder')} required />
            <Input label={t('onboarding.organization.location')} placeholder={t('onboarding.organization.locationPlaceholder')} />
            <Select
              label={t('onboarding.organization.industry')}
              placeholder={t('onboarding.organization.industryPlaceholder')}
              options={[
                { value: 'ecommerce', label: t('onboarding.organization.industryOptionEcommerce') },
                { value: 'retail', label: t('onboarding.organization.industryOptionRetail') },
                { value: 'restaurants', label: t('onboarding.organization.industryOptionRestaurants') },
                { value: 'pharmacy', label: t('onboarding.organization.industryOptionPharmacy') },
              ]}
            />
            <Select
              label={t('onboarding.organization.volume')}
              placeholder={t('onboarding.organization.volumePlaceholder')}
              options={[
                { value: '0-200', label: t('onboarding.organization.volumeOptionSmall') },
                { value: '200-800', label: t('onboarding.organization.volumeOptionMedium') },
                { value: '800+', label: t('onboarding.organization.volumeOptionLarge') },
              ]}
            />
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
              {t('onboarding.organization.backHome')}
            </Link>
            <Button type="submit" primary className="px-6">
              {t('onboarding.organization.continue')}
              <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
            </Button>
          </footer>
        </form>
      </article>
    </main>
  );
};

export default OrganizationOnboarding;
