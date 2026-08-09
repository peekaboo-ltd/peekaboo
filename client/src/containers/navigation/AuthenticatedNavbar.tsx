import { useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight, faUser } from '@fortawesome/free-regular-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import {
    faChevronDown,
    faBars,
    faTimes,
    faBuilding,
    faBoxOpen,
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/states/store';
import { FC, useState } from 'react';
import { setLogout } from '@/states/slices/auth.slice';
import LanguageSelector from '@/components/inputs/LanguageSelector';
import { capitalizeString } from '@/utils/strings.util';
import { UserRole } from '@/types/user.type';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getProfilePhotoUrl } from '@/utils/profilePhoto.util';
import peekabooLogo from '/peekaboo.png';

interface Props {
    className?: string;
}

const AuthenticatedNavbar = ({ className }: Props) => {
    // STATE VARIABLES
    const dispatch: AppDispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const [isOpen, setIsOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { pathname } = useLocation();
    const navigate = useNavigate();

    if (['auth/login', 'auth/register'].includes(pathname)) {
        return null;
    }

    const isBusinessUser = user?.userRoles?.some(
        (role: UserRole) => role?.role?.name === 'BUSINESS'
    );

    // NAV DROPDOWN
    const navDropdown = [
        ...(isBusinessUser
            ? [
                {
                    title: 'Organization Settings',
                    link: '/organizations/settings',
                    icon: faBuilding,
                },
            ]
            : []),
        {
            title: 'Profile',
            link: '/user-profile',
            icon: faUser,
        },
        {
            title: 'Logout',
            link: '/auth/login',
            icon: faArrowAltCircleRight,
        },
    ];

    return (
        <nav className="w-full fixed top-0 z-1000 bg-[#FAFAF7] shadow-md">
            <header
                className={`relative w-[95%] sm:w-[92%] md:w-[90%] mx-auto transition-all duration-300
        py-2 sm:py-3 h-[64px] min-h-[64px] max-h-[64px] flex items-center justify-between ${className}`}
            >
                <Link to="/" className="w-fit shrink-0">
                    <img
                        src={peekabooLogo}
                        className="h-14 w-auto sm:h-16 object-contain"
                        alt="Peekaboo Logo"
                    />
                </Link>

                <section className="flex items-center gap-2 ml-auto">
                    {pathname === '/' && (
                        <Link
                            to="/dashboard"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-normal text-primary-900 hover:bg-[var(--peekaboo-surface)] rounded-lg transition-colors duration-200"
                        >
                            Dashboard
                        </Link>
                    )}
                    {pathname === '/' && (
                        <Link
                            to="/track"
                            className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-normal text-gray-700 hover:bg-[var(--peekaboo-surface)] rounded-lg transition-colors duration-200"
                        >
                            Track order
                        </Link>
                    )}
                    <LanguageSelector className="hidden sm:block" />

                    <button
                        className="md:hidden p-2 rounded-lg cursor-pointer hover:bg-[var(--peekaboo-surface)] transition-colors duration-200"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle mobile menu"
                    >
                        <FontAwesomeIcon
                            icon={faBars}
                            className="text-gray-600 text-lg sm:text-xl"
                        />
                    </button>

                    <section className="relative">
                        <button
                            className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 pr-2 sm:pr-3 rounded-lg cursor-pointer hover:bg-[var(--peekaboo-surface)] transition-colors duration-200"
                            onClick={(e) => {
                                e.preventDefault();
                                setIsOpen(!isOpen);
                            }}
                            aria-expanded={isOpen}
                            aria-haspopup="true"
                        >
                            <Avatar className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-slate-200">
                                <AvatarImage src={user?.profilePhotoUrl ? getProfilePhotoUrl(user.profilePhotoUrl) ?? undefined : undefined} alt="" />
                                <AvatarFallback className="rounded-full bg-[var(--peekaboo-surface)] text-black text-xs font-normal">
                                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || user?.phoneNumber?.[0]?.toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            <div className="hidden sm:flex flex-col items-start">
                                <span className="text-sm font-normal text-gray-800 truncate max-w-[150px] sm:max-w-[170px]">
                                    {user?.name || user?.phoneNumber}
                                </span>
                                <span className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[170px]">
                                    {user?.userRoles?.map((role: UserRole) => capitalizeString(role?.role?.name))?.join(', ')}
                                </span>
                            </div>

                            <FontAwesomeIcon
                                className={`text-gray-400 mb-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''
                                    }`}
                                icon={faChevronDown}
                                aria-hidden="true"
                            />
                        </button>
                    </section>
                </section>

                <NavDropdown isOpen={isOpen}>
                    <section className="py-2 w-full rounded-lg shadow-md bg-[#FAFAF7] border border-gray-100">
                        <div className="sm:hidden p-4 border-b border-gray-100">
                            <h3 className="font-normal text-gray-800">
                                {user?.name || user?.phoneNumber}
                            </h3>
                            <p className="text-sm text-gray-500 truncate">
                                {user?.email || user?.phoneNumber}
                            </p>
                        </div>

                        <nav className="py-2">
                            {navDropdown?.map((nav, index) => (
                                <Link
                                    key={index}
                                    to={nav?.link}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        if (nav?.title === 'Logout') {
                                            dispatch(setLogout());
                                            if (pathname.includes('/dashboard')) {
                                                window.location.href = '/auth/login';
                                            }
                                        }
                                        navigate(`${nav?.link}`);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-[var(--peekaboo-surface)] hover:text-primary-900 transition-colors duration-200
                  ${['Theme', 'Notifications'].includes(nav?.title)
                                            ? 'min-[450px]:hidden'
                                            : ''
                                        }`}
                                >
                                    <FontAwesomeIcon
                                        className="w-4 h-4"
                                        icon={nav?.icon}
                                        aria-hidden="true"
                                    />
                                    {nav?.title}
                                </Link>
                            ))}
                        </nav>
                    </section>
                </NavDropdown>

                <aside
                    className={`md:hidden fixed inset-0 z-1001 transition-all duration-300 ${isMobileMenuOpen ? 'visible' : 'invisible'
                        }`}
                >
                    <section
                        className={`absolute inset-y-0 right-0 left-[260px] bg-black/60 backdrop-blur-sm transition-opacity duration-300 sm:left-[300px] ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                            }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                        aria-hidden="true"
                    />

                    <nav
                        className={`absolute top-0 left-0 h-full w-[260px] sm:w-[300px] bg-[#FAFAF7] shadow-sm transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                            }`}
                    >
                        <header className="flex items-center justify-start p-3 border-b border-gray-100 bg-[#FAFAF7]">
                            <button
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-[var(--peekaboo-surface)] rounded-lg transition-colors duration-200"
                                aria-label="Close menu"
                            >
                                <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                            </button>
                        </header>

                        <section className="py-2">
                            <header className="px-3 py-3 border-b border-gray-100 bg-gradient-to-r from-primary-900/5 to-transparent">
                                <div className="flex items-center gap-2.5">
                                    <Avatar className="w-10 h-10 rounded-full border border-slate-200">
                                        <AvatarImage src={user?.profilePhotoUrl ? getProfilePhotoUrl(user.profilePhotoUrl) ?? undefined : undefined} alt="" />
                                        <AvatarFallback className="rounded-full bg-[var(--peekaboo-surface)] text-black text-sm font-normal">
                                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || user?.phoneNumber?.[0]?.toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-normal text-gray-800 text-sm">
                                            {user?.name || user?.phoneNumber}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate max-w-[160px]">
                                            {user?.email || user?.phoneNumber}
                                        </p>
                                    </div>
                                </div>
                            </header>

                            <nav className="py-2">
                                <ul className="space-y-0.5">
                                    <li className="px-3 py-2">
                                        <LanguageSelector className="w-full" menuClassName="left-0 right-auto min-w-full" />
                                    </li>
                                    <li>
                                        <Link
                                            to="/dashboard"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-normal text-gray-600 hover:bg-[var(--peekaboo-surface)] hover:text-primary-900 transition-all duration-200"
                                        >
                                            <FontAwesomeIcon
                                                icon={faUser}
                                                className="w-4 h-4 text-gray-400"
                                            />
                                            Dashboard
                                        </Link>
                                    </li>
                                    <li>
                                        <Link
                                            to="/track"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-normal text-gray-600 hover:bg-[var(--peekaboo-surface)] hover:text-primary-900 transition-all duration-200"
                                        >
                                            <FontAwesomeIcon
                                                icon={faBoxOpen}
                                                className="w-4 h-4 text-gray-400"
                                            />
                                            Track order
                                        </Link>
                                    </li>
                                    {navDropdown?.map((nav, index) => (
                                        <li key={index}>
                                            <Link
                                                to={nav?.link}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    setIsMobileMenuOpen(false);
                                                    if (nav?.title === 'Logout') {
                                                        dispatch(setLogout());
                                                        if (pathname.includes('/dashboard')) {
                                                            window.location.href = '/auth/login';
                                                        }
                                                    }
                                                    navigate(`${nav?.link}`);
                                                }}
                                                className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-normal text-gray-600 hover:bg-[var(--peekaboo-surface)] hover:text-primary-900 transition-all duration-200"
                                            >
                                                <FontAwesomeIcon
                                                    icon={nav.icon}
                                                    className="w-4 h-4 text-gray-400"
                                                />
                                                {nav?.title}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </nav>
                        </section>
                    </nav>
                </aside>
            </header>
        </nav>
    );
};

interface NavDropdownProps {
    isOpen: boolean;
    children: React.ReactNode;
}

export const NavDropdown: FC<NavDropdownProps> = ({ isOpen, children }) => {
    return (
        <aside
            className={`${isOpen ? 'translate-y-0' : 'translate-y-[-400px]'
                } ease-in-out duration-300 z-[10000] absolute top-[calc(100%+0.35rem)] right-0 w-[250px] bg-transparent rounded-md max-[450px]:fixed max-[450px]:top-[64px] max-[450px]:left-0 max-[450px]:right-0 max-[450px]:w-screen`}
            role="dialog"
            aria-modal="true"
            aria-label="User menu"
        >
            {children}
        </aside>
    );
};

export default AuthenticatedNavbar;
