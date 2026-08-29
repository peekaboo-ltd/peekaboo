import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faHome,
  faBox,
  faInfoCircle,
  faSignInAlt,
  faUserPlus,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import Button from '@/components/inputs/Button';
import { useI18n } from '@/i18n/i18n';

const NotFoundPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('error.notFound.docTitle'));
  const location = useLocation();
  const navigate = useNavigate();
  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-(--surface) px-4 py-12 sm:px-6 lg:px-10">
      <motion.section
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <article className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.article
            className="relative overflow-hidden rounded-md border border-(--line) bg-(--paper) p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="space-y-6">
              <article className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-(--line) bg-(--paper) px-3 py-1 text-xs font-normal text-(--muted)">
                  {t('error.notFound.code')}
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-(--surface) px-3 py-1 text-xs font-normal text-(--muted)">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-[0.8125rem] text-(--ink)"
                  />
                  {t('error.notFound.badge')}
                </span>
              </article>

              <article className="space-y-4">
                <h1 className="type-display text-(--ink)">
                  {t('error.notFound.titleLine1')}
                  <br />
                  {t('error.notFound.titleLine2')}
                </h1>
                <p className="type-body text-(--muted)">
                  {t('error.notFound.description')}
                </p>
              </article>

              <article className="rounded-md bg-(--surface) px-4 py-3 text-sm text-(--muted)">
                <span className="type-meta">
                  {t('error.notFound.requested')}
                </span>
                <p className="mt-1 font-normal text-(--ink)">
                  {location.pathname}
                </p>
              </article>

              <nav className="flex flex-wrap gap-3">
                {canGoBack && (
                  <Button
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(-1);
                    }}
                  >
                    <FontAwesomeIcon
                      icon={faArrowLeft}
                      className="text-xs"
                      aria-hidden="true"
                    />
                    {t('error.notFound.back')}
                  </Button>
                )}
                <Button
                  route="/"
                  primary
                 
                >
                  <FontAwesomeIcon
                    icon={faHome}
                    className="text-xs"
                    aria-hidden="true"
                  />
                  {t('error.notFound.home')}
                </Button>
              </nav>
            </header>
          </motion.article>

          <motion.aside
            className="flex h-full flex-col gap-5 rounded-md border border-(--line) bg-(--paper) p-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="space-y-2">
              <p className="type-eyebrow">
                {t('error.notFound.quickLinks')}
              </p>
              <h2 className="type-h3 text-(--ink)">
                {t('error.notFound.keepExploring')}
              </h2>
              <p className="text-sm text-(--muted)">
                {t('error.notFound.continue')}
              </p>
            </header>

            <article className="grid gap-3">
              <Link
                to="/track"
                className="group flex items-center justify-between rounded-md border border-(--line) bg-(--paper) px-4 py-3 text-sm font-normal text-(--ink) transition-colors hover:border-(--line)"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faBox}
                    className="text-[0.8125rem] text-(--ink)"
                  />
                  {t('error.notFound.track')}
                </span>
                <span className="type-meta">{t('error.notFound.orderIdNeeded')}</span>
              </Link>

              <Link
                to="/contact"
                className="group flex items-center justify-between rounded-md border border-(--line) bg-(--paper) px-4 py-3 text-sm font-normal text-(--ink) transition-colors hover:border-(--line)"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-[0.8125rem] text-(--ink)"
                  />
                  {t('error.notFound.support')}
                </span>
                <span className="type-meta">{t('error.notFound.canHelp')}</span>
              </Link>

              <article className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  to="/auth/login"
                  className="flex items-center justify-center gap-2 rounded-xl bg-(--surface) px-4 py-2.5 text-sm font-normal text-(--ink) transition-colors hover:bg-(--surface)"
                >
                  <FontAwesomeIcon
                    icon={faSignInAlt}
                    className="text-xs"
                    aria-hidden="true"
                  />
                  {t('error.notFound.signIn')}
                </Link>
                <Link
                  to="/auth/register"
                  className="flex items-center justify-center gap-2 rounded-xl bg-(--surface) px-4 py-2.5 text-sm font-normal text-(--ink) transition-colors hover:bg-(--surface)"
                >
                  <FontAwesomeIcon
                    icon={faUserPlus}
                    className="text-xs"
                    aria-hidden="true"
                  />
                  {t('error.notFound.createAccount')}
                </Link>
              </article>
            </article>
          </motion.aside>
        </article>
      </motion.section>
    </main>
  );
};

export default NotFoundPage;
