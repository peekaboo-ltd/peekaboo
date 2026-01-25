import { setIsOpen } from '@/states/slices/sidebar.slice';
import { AppDispatch, RootState } from '@/states/store';
import { SIDEBAR_NAV, SidebarNav } from '@/constants/navigation.constants';
import {
    faBars,
    faChevronDown,
    faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { motion, useAnimation } from 'framer-motion';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UserRole } from '@/types/user.type';

const AuthenticatedSidebar = () => {
    const { pathname, search } = useLocation();
    const dispatch: AppDispatch = useDispatch();
    const { isOpen: sidebarOpen } = useSelector(
        (state: RootState) => state.sidebar
    );
    const { user } = useSelector((state: RootState) => state.auth);
    const [openCategories, setOpenCategories] = useState<string[]>([]);
    const navigate = useNavigate();
    const controlText = useAnimation();

    const handleSidebarToggle = useCallback(() => {
        dispatch(setIsOpen(!sidebarOpen));
    }, [dispatch, sidebarOpen]);

    const showMore = useCallback(() => {
        controlText.start({
            opacity: 1,
            transition: { delay: 0.1, duration: 0.2 },
        });
    }, [controlText]);

    const showLess = useCallback(() => {
        controlText.start({
            opacity: 0,
            transition: { duration: 0.1 },
        });
    }, [controlText]);

    useEffect(() => {
        if (sidebarOpen) {
            showMore();
        } else {
            showLess();
            setOpenCategories([]);
        }
    }, [sidebarOpen, showMore, showLess]);

    const toggleCategory = useCallback((title: string) => {
        setOpenCategories((prev) =>
            prev.includes(title)
                ? prev.filter((cat) => cat !== title)
                : [...prev, title]
        );
    }, []);

    const filteredSidebarNav = useMemo(() => {
        return (SIDEBAR_NAV as SidebarNav[]).filter((nav: SidebarNav) => {
            const hasRequiredPermission = nav.permissions.some((permission) =>
                user?.userRoles?.some(
                    (userPermission: UserRole) => userPermission.role.name === permission
                )
            );

            if (nav.subcategories) {
                nav.subcategories = nav.subcategories.filter((sub: SidebarNav) =>
                    sub.permissions.some((permission) =>
                        user?.userRoles?.some(
                            (userPermission: UserRole) => userPermission.role.name === permission
                        )
                    )
                );
                return hasRequiredPermission && nav.subcategories.length > 0;
            }

            return hasRequiredPermission;
        });
    }, [user?.userRoles]);

    return (
        <motion.div
            className={`fixed top-[9vh] left-0 h-[calc(100vh-9vh)] flex flex-col 
                 bg-primary-900 border-r border-primary-900 transition-all duration-300 ease-in-out 
                 ${sidebarOpen ? 'z-[999]' : 'z-10'}
                 ${sidebarOpen
                    ? 'w-[280px] sm:w-[300px] shadow-sm p-4'
                    : 'w-16 p-2 shadow-sm'
                } 
                 md:w-[${sidebarOpen ? '18vw' : '6vw'
                }] md:p-4 md:shadow-none md:z-auto overflow-y-auto`}
        >
            <div
                className={`flex items-center w-full mb-4
                   ${sidebarOpen ? 'justify-end pr-0' : 'justify-center pt-2'}
                   md:justify-end md:pr-0 md:pt-0`}
            >
                <FontAwesomeIcon
                    icon={faBars}
                    onClick={(e) => {
                        e.preventDefault();
                        handleSidebarToggle();
                    }}
                    className={`cursor-pointer p-2 px-[8.2px] rounded-full bg-primary-900 text-white hover:bg-primary-800 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-900 focus:ring-opacity-50 ${!sidebarOpen ? 'mx-auto' : ''
                        }`}
                    aria-label={sidebarOpen ? 'Close sidebar' : 'Open sidebar'}
                />
            </div>

            <ul
                className={`flex flex-col items-start w-full gap-2 ${sidebarOpen ? 'overflow-y-auto flex-1' : 'overflow-hidden'
                    }`}
            >
                {filteredSidebarNav.map((nav: SidebarNav, index: number) => {
                    const selected = pathname === nav.path;
                    const subcategoriesIsOpen = nav.label
                        ? openCategories.includes(nav.label)
                        : false;
                    const isSubcategoryActive = nav.subcategories?.some((sub: SidebarNav) =>
                        pathname.startsWith(sub.path)
                    );
                    const isLinkActive = selected || isSubcategoryActive;

                    return (
                        <li key={index} className="w-full flex flex-col items-start">
                            <Link
                                to={nav.path}
                                className={`flex w-full items-center gap-4 font-medium text-[14px] ease-in-out duration-200 rounded-lg 
                          ${sidebarOpen ? 'px-4 py-3' : 'p-3 justify-center'}
                          hover:bg-white/90 hover:text-primary
                          ${isLinkActive
                                        ? 'bg-white text-primary font-semibold'
                                        : 'text-white'
                                    }`}
                                onClick={(e) => {
                                    if (nav.subcategories) {
                                        e.preventDefault();
                                        if (!sidebarOpen) {
                                            handleSidebarToggle();
                                        } else {
                                            if (nav.label) {
                                                toggleCategory(nav.label);
                                            }
                                        }
                                    } else {
                                        if (!sidebarOpen) {
                                            handleSidebarToggle();
                                        }
                                        navigate(nav.path);
                                    }
                                }}
                                title={nav.label}
                            >
                                <FontAwesomeIcon
                                    icon={nav.icon}
                                    className={`text-lg flex items-center`}
                                />
                                <motion.span
                                    initial={{ opacity: 0 }}
                                    animate={controlText}
                                    className="font-medium whitespace-nowrap"
                                    style={{ display: sidebarOpen ? 'block' : 'none' }}
                                >
                                    {nav.label}
                                </motion.span>
                                {nav.subcategories && sidebarOpen && (
                                    <FontAwesomeIcon
                                        icon={subcategoriesIsOpen ? faChevronUp : faChevronDown}
                                        className="ml-auto text-base text-gray-400"
                                    />
                                )}
                            </Link>
                            {nav.subcategories && subcategoriesIsOpen && sidebarOpen && (
                                <motion.ul
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2, ease: 'easeInOut' }}
                                    className="pl-4 pr-4 w-full flex flex-col gap-1 my-2"
                                >
                                    {nav.subcategories.map((sub: SidebarNav, subIndex: number) => {
                                        const isSubLinkActive = pathname + search === sub.path;
                                        return (
                                            <li key={subIndex}>
                                                <Link
                                                    to={sub.path}
                                                    className={`flex items-center w-full gap-3 px-4 py-3 font-medium text-[14px] ease-in-out duration-200 rounded-md 
                                    hover:bg-white hover:text-primary
                                    ${isSubLinkActive
                                                            ? 'bg-white text-primary font-semibold'
                                                            : 'text-white'
                                                        }`}
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        navigate(sub.path);
                                                    }}
                                                >
                                                    <FontAwesomeIcon
                                                        icon={sub?.icon}
                                                        className={`text-base`}
                                                    />
                                                    <motion.span
                                                        animate={controlText}
                                                        className="font-medium whitespace-nowrap"
                                                        style={{ display: sidebarOpen ? 'block' : 'none' }}
                                                    >
                                                        {sub.label}
                                                    </motion.span>
                                                </Link>
                                            </li>
                                        );
                                    })}
                                </motion.ul>
                            )}
                        </li>
                    );
                })}
            </ul>
        </motion.div>
    );
};

export default AuthenticatedSidebar;
