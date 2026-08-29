import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Building2, ChevronDown, LogOut, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/states/store';
import { setLogout } from '@/states/slices/auth.slice';
import LanguageSelector from '@/components/inputs/LanguageSelector';
import { capitalizeString } from '@/utils/strings.util';
import type { UserRole } from '@/types/user.type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfilePhotoUrl } from '@/utils/profilePhoto.util';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import peekabooLogo from '/peekaboo.png';

interface Props {
  className?: string;
}

const navLinkClassName =
  'inline-flex min-h-10 items-center rounded-lg px-3 text-sm font-normal transition-[background-color,color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:bg-(--surface) active:shadow-[var(--press-on-ink)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]';

const AuthenticatedNavbar = ({ className }: Props) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (['/auth/login', '/auth/register'].includes(pathname)) return null;

  const isBusinessUser = user?.userRoles?.some(
    (role: UserRole) => role?.role?.name === 'BUSINESS',
  );

  const userRolesLabel = user?.userRoles
    ?.map((role: UserRole) => capitalizeString(role?.role?.name))
    .join(', ');

  const navDropdown = [
    ...(isBusinessUser
      ? [{ title: 'Organization Settings', link: '/organizations/settings', icon: Building2 }]
      : []),
    { title: 'Profile', link: '/user-profile', icon: User },
    { title: 'Logout', link: '/auth/login', icon: LogOut, destructive: true },
  ] as const;

  const userInitial =
    user?.name?.[0]?.toUpperCase()
    || user?.email?.[0]?.toUpperCase()
    || user?.phoneNumber?.[0]?.toUpperCase();

  return (
    <header className={cn('invert-surface sticky top-0 z-50 h-16', className)}>
      <nav className="app-container flex h-16 items-center justify-between" aria-label="Account navigation">
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

        <div className="flex items-center gap-2">
          {pathname === '/' ? (
            <>
              <Link to="/dashboard" className={cn(navLinkClassName, 'hidden sm:inline-flex')}>
                Dashboard
              </Link>
              <Link to="/track" className={cn(navLinkClassName, 'hidden sm:inline-flex')}>
                Track order
              </Link>
            </>
          ) : null}

          <div className="hidden sm:block">
            <LanguageSelector />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                className="group inline-flex h-(--control-lg) min-h-11 cursor-pointer items-center gap-2 rounded-(--radius-control) border border-(--line) bg-(--paper) px-3 text-sm font-medium text-(--ink) outline-none transition-[background-color,color,border-color,box-shadow] duration-200 ease-(--ease-flat) hover:border-(--line-strong) hover:bg-(--surface) active:shadow-[var(--press-on-paper)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
                aria-haspopup="menu"
                aria-label={`Account menu for ${user?.name || user?.phoneNumber || 'user'}`}
              >
                <Avatar className="size-8 shrink-0 rounded-(--radius-control) border border-(--line)">
                  <AvatarImage
                    src={user?.profilePhotoUrl ? getProfilePhotoUrl(user.profilePhotoUrl) ?? undefined : undefined}
                    alt=""
                  />
                  <AvatarFallback className="rounded-(--radius-control) bg-(--surface) text-sm text-(--ink)">
                    {userInitial}
                  </AvatarFallback>
                </Avatar>

                <span className="hidden max-w-[150px] flex-col items-start sm:flex">
                  <span className="w-full truncate text-sm font-medium text-(--ink)">
                    {user?.name || user?.phoneNumber}
                  </span>
                  {userRolesLabel ? (
                    <span className="type-meta w-full truncate">{userRolesLabel}</span>
                  ) : null}
                </span>

                <ChevronDown
                  className="size-4 shrink-0 text-(--muted) transition-transform duration-200 group-data-[state=open]:rotate-180"
                  aria-hidden="true"
                />
              </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              align="end"
              sideOffset={8}
              className="w-[min(100vw-2rem,320px)] border border-(--line) bg-(--paper) p-3 shadow-(--shadow-menu)"
            >
              <div className="border-b border-(--line) pb-3">
                <p className="text-sm font-medium text-(--ink)">
                  {user?.name || user?.phoneNumber}
                </p>
                <p className="type-meta mt-0.5 truncate">
                  {user?.email || user?.phoneNumber}
                </p>
                {userRolesLabel ? (
                  <p className="type-meta mt-1">{userRolesLabel}</p>
                ) : null}
              </div>

              <ul className="mt-2 grid gap-2" role="menu" aria-label="Account options">
                {navDropdown.map((item) => {
                  const Icon = item.icon;
                  const isLogout = item.title === 'Logout';

                  return (
                    <li key={item.title} role="none">
                      <DropdownMenuItem
                        role="menuitem"
                        variant={isLogout ? 'destructive' : 'default'}
                        onSelect={() => {
                          if (isLogout) dispatch(setLogout());
                          navigate(item.link);
                        }}
                        className={cn(
                          'flex h-auto w-full cursor-pointer items-center gap-3 rounded-(--radius-control) border px-4 py-3 text-sm font-medium transition-[border-color,background-color,box-shadow] duration-200 ease-(--ease-flat)',
                          isLogout
                            ? 'border-(--line) bg-(--paper) text-(--danger) hover:border-(--line-strong) hover:bg-(--danger-surface) focus:bg-(--danger-surface)'
                            : 'border-(--line) bg-(--paper) text-(--ink) hover:border-(--line-strong) hover:bg-(--surface) focus:bg-(--surface)',
                        )}
                      >
                        <Icon className="size-4 shrink-0" aria-hidden="true" />
                        <span>{item.title}</span>
                      </DropdownMenuItem>
                    </li>
                  );
                })}
              </ul>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default AuthenticatedNavbar;
