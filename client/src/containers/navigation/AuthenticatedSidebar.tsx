import { useCallback, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { setIsOpen } from '@/states/slices/sidebar.slice';
import { AppDispatch, RootState } from '@/states/store';
import { SIDEBAR_NAV, SidebarNav } from '@/constants/navigation.constants';
import { UserRole } from '@/types/user.type';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

const SidebarNavContent = () => {
  const { pathname, search } = useLocation();
  const navigate = useNavigate();
  const { user } = useSelector((state: RootState) => state.auth);
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [openCategories, setOpenCategories] = useState<string[]>([]);

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
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupContent>
          <SidebarMenu>
            {filteredSidebarNav.map((nav: SidebarNav) => {
              const selected = pathname === nav.path;
              const isSubcategoryActive = nav.subcategories?.some((sub: SidebarNav) =>
                pathname.startsWith(sub.path)
              );
              const isActive = selected || isSubcategoryActive;

              if (nav.subcategories && nav.subcategories.length > 0) {
                const isOpen = nav.label ? openCategories.includes(nav.label) : false;

                return (
                  <Collapsible
                    key={nav.label}
                    open={isOpen}
                    onOpenChange={() => {
                      if (nav.label) toggleCategory(nav.label);
                    }}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton
                          tooltip={nav.label}
                          isActive={isActive}
                          className="text-[13px]"
                        >
                          <FontAwesomeIcon icon={nav.icon} className="text-sm" />
                          <span>{nav.label}</span>
                          {!isCollapsed && (
                            <FontAwesomeIcon
                              icon={faChevronDown}
                              className={`ml-auto text-[10px] text-muted-foreground transition-transform duration-200 ${
                                isOpen ? 'rotate-180' : ''
                              }`}
                            />
                          )}
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {nav.subcategories.map((sub: SidebarNav) => {
                            const isSubActive = pathname + search === sub.path;
                            return (
                              <SidebarMenuSubItem key={sub.path}>
                                <SidebarMenuSubButton
                                  isActive={isSubActive}
                                  onClick={() => navigate(sub.path)}
                                  className="text-[13px] cursor-pointer"
                                >
                                  <FontAwesomeIcon icon={sub.icon} className="text-xs" />
                                  <span>{sub.label}</span>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            );
                          })}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }

              return (
                <SidebarMenuItem key={nav.path}>
                  <SidebarMenuButton
                    tooltip={nav.label}
                    isActive={isActive}
                    onClick={() => navigate(nav.path)}
                    className="text-[13px] cursor-pointer"
                  >
                    <FontAwesomeIcon icon={nav.icon} className="text-sm" />
                    <span>{nav.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
};

const AuthenticatedSidebar = () => {
  const dispatch: AppDispatch = useDispatch();
  const { isOpen: sidebarOpen } = useSelector(
    (state: RootState) => state.sidebar
  );

  const handleOpenChange = useCallback(
    (open: boolean) => {
      dispatch(setIsOpen(open));
    },
    [dispatch]
  );

  return (
    <Sidebar
      collapsible="icon"
      className="top-[9vh] h-[calc(100vh-9vh)] border-r border-sidebar-border"
      {...(sidebarOpen !== undefined && {
        'data-state': sidebarOpen ? 'expanded' : 'collapsed',
      })}
    >
      <SidebarNavContent />
    </Sidebar>
  );
};

export { AuthenticatedSidebar };
export default AuthenticatedSidebar;
