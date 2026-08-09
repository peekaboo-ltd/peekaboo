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

const NotFoundPage = () => {
  useDocumentTitle('Page Not Found');
  const location = useLocation();
  const navigate = useNavigate();
  const canGoBack = typeof window !== 'undefined' && window.history.length > 1;

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
        className="pointer-events-none absolute -right-24 bottom-10 h-80 w-80 rounded-full bg-slate-200/60 blur-3xl"
        aria-hidden="true"
      />

      <motion.section
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <article className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.article
            className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white/95 p-8 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <span
              className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/10 blur-3xl"
              aria-hidden="true"
            />
            <span
              className="pointer-events-none absolute -left-10 bottom-8 h-32 w-32 rounded-full bg-emerald-200/40 blur-3xl"
              aria-hidden="true"
            />

            <header className="space-y-6">
              <article className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium uppercase text-slate-500">
                  Error 404
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-medium text-slate-500">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-xs text-primary-700"
                  />
                  Page missing
                </span>
              </article>

              <article className="space-y-4">
                <h1 className="text-6xl sm:text-7xl font-semibold text-slate-900">
                  Lost route.
                  <br />
                  Let’s get you back.
                </h1>
                <p className="text-base sm:text-lg text-slate-600">
                  We couldn’t find the page you requested. The link might be
                  broken, or the route has changed.
                </p>
              </article>

              <article className="rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm text-slate-600">
                <span className="text-xs uppercase text-slate-400">
                  Requested
                </span>
                <p className="mt-1 font-medium text-slate-700">
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
                    Back to previous page
                  </Button>
                )}
                <Button
                  route="/"
                  primary
                  className="!px-5 !py-2.5 !rounded-lg !text-sm !font-medium"
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

          <motion.aside
            className="flex h-full flex-col gap-5 rounded-3xl border border-slate-200 bg-white/95 p-7 shadow-[0_20px_45px_-35px_rgba(15,23,42,0.4)]"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="space-y-2">
              <p className="text-xs font-medium uppercase text-slate-400">
                Quick links
              </p>
              <h2 className="text-2xl font-semibold text-slate-900">
                Keep exploring
              </h2>
              <p className="text-sm text-slate-500">
                Here are a few useful places to continue from.
              </p>
            </header>

            <article className="grid gap-3">
              <Link
                to="/track"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faBox}
                    className="text-xs text-primary-700"
                  />
                  Track an order
                </span>
                <span className="text-xs text-slate-400">Order ID needed</span>
              </Link>

              <Link
                to="/contact"
                className="group flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-xs text-primary-700"
                  />
                  Contact support
                </span>
                <span className="text-xs text-slate-400">We can help</span>
              </Link>

              <article className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  to="/auth/login"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <FontAwesomeIcon
                    icon={faSignInAlt}
                    className="text-xs"
                    aria-hidden="true"
                  />
                  Sign in
                </Link>
                <Link
                  to="/auth/register"
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
                >
                  <FontAwesomeIcon
                    icon={faUserPlus}
                    className="text-xs"
                    aria-hidden="true"
                  />
                  Create account
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
