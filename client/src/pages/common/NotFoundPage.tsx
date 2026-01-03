import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHome,
  faBox,
  faInfoCircle,
  faSignInAlt,
  faUserPlus,
  faExclamationTriangle,
} from '@fortawesome/free-solid-svg-icons';

const NotFoundPage = () => {
  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100 px-4 py-12">
      <section className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Number Display */}
        <header className="space-y-4">
          <div className="relative">
            <h1 className="text-9xl sm:text-[12rem] font-bold text-primary/10 select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <FontAwesomeIcon
                icon={faExclamationTriangle}
                className="text-6xl sm:text-8xl text-primary/20"
                aria-hidden="true"
              />
            </div>
          </div>
          <hgroup className="space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
              Page Not Found
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">
              Oops! The page you're looking for seems to have taken a different
              delivery route.
            </p>
          </hgroup>
        </header>

        {/* Description */}
        <article className="space-y-3">
          <p className="text-gray-500 leading-relaxed">
            Just like our carefully tracked packages, every page has its
            destination. This one might be getting rerouted, or perhaps it
            never existed at all.
          </p>
        </article>

        {/* Primary Actions */}
        <nav className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            to="/"
            className="group inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-lg font-medium hover:bg-primary/90 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 min-w-[200px] justify-center"
          >
            <FontAwesomeIcon icon={faHome} className="text-sm" />
            <span>Go Home</span>
          </Link>

          <Link
            to="/about"
            className="group inline-flex items-center gap-2 border-2 border-primary text-primary px-6 py-3 rounded-lg font-medium hover:bg-primary hover:text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 min-w-[200px] justify-center"
          >
            <FontAwesomeIcon icon={faInfoCircle} className="text-sm" />
            <span>About Us</span>
          </Link>
        </nav>

        {/* Secondary Links */}
        <aside className="pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500 mb-6">
            Or try one of these helpful links:
          </p>
          <nav className="flex flex-wrap justify-center gap-4 sm:gap-6">
            <Link
              to="/auth/login"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-sm"
            >
              <FontAwesomeIcon icon={faSignInAlt} className="text-xs" />
              <span>Login</span>
            </Link>
            <Link
              to="/auth/register"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-sm"
            >
              <FontAwesomeIcon icon={faUserPlus} className="text-xs" />
              <span>Register</span>
            </Link>
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium transition-colors text-sm"
            >
              <FontAwesomeIcon icon={faInfoCircle} className="text-xs" />
              <span>About</span>
            </Link>
            <span className="inline-flex items-center gap-2 text-gray-400 font-medium text-sm">
              <FontAwesomeIcon icon={faBox} className="text-xs" />
              <span>Track Order</span>
              <span className="text-xs text-gray-400">(Requires Order ID)</span>
            </span>
          </nav>
        </aside>
      </section>
    </main>
  );
};

export default NotFoundPage;
