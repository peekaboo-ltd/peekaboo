import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight, faUser } from '@fortawesome/free-regular-svg-icons';
import { faBuilding, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/states/store';
import { setLogout } from '@/states/slices/auth.slice';
import LanguageSelector from '@/components/inputs/LanguageSelector';
import type { UserRole } from '@/types/user.type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfilePhotoUrl } from '@/utils/profilePhoto.util';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import peekabooLogo from '/peekaboo.png';

interface Props {
  className?: string;
}

const AuthenticatedNavbar = ({ className }: Props) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  if (['/auth/login', '/auth/register'].includes(pathname)) return null;

  const isBusinessUser = user?.userRoles?.some(
    (role: UserRole) => role?.role?.name === 'BUSINESS',
  );
  const navDropdown = [
    ...(isBusinessUser
      ? [{ title: 'Organization Settings', link: '/organizations/settings', icon: faBuilding }]
      : []),
    { title: 'Profile', link: '/user-profile', icon: faUser },
    { title: 'Logout', link: '/auth/login', icon: faArrowAltCircleRight },
  ];

  return (
    <header className={`invert-surface sticky top-0 z-50 h-16 ${className ?? ''}`}>
      <nav className="app-container flex h-16 items-center justify-between" aria-label="Account navigation">
        <Link
          to="/"
          className="flex h-(--control-lg) items-center rounded-(--radius-control) px-2 outline-none focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]"
          aria-label="Peekaboo home"
        >
          <img src={peekabooLogo} className="h-10 w-auto object-contain invert dark:invert-0" alt="Peekaboo" />
        </Link>

        <div className="flex items-center gap-2">
          {pathname === '/' ? (
            <>
              <Link to="/dashboard" className="hidden min-h-10 items-center rounded-(--radius-pill) px-4 text-sm font-normal hover:bg-(--surface) sm:flex">
                Dashboard
              </Link>
              <Link to="/track" className="hidden min-h-10 items-center rounded-(--radius-pill) px-4 text-sm font-normal hover:bg-(--surface) sm:flex">
                Track order
              </Link>
            </>
          ) : null}
          <div className="hidden sm:block"><LanguageSelector /></div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex h-(--control-md) items-center gap-3 text-sm rounded-(--radius-pill) px-4 outline-none transition-[background-color,box-shadow] duration-200 ease-[cubic-bezier(0,0,1,1)] hover:bg-(--surface) active:shadow-[var(--press-on-ink)_999px_999px_0_inset] focus-visible:shadow-[var(--paper)_0_0_0_2px_inset,var(--ink)_0_0_0_2px]">
                <Avatar className="size-8 rounded-(--radius-pill) border border-(--line)">
                  <AvatarImage src={user?.profilePhotoUrl ? getProfilePhotoUrl(user.profilePhotoUrl) ?? undefined : undefined} alt="" />
                  <AvatarFallback className="rounded-(--radius-control) bg-(--surface) text-sm">
                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || user?.phoneNumber?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <FontAwesomeIcon icon={faChevronDown} className="size-3 text-(--muted)" aria-hidden="true" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] py-0">
              {navDropdown.map((item) => (
                <DropdownMenuItem
                  key={item.title}
                  onSelect={() => {
                    if (item.title === 'Logout') dispatch(setLogout());
                    navigate(item.link);
                  }}
                  className="cursor-pointer text-sm"
                >
                  <FontAwesomeIcon icon={item.icon} className="size-3.5" aria-hidden="true" />
                  {item.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </nav>
    </header>
  );
};

export default AuthenticatedNavbar;
