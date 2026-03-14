import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/inputs/Button';
import { NAVIGATION_LINKS } from '@/constants/navigation.constants';
import { capitalizeString } from '@/utils/strings.util';
import LanguageSelector from '@/components/inputs/LanguageSelector';
import peekabooLogo from '/peekaboo.png';

const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  const { pathname } = useLocation();

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${pathname === '/'
          ? 'border-b border-primary-900/5 bg-white/82 backdrop-blur-xl'
          : 'border-b border-primary-900/8 bg-white/90 backdrop-blur-xl'
        }`}
    >
      <header className="relative mx-auto flex h-[8vh] min-h-[56px] max-h-[64px] w-[95%] flex-wrap items-center justify-between py-2 transition-all duration-300 sm:w-[92%] sm:py-3 md:w-[90%]">
        <Link
          to="/"
          className="flex w-fit shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
        >
          <img
            src={peekabooLogo}
            className="h-14 w-auto object-contain sm:h-20"
            alt="Peekaboo Logo"
          />
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1.5 lg:flex">
          {Object.entries(NAVIGATION_LINKS).map(([label, link], index) => {
            if (label === 'MY_ACCOUNT') {
              return null;
            }

            const isActive = pathname === link;

            return (
              <li key={index}>
                <Link
                  to={link}
                  className={`px-3 py-2 text-[12px] font-normal rounded-sm tracking-[0.1em] transition-all duration-200 ${isActive
                      ? 'bg-primary-900 text-white shadow-sm'
                      : 'text-primary-800/60 hover:bg-primary-900/6 hover:text-primary-900'
                    }`}
                >
                  {capitalizeString(label)}
                </Link>
              </li>
            );
          })}
        </ul>

        <section className="ml-auto hidden items-center gap-3 lg:flex">
          <LanguageSelector />
          <Button
            route={NAVIGATION_LINKS.MY_ACCOUNT}
            primary
          >
            {capitalizeString('MY_ACCOUNT')}
          </Button>
        </section>

        <aside className="md:block lg:hidden">
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="border border-primary-900/10 p-2 text-primary-800 transition-colors duration-200 hover:border-primary-900/20 hover:text-primary-950 focus:outline-none"
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

        <section
          className={`basis-full overflow-hidden transition-all duration-300 ease-in-out lg:hidden ${isMobileMenuOpen ? 'max-h-[100vh] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <ul className="w-full space-y-1 border-t border-primary-100 bg-white px-2 pt-4 pb-6">
            <LanguageSelector className="w-full" menuClassName="left-0 right-auto min-w-full" />
            {Object.entries(NAVIGATION_LINKS).map(([label, link], index) => {
              if (label === 'MY_ACCOUNT') {
                return (
                  <li key={index} className="px-3 py-2">
                    <Button
                      route={link}
                      primary
                      className="w-full border-secondary-600 bg-secondary-600 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white hover:bg-secondary-700"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {capitalizeString(label)}
                    </Button>
                  </li>
                );
              }
              return (
                <li key={index}>
                  <Link
                    to={link}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block rounded-2xl px-3 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition-colors duration-200 ${pathname === link
                        ? 'bg-primary-900 text-white'
                        : 'text-primary-800/70 hover:bg-primary-50 hover:text-primary-900'
                      }`}
                  >
                    {capitalizeString(label)}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </header>
    </nav>
  );
};

export default PublicNavbar;
