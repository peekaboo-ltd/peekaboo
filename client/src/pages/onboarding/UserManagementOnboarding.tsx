import { Link } from 'react-router-dom';
import Input from '@/components/inputs/Input';
import Button from '@/components/inputs/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faArrowRight, faCheck } from '@fortawesome/free-solid-svg-icons';
import { useI18n } from '@/i18n/i18n';

const UserManagementOnboarding = () => {
  const { t } = useI18n();
  return (
    <main className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <article className="max-w-5xl mx-auto flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-primary-600">{t('onboarding.step', { step: 3 })}</span>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900">
            {t('onboarding.users.title')}
          </h1>
          <p className="text-slate-600 max-w-3xl">
            {t('onboarding.users.subtitle')}
          </p>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-6">
          <form className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <section className="flex items-center gap-3 text-slate-800">
              <span className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <FontAwesomeIcon icon={faUsers} className="text-primary-600" />
              </span>
              <div>
                <h2 className="text-lg font-semibold">{t('onboarding.users.detailsTitle')}</h2>
                <p className="text-sm text-slate-500">
                  {t('onboarding.users.detailsSubtitle')}
                </p>
              </div>
            </section>

            <div className="space-y-4">
              {Array.from({ length: 2 }, (_, index) => index + 1).map((index) => (
                <div key={`member-${index}`} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t('onboarding.users.memberName', { index })}
                    placeholder={t('onboarding.users.memberNamePlaceholder')}
                  />
                  <Input
                    label={t('onboarding.users.memberEmail', { index })}
                    placeholder={t('onboarding.users.memberEmailPlaceholder')}
                    type="email"
                  />
                </div>
              ))}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
              <Link to="/onboarding/admin" className="text-sm text-slate-500 hover:text-slate-700">
                {t('onboarding.users.back')}
              </Link>
              <Button type="button" primary className="px-6">
                {t('onboarding.users.finish')}
                <FontAwesomeIcon icon={faArrowRight} className="ml-2 text-xs" />
              </Button>
            </footer>
          </form>

          <aside className="bg-primary-900 text-white rounded-2xl p-6 sm:p-8 flex flex-col gap-6">
            <header>
              <h3 className="text-xl font-semibold">{t('onboarding.users.nextTitle')}</h3>
              <p className="text-sm text-primary-100 mt-2">
                {t('onboarding.users.nextSubtitle')}
              </p>
            </header>

            <ul className="space-y-4 text-sm text-primary-100">
              {[
                t('onboarding.users.nextItem1'),
                t('onboarding.users.nextItem2'),
                t('onboarding.users.nextItem3'),
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <span className="mt-0.5 text-primary-200">
                    <FontAwesomeIcon icon={faCheck} />
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/users"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-white text-primary-900 rounded-lg font-medium hover:bg-primary-50 transition-colors"
            >
              {t('onboarding.users.goToUsers')}
            </Link>
          </aside>
        </section>
      </article>
    </main>
  );
};

export default UserManagementOnboarding;
