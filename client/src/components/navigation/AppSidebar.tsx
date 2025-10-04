import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Users, 
  ClipboardList, 
  FileText, 
  Settings,
  ChevronRight,
  Package2
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from '../../components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { useAppSelector } from '../../states/hooks';
import authService from '../../services/auth.service';
import { cn } from '../../lib/utils';

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  roles: string[];
}

const navigationItems: NavItem[] = [
  { 
    label: 'Dashboard', 
    href: '/admin', 
    icon: LayoutDashboard, 
    roles: ['ADMIN', 'RIDER'] 
  },
  { 
    label: 'Orders', 
    href: '/admin/orders', 
    icon: Package, 
    roles: ['ADMIN', 'RIDER'] 
  },
  { 
    label: 'Users', 
    href: '/admin/users', 
    icon: Users, 
    roles: ['ADMIN'] 
  },
  { 
    label: 'Assignments', 
    href: '/admin/assignments', 
    icon: ClipboardList, 
    roles: ['ADMIN', 'RIDER'] 
  },
  { 
    label: 'Audit Logs', 
    href: '/admin/audit-logs', 
    icon: FileText, 
    roles: ['ADMIN'] 
  },
  { 
    label: 'Settings', 
    href: '/admin/settings', 
    icon: Settings, 
    roles: ['ADMIN', 'RIDER', 'CUSTOMER'] 
  },
];

export const AppSidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAppSelector((state) => state.auth);
  const { state } = useSidebar();

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    authService.hasAnyRole(item.roles)
  );

  // Get user initials for avatar fallback
  const getUserInitials = () => {
    if (!user?.name) return 'U';
    const names = user.name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  // Get user's primary role for display
  const getPrimaryRole = () => {
    if (!user?.userRoles || user.userRoles.length === 0) return 'User';
    const roles = user.userRoles.map(ur => ur.role.name);
    if (roles.includes('ADMIN')) return 'Admin';
    if (roles.includes('RIDER')) return 'Rider';
    if (roles.includes('CUSTOMER')) return 'Customer';
    return 'User';
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link to="/">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <Package2 className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Peekaboo</span>
                  <span className="truncate text-xs">Delivery Management</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/admin' && location.pathname.startsWith(item.href));
                
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.label}>
                      <Link 
                        to={item.href}
                        className={cn(
                          isActive && "bg-indigo-50 text-indigo-600"
                        )}
                      >
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                        {isActive && (
                          <ChevronRight className="ml-auto size-4" />
                        )}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm",
              state === "collapsed" && "justify-center"
            )}>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}` : undefined} />
                <AvatarFallback>{getUserInitials()}</AvatarFallback>
              </Avatar>
              {state !== "collapsed" && (
                <div className="flex flex-col">
                  <span className="font-medium">{user?.name || 'User'}</span>
                  <span className="text-xs text-muted-foreground">{getPrimaryRole()}</span>
                </div>
              )}
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};