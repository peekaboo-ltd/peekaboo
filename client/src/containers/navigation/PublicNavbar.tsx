import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/inputs/Button';
import { NAVIGATION_LINKS } from '@/constants/navigation.constants';
import { capitalizeString } from '@/utils/strings.util';
import LanguageSelector from '@/components/inputs/LanguageSelector';
import peekabooLogo from '/peekaboo.png';

const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isMobileMenuOpen]);

  return (
    <nav
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        pathname === '/'
          ? 'border-b border-primary-900/5 bg-white/82 backdrop-blur-xl'
          : 'border-b border-primary-900/8 bg-white/90 backdrop-blur-xl'
      }`}
    >
      <header className="relative mx-auto flex h-[64px] w-[95%] max-w-[1280px] items-center justify-between sm:w-[92%] md:w-[90%]">
        <Link
          to="/"
          className="flex shrink-0 items-center transition-opacity duration-200 hover:opacity-80"
        >
          <img
            src={peekabooLogo}
            className="h-14 w-auto object-contain sm:h-16"
            alt="Peekaboo Logo"
          />
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 lg:flex">
          {Object.entries(NAVIGATION_LINKS).map(([label, link]) => {
            if (label === 'MY_ACCOUNT') return null;
            const isActive = pathname === link;

            return (
              <li key={label}>
                <Link
                  to={link}
                  className={`rounded-sm px-3 py-1.5 text-[13px] font-normal transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-900 text-white shadow-sm'
                      : 'text-primary-900 hover:bg-primary-900/6'
                  }`}
                >
                  {capitalizeString(label)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSelector />
            <Button route={NAVIGATION_LINKS.MY_ACCOUNT} primary>
              {capitalizeString('MY_ACCOUNT')}
            </Button>
          </div>

          <button
            type="button"
            onClick={toggleMobileMenu}
            className="relative z-50 flex h-9 w-9 items-center justify-center rounded-md text-primary-800 transition-colors duration-200 hover:bg-primary-900/5 hover:text-primary-950 focus:outline-none lg:hidden"
            aria-label="Toggle navigation menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d={isMobileMenuOpen ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}
              />
            </svg>
          </button>
        </div>
      </header>

      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 top-14 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <div
        className={`absolute inset-x-0 top-14 z-40 overflow-hidden border-b border-primary-900/8 bg-white shadow-lg transition-all duration-300 ease-in-out lg:hidden ${
          isMobileMenuOpen ? 'max-h-[calc(100vh-3.5rem)] opacity-100' : 'pointer-events-none max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col gap-0.5 px-4 py-3">
          {Object.entries(NAVIGATION_LINKS).map(([label, link]) => {
            if (label === 'MY_ACCOUNT') return null;
            const isActive = pathname === link;

            return (
              <li key={label}>
                <Link
                  to={link}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center rounded-md px-3 py-2.5 text-[14px] font-normal transition-colors duration-150 ${
                    isActive
                      ? 'bg-primary-900 text-white'
                      : 'text-primary-800/80 hover:bg-primary-50 hover:text-primary-900'
                  }`}
                >
                  {capitalizeString(label)}
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="border-t border-primary-100 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <LanguageSelector />
            <Button
              route={NAVIGATION_LINKS.MY_ACCOUNT}
              primary
              className="flex-1"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              {capitalizeString('MY_ACCOUNT')}
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;
