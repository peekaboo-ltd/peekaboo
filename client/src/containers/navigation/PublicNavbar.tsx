import { useCallback, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { NAVIGATION_LINKS } from '@/constants/navigation.constants';
import { capitalizeString } from '@/utils/strings.util';
import LanguageSelector from '@/components/inputs/LanguageSelector';
import peekabooLogo from '/peekaboo.png';
import Button from '@/components/inputs/Button';

const PublicNavbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { pathname } = useLocation();

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen((previous) => !previous);
  }, []);

  useEffect(() => setIsMobileMenuOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const publicLinks = Object.entries(NAVIGATION_LINKS).filter(
    ([label]) => label !== 'MY_ACCOUNT',
  );

  return (
    <header className="invert-surface sticky top-0 z-50 h-16">
      <nav className="app-container flex h-16 items-center justify-between" aria-label="Primary navigation">
        <Link
          to="/"
          className="flex h-(--control-lg) shrink-0 items-center rounded-(--radius-control) px-2 outline-none focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
          aria-label="Peekaboo home"
        >
          <img
            src={peekabooLogo}
            className="h-10 w-auto object-contain invert dark:invert-0"
            alt="Peekaboo"
          />
        </Link>

        <ul className="hidden items-center gap-1 lg:flex">
          {publicLinks.map(([label, link]) => (
            <li key={label}>
              <Link
                to={link}
                aria-current={pathname === link ? 'page' : undefined}
                className="inline-flex min-h-10 items-center rounded-(--radius-pill) px-3 text-sm font-normal transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:bg-(--surface) active:shadow-[var(--press-on-ink)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
              >
                {capitalizeString(label)}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <div className="hidden items-center gap-2 lg:flex">
            <LanguageSelector />
            <Button variant="primary" className="flex-1" route={NAVIGATION_LINKS.MY_ACCOUNT}>
              {capitalizeString('MY_ACCOUNT')}
            </Button>
          </div>
          <button
            type="button"
            onClick={toggleMobileMenu}
            className="relative z-50 flex size-11 items-center justify-center rounded-(--radius-control) outline-none transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:bg-(--surface) active:shadow-[var(--press-on-ink)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] lg:hidden"
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      {isMobileMenuOpen ? (
        <div className="fixed inset-x-0 bottom-0 top-16 z-40 bg-(--paper) text-(--ink) lg:hidden">
          <nav className="flex h-full flex-col overflow-y-auto px-5 py-6" aria-label="Mobile navigation">
            <ul className="border-t border-(--line)">
              {publicLinks.map(([label, link]) => (
                <li key={label} className="border-b border-(--line)">
                  <Link
                    to={link}
                    aria-current={pathname === link ? 'page' : undefined}
                    className="flex min-h-16 items-center px-3 text-lg font-normal outline-none transition-[background-color,color] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:bg-(--surface)"
                  >
                    {capitalizeString(label)}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-auto flex items-center gap-3 pt-8">
              <LanguageSelector />
              <Button variant="primary" className="flex-1" route={NAVIGATION_LINKS.MY_ACCOUNT}>
                {capitalizeString('MY_ACCOUNT')}
              </Button>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
};

export default PublicNavbar;
