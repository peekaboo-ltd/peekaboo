import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faShieldHalved, faLock } from '@fortawesome/free-solid-svg-icons';
import { useDocumentTitle } from '@/hooks/common/useDocumentTitle';
import Button from '@/components/inputs/Button';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '@/states/store';
import { setLogout } from '@/states/slices/auth.slice';

const UnauthorizedPage = () => {
  useDocumentTitle('Unauthorized');
  const dispatch: AppDispatch = useDispatch();

  useEffect(() => {
    dispatch(setLogout());
  }, [dispatch]);

  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-slate-50 px-4 py-12 sm:px-6 lg:px-10">
      <span
        className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(95,149,152,0.2),_transparent_70%)]"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-primary-200/20 blur-3xl"
        aria-hidden="true"
      />
      <span
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-amber-200/40 blur-3xl"
        aria-hidden="true"
      />

      <motion.section
        className="relative z-10 mx-auto flex w-full max-w-2xl flex-col"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <motion.article
          className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)] sm:p-10"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <span
            className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
            aria-hidden="true"
          />
          <span
            className="pointer-events-none absolute -left-10 bottom-8 h-32 w-32 rounded-full bg-amber-200/30 blur-3xl"
            aria-hidden="true"
          />

          <header className="space-y-6 text-center">
            <article className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-amber-200/80 bg-amber-50/90 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.24em] text-amber-800">
                <FontAwesomeIcon icon={faShieldHalved} className="text-amber-600" />
                403 Unauthorized
              </span>
            </article>

            <article className="flex justify-center">
              <span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50/80 text-2xl text-slate-500">
                <FontAwesomeIcon icon={faLock} className="text-slate-600" />
              </span>
            </article>

            <article className="space-y-4">
              <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight text-slate-900">
                Access not allowed.
              </h1>
              <p className="text-base sm:text-lg text-slate-600 max-w-md mx-auto">
                You don’t have permission to view this page. You’ve been signed out for your security.
              </p>
            </article>

            <nav className="flex justify-center pt-2">
              <Button
                route="/"
                primary
                className="!px-6 !py-3 !rounded-xl !text-sm !font-medium"
              >
                <FontAwesomeIcon
                  icon={faHome}
                  className="text-xs"
                  aria-hidden="true"
                />
                Go to homepage
              </Button>
            </nav>
          </header>
        </motion.article>
      </motion.section>
    </main>
  );
};

export default UnauthorizedPage;
