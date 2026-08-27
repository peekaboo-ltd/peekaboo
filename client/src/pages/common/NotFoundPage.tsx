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
    <main className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-(--surface) px-4 py-12 sm:px-6 lg:px-10">
      <motion.section
        className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <article className="grid grid-cols-1 gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.article
            className="relative overflow-hidden rounded-(--radius-card) border border-(--line) bg-(--paper) p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="space-y-6">
              <article className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full border border-(--line) bg-(--paper) px-3 py-1 text-[11px] font-medium text-(--muted)">
                  Error 404
                </span>
                <span className="inline-flex items-center gap-2 rounded-full bg-(--surface) px-3 py-1 text-[11px] font-medium text-(--muted)">
                  <FontAwesomeIcon
                    icon={faExclamationTriangle}
                    className="text-xs text-(--ink)"
                  />
                  Page missing
                </span>
              </article>

              <article className="space-y-4">
                <h1 className="text-6xl sm:text-7xl font-medium text-(--ink)">
                  Lost route.
                  <br />
                  Let’s get you back.
                </h1>
                <p className="text-base sm:text-lg text-(--muted)">
                  We couldn’t find the page you requested. The link might be
                  broken, or the route has changed.
                </p>
              </article>

              <article className="rounded-(--radius-card) border border-(--line) bg-(--surface) px-4 py-3 text-sm text-(--muted)">
                <span className="text-xs text-(--muted)">
                  Requested
                </span>
                <p className="mt-1 font-medium text-(--ink)">
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
            className="flex h-full flex-col gap-5 rounded-(--radius-card) border border-(--line) bg-(--paper) p-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <header className="space-y-2">
              <p className="text-xs font-medium text-(--muted)">
                Quick links
              </p>
              <h2 className="text-2xl font-medium text-(--ink)">
                Keep exploring
              </h2>
              <p className="text-sm text-(--muted)">
                Here are a few useful places to continue from.
              </p>
            </header>

            <article className="grid gap-3">
              <Link
                to="/track"
                className="group flex items-center justify-between rounded-(--radius-card) border border-(--line) bg-(--paper) px-4 py-3 text-sm font-medium text-(--ink) transition-colors hover:border-(--line)"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faBox}
                    className="text-xs text-(--ink)"
                  />
                  Track an order
                </span>
                <span className="text-xs text-(--muted)">Order ID needed</span>
              </Link>

              <Link
                to="/contact"
                className="group flex items-center justify-between rounded-(--radius-card) border border-(--line) bg-(--paper) px-4 py-3 text-sm font-medium text-(--ink) transition-colors hover:border-(--line)"
              >
                <span className="flex items-center gap-2">
                  <FontAwesomeIcon
                    icon={faInfoCircle}
                    className="text-xs text-(--ink)"
                  />
                  Contact support
                </span>
                <span className="text-xs text-(--muted)">We can help</span>
              </Link>

              <article className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <Link
                  to="/auth/login"
                  className="flex items-center justify-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-4 py-2.5 text-sm font-medium text-(--ink) transition-colors hover:bg-(--surface)"
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
                  className="flex items-center justify-center gap-2 rounded-xl border border-(--line) bg-(--surface) px-4 py-2.5 text-sm font-medium text-(--ink) transition-colors hover:bg-(--surface)"
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
