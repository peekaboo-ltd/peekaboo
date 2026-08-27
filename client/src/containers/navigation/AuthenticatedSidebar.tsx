import { faAnglesLeft, faBars, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/states/hooks';
import { SIDEBAR_NAV, type SidebarNav } from '@/constants/navigation.constants';
import { setIsOpen } from '@/states/slices/sidebar.slice';
import { RoleTypes } from '@/types/auth.type';

function canSeeItem(userRoles: Set<RoleTypes>, itemRoles: RoleTypes[]) {
  return itemRoles.some((role) => userRoles.has(role));
}

interface NavItemWithAllowedSubs extends SidebarNav {
  allowedSubCategories: SidebarNav[];
}

function getFilteredNavWithAllowedSubs(userRoles: Set<RoleTypes>): NavItemWithAllowedSubs[] {
  return SIDEBAR_NAV.filter((nav) => {
    const allowedSubs = nav.subCategories?.filter((sub) => canSeeItem(userRoles, sub.roles)) ?? [];
    return canSeeItem(userRoles, nav.roles) || allowedSubs.length > 0;
  }).map((nav) => ({
    ...nav,
    allowedSubCategories:
      nav.subCategories?.filter((sub) => canSeeItem(userRoles, sub.roles)) ?? [],
  }));
}

const AuthenticatedSidebar = () => {
  const { pathname } = useLocation();
  const dispatch = useAppDispatch();
  const { isOpen: sidebarOpen } = useAppSelector((state) => state.sidebar);
  const { user } = useAppSelector((state) => state.auth);
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const userRoleNames = useMemo(
    () =>
      new Set<RoleTypes>(
        (user?.userRoles?.map((role) => role.role.name).filter(Boolean) ?? []) as RoleTypes[],
      ),
    [user?.userRoles],
  );
  const filteredNav = useMemo(
    () => getFilteredNavWithAllowedSubs(userRoleNames),
    [userRoleNames],
  );

  useEffect(() => {
    if (!sidebarOpen) setOpenCategories([]);
  }, [sidebarOpen]);

  const toggleCategory = useCallback((title: string) => {
    setOpenCategories((current) =>
      current.includes(title)
        ? current.filter((category) => category !== title)
        : [...current, title],
    );
  }, []);

  return (
    <aside
      className={`fixed bottom-0 left-0 top-16 z-40 flex flex-col border-r border-(--line) bg-(--paper) ${
        sidebarOpen ? 'w-[240px]' : 'w-[72px]'
      }`}
    >
      <div className={`flex h-16 items-center ${sidebarOpen ? 'justify-end px-4' : 'justify-center'}`}>
        <button
          type="button"
          onClick={() => dispatch(setIsOpen(!sidebarOpen))}
          className="flex size-10 items-center justify-center rounded-(--radius-control) text-(--muted) outline-none transition-[background-color,color,box-shadow] duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
          aria-label={sidebarOpen ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <FontAwesomeIcon icon={sidebarOpen ? faAnglesLeft : faBars} />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto px-3" aria-label="Dashboard navigation">
        <ul className="space-y-2">
          {filteredNav.map((nav) => {
            const selected = pathname === nav.path;
            const hasSubcategories = nav.allowedSubCategories.length > 0;
            const isSubcategoriesOpen = openCategories.includes(nav.label);
            const isSubcategoryActive = nav.allowedSubCategories.some((sub) => pathname.startsWith(sub.path));
            const isActive = selected || isSubcategoryActive;

            return (
              <li key={nav.label}>
                <Link
                  to={nav.path}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex min-h-11 items-center gap-3 rounded-(--radius-control) text-sm font-medium text-(--muted) outline-none transition-[background-color,color,box-shadow] duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px] ${
                    sidebarOpen ? 'px-3' : 'justify-center px-0'
                  }`}
                  onClick={(event) => {
                    if (hasSubcategories) {
                      event.preventDefault();
                      if (!sidebarOpen) dispatch(setIsOpen(true));
                      else toggleCategory(nav.label);
                    }
                  }}
                  title={nav.label}
                >
                  <FontAwesomeIcon icon={nav.icon} className="size-4 shrink-0" />
                  {sidebarOpen ? <span className="truncate">{nav.label}</span> : null}
                  {hasSubcategories && sidebarOpen ? (
                    <FontAwesomeIcon
                      icon={faChevronDown}
                      className={`ml-auto size-3 transition-transform duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] ${isSubcategoriesOpen ? 'rotate-180' : ''}`}
                    />
                  ) : null}
                </Link>

                {hasSubcategories && isSubcategoriesOpen && sidebarOpen ? (
                  <ul className="ml-5 mt-2 space-y-1 border-l border-(--line) pl-3">
                    {nav.allowedSubCategories.map((subCategory) => {
                      const isSubActive = pathname.startsWith(subCategory.path);
                      return (
                        <li key={subCategory.label}>
                          <Link
                            to={subCategory.path}
                            aria-current={isSubActive ? 'page' : undefined}
                            className="flex min-h-10 items-center gap-3 rounded-(--radius-control) px-3 text-sm text-(--muted) outline-none transition-[background-color,color] duration-200 ease-(--ease-flat) hover:bg-(--surface) hover:text-(--ink)"
                          >
                            <FontAwesomeIcon icon={subCategory.icon} className="size-3 shrink-0" />
                            <span className="truncate">{subCategory.label}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : null}
              </li>
            );
          })}
        </ul>
      </nav>

      {sidebarOpen ? <p className="px-4 py-6 text-center text-xs text-(--muted)">Peekaboo</p> : null}
    </aside>
  );
};

export default AuthenticatedSidebar;
