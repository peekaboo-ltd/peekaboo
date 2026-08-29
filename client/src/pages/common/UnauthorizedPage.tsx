import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShieldHalved, faLock } from '@fortawesome/free-solid-svg-icons';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import Button from '@/components/inputs/Button';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/states/store';
import { setLogout } from '@/states/slices/auth.slice';
import { useI18n } from '@/i18n/i18n';

const UnauthorizedPage = () => {
  const { t } = useI18n();
  useDocumentTitle(t('error.unauthorized.docTitle'));
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(setLogout());
  }, [dispatch]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-(--surface) px-4 py-12 sm:px-6 lg:px-10">
      <motion.section
        className="relative z-10 mx-auto flex w-full max-w-2xl flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.article
          className="relative overflow-hidden rounded-md border border-(--line) bg-(--paper) p-8 sm:p-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <header className="space-y-6 text-center">
            <article className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full bg-(--surface) px-4 py-2 text-xs font-normal text-(--ink)">
                <FontAwesomeIcon icon={faShieldHalved} className="text-(--ink)" />
                {t('error.unauthorized.code')}
              </span>
            </article>

            <article className="flex justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-md bg-(--surface) text-2xl text-(--muted)">
                <FontAwesomeIcon icon={faLock} className="text-(--muted)" />
              </span>
            </article>

            <article className="space-y-4">
              <h1 className="type-display text-(--ink)">
                {t('error.unauthorized.title')}
              </h1>
              <p className="type-body mx-auto max-w-md text-(--muted)">
                {t('error.unauthorized.description')}
              </p>
            </article>

            <nav className="flex justify-center pt-2">
              <Button
                route="/"
                primary
               
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="text-xs"
                  aria-hidden="true"
                />
                {t('error.unauthorized.home')}
              </Button>
            </nav>
          </header>
        </motion.article>
      </motion.section>
    </main>
  );
};

export default UnauthorizedPage;
