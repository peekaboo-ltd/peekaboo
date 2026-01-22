import { useLocation } from 'react-router';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowAltCircleRight, faUser } from '@fortawesome/free-regular-svg-icons';
import { Link, useNavigate } from 'react-router-dom';
import {
    faChevronDown,
    faBars,
    faTimes,
} from '@fortawesome/free-solid-svg-icons';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/states/store';
import { FC, useState } from 'react';
import { setLogout } from '@/states/slices/auth.slice';
import LanguageSelector from '@/components/inputs/LanguageSelector';

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

    // NAV DROPDOWN
    const navDropdown = [
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
        <nav className="w-full fixed top-0 z-1000 bg-white shadow-md">
        <header
            className={`w-[90%] mx-auto transition-all duration-300
        py-2 sm:py-3 h-[9vh] flex items-center justify-between ${className}`}
        >
            <Link to="/" className="w-fit shrink-0">
                <img
                    src="/peekaboo.png"
                    className="h-12 w-auto sm:h-16 md:h-20 max-w-[200px] sm:max-w-[230px] md:max-w-[280px]"
                    alt="Peekaboo Logo"
                />
            </Link>

            <section className="flex items-center gap-2 sm:gap-3 ml-auto">
                    {pathname === '/' && <Link
                    to="/dashboard"
                    className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors duration-200"
                >
                    Dashboard
                </Link>}

                <LanguageSelector />

                <button
                    className="md:hidden p-2 rounded-lg cursor-pointer hover:bg-gray-300 transition-colors duration-200"
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
                        className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 pr-2 sm:pr-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                        onClick={(e) => {
                            e.preventDefault();
                            setIsOpen(!isOpen);
                        }}
                        aria-expanded={isOpen}
                        aria-haspopup="true"
                    >
                        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                            {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || user?.phoneNumber?.[0]?.toUpperCase()}
                        </div>

                        <div className="hidden sm:flex flex-col items-start">
                            <span className="text-sm font-medium text-gray-800 truncate max-w-[150px] sm:max-w-[170px]">
                                {user?.name || user?.phoneNumber}
                            </span>
                            <span className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-[170px]">
                                {user?.email || user?.phoneNumber}
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
                <section className="py-2 w-full rounded-lg shadow-lg bg-white border border-gray-100">
                    <div className="sm:hidden p-4 border-b border-gray-100">
                        <h3 className="font-medium text-gray-800">
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
                                        navigate('/auth/login');
                                        window.location.reload();
                                    }
                                    navigate(`${nav?.link}`);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-primary transition-colors duration-200
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
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
                        }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    aria-hidden="true"
                />

                <nav
                    className={`absolute top-0 left-0 h-full w-[260px] sm:w-[300px] bg-white shadow-xl transform transition-transform duration-300 ease-out ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                        }`}
                >
                    <header className="flex items-center justify-start p-3 border-b border-gray-100 bg-gray-50/50">
                        <button
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                            aria-label="Close menu"
                        >
                            <FontAwesomeIcon icon={faTimes} className="w-4 h-4" />
                        </button>
                    </header>

                    <section className="py-2">
                        <header className="px-3 py-3 border-b border-gray-100 bg-linear-to-r from-primary/5 to-transparent">
                            <div className="flex items-center gap-2.5">
                                <span className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium text-base">
                                    {user?.name?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || user?.phoneNumber?.[0]?.toUpperCase()}
                                </span>
                                <div>
                                    <p className="font-medium text-gray-800 text-sm">
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
                                    <LanguageSelector />
                                </li>
                                <li>
                                    <Link
                                        to="/dashboard"
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200"
                                    >
                                        <FontAwesomeIcon
                                            icon={faUser}
                                            className="w-4 h-4 text-gray-400"
                                        />
                                        Dashboard
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
                                                    navigate('/auth/login');
                                                    window.location.reload();
                                                }
                                                navigate(`${nav?.link}`);
                                            }}
                                            className="flex items-center gap-2.5 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-primary transition-all duration-200"
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
    const { pathname } = useLocation();

    return (
        <aside
            className={`${isOpen ? 'translate-y-0' : 'translate-y-[-400px]'
                } ease-in-out duration-500 z-[10000] absolute top-[9vh] ${pathname.includes('services') ? 'right-[7%]' : 'right-[2%]'
                } w-[250px] bg-transparent shadow-md rounded-md max-[450px]:w-[100vw]`}
            role="dialog"
            aria-modal="true"
            aria-label="User menu"
        >
            {children}
        </aside>
    );
};

export default AuthenticatedNavbar;
