import { RoleTypes } from '@/types/auth.type';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faFileLines } from '@fortawesome/free-regular-svg-icons';
import {
  faChartLine,
  faUserCheck,
  faUserGroup,
} from '@fortawesome/free-solid-svg-icons';

export const NAVIGATION_LINKS = {
  SERVICES: '/services',
  ABOUT: '/about',
  MY_ACCOUNT: '/auth/login',
};

export interface SidebarNav {
  label: string;
  path: string;
  icon: IconProp;
  permissions: RoleTypes[];
  subcategories?: SidebarNav[];
}

export const SIDEBAR_NAV: SidebarNav[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: faChartLine,
    permissions: Object.values(RoleTypes),
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: faFileLines,
    permissions: Object.values(RoleTypes),
  },
  {
    label: 'Assignments',
    path: '/assignments',
    icon: faUserCheck,
    permissions: Object.values(RoleTypes),
  },
  {
    label: 'Users',
    path: '/users',
    icon: faUserGroup,
    permissions: [RoleTypes.ADMIN, RoleTypes.STAFF],
  },
];
