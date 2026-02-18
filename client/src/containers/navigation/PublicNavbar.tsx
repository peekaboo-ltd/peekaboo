import { useCallback, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Button from '../../components/inputs/Button';
import { NAVIGATION_LINKS } from '@/constants/navigation.constants';
import { capitalizeString } from '@/utils/strings.util';
import LanguageSelector from '@/components/inputs/LanguageSelector';

const PublicNavbar = () => {

  // STATE VARIABLES
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  }, [isMobileMenuOpen]);

  // NAVIGATION
  const { pathname } = useLocation();

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 backdrop-blur-sm transition-colors duration-300 ${pathname === '/' ? 'bg-white/70' : 'bg-white/90'}`}>
      <article className="w-[100%] mx-auto px-4 sm:px-6 lg:px-8">
        <header className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center transition-colors duration-200"
          >
            <img
              src="/peekaboo.png"
              className="h-12 w-auto sm:h-16 md:h-20 max-w-[200px] sm:max-w-[230px] md:max-w-[280px]"
              alt="Peekaboo Logo"
            />
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-8">
            <li>
              <LanguageSelector />
            </li>
            {Object.entries(NAVIGATION_LINKS).map(([label, link], index) => {
              if (label === 'MY_ACCOUNT') {
                return (
                  <li key={index}>
                    <Button route={link} primary className="py-1.5! px-6! !text-[12px]">
                      {capitalizeString(label)}
                    </Button>
                  </li>
                );
              }
              return (
                <li key={index}>
                  <Link
                    to={link}
                    className="text-slate-700 !text-[13px] hover:underline underline-offset-4 transition-colors duration-200"
                  >
                    {capitalizeString(label)}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Mobile Menu Button */}
          <aside className="md:hidden">
            <button
              type="button"
              onClick={toggleMobileMenu}
              className="text-gray-700 hover:text-slate-700 focus:outline-none focus:text-slate-700 transition-colors duration-200"
              aria-label="Toggle navigation menu"
              aria-expanded={isMobileMenuOpen}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
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

        {/* Mobile Navigation */}
        <section
          className={`md:hidden transition-all duration-300 w-full ease-in-out overflow-hidden ${isMobileMenuOpen ? 'h-[100vh] opacity-100' : 'max-h-0 opacity-0'
            }`}
        >
          <ul className="px-2 pt-2 pb-3 space-y-1 bg-white w-full border-t border-gray-200">
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
                      className="w-full !py-2 !px-4 !text-[12px]"
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
                  className="block px-3 py-2 text-gray-700 text-[13px] hover:text-slate-700 hover:bg-gray-50 transition-colors duration-200 !font-normal"
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
