import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/inputs/Button';
import { NAVIGATION_LINKS } from '@/constants/navigation.constants';
import { capitalizeString } from '@/utils/strings.util';
import LanguageSelector from '@/components/inputs/LanguageSelector';

const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  const { pathname } = useLocation();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 border-b border-gray-100 ${
        pathname === '/' ? 'bg-white/80 backdrop-blur-md' : 'bg-white/90 backdrop-blur-md'
      }`}
    >
      <article className="w-full mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between h-14">
          <Link
            to="/"
            className="flex items-center transition-opacity duration-200 hover:opacity-80"
          >
            <img
              src="/peekaboo new.png"
              className="h-8 sm:h-10 w-auto max-w-[160px] sm:max-w-[180px]"
              alt="Peekaboo Logo"
            />
          </Link>

          <ul className="hidden md:flex items-center space-x-6">
            <li>
              <LanguageSelector />
            </li>
            {Object.entries(NAVIGATION_LINKS).map(([label, link], index) => {
              if (label === 'MY_ACCOUNT') {
                return (
                  <li key={index}>
                    <Button route={link} primary className="py-1.5 px-4 text-[12px]">
                      {capitalizeString(label)}
                    </Button>
                  </li>
                );
              }
              return (
                <li key={index}>
                  <Link
                    to={link}
                    className="text-[12px] uppercase tracking-[0.08em] font-light text-gray-600 hover:text-gray-900 transition-colors duration-200"
                  >
                    {capitalizeString(label)}
                  </Link>
                </li>
              );
            })}
          </ul>

          <aside className="md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="text-gray-600 hover:text-gray-900 focus:outline-none transition-colors duration-200"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d={
                    isMobileMenuOpen
                      ? 'M6 18L18 6M6 6l12 12'
                      : 'M4 6h16M4 12h16M4 18h16'
                  }
                />
              </svg>
            </button>
          </aside>
        </header>

        <section
          className={`md:hidden transition-all duration-300 w-full ease-in-out overflow-hidden ${
            isMobileMenuOpen ? 'h-[100vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <ul className="px-2 pt-3 pb-4 space-y-1 bg-white w-full border-t border-gray-100">
            <li className="px-3 py-2">
              <LanguageSelector />
            </li>
            {Object.entries(NAVIGATION_LINKS).map(([label, link], index) => {
              if (label === 'MY_ACCOUNT') {
                return (
                  <li key={index} className="px-3 py-2">
                    <Button
                      route={link}
                      primary
                      className="w-full py-2 px-4 text-[12px]"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {capitalizeString(label)}
                    </Button>
                  </li>
                );
              }
              return (
                <Link
                  key={index}
                  to={link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-3 py-2 text-[12px] uppercase tracking-[0.08em] font-light text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors duration-200"
                >
                  {capitalizeString(label)}
                </Link>
              );
            })}
          </ul>
        </section>
      </article>
    </nav>
  );
};

export default PublicNavbar;
