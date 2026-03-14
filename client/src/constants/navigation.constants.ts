import { RoleTypes } from '@/types/auth.type';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faFileLines, faLayerGroup, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import {
  faChartLine,
  faBuilding,
  faUserCheck,
  faUserGroup,
  faCreditCard,
} from '@fortawesome/free-solid-svg-icons';

export const NAVIGATION_LINKS = {
  TRACK_ORDER: '/track',
  SERVICES: '/services',
  ABOUT: '/about',
  MY_ACCOUNT: '/auth/login',
};

export interface SidebarNav {
  label: string;
  path: string;
  icon: IconProp;
  permissions: RoleTypes[];
  subCategories?: SidebarNav[];
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
    label: 'Batches',
    path: '/batches',
    icon: faLayerGroup,
    permissions: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS, RoleTypes.CUSTOMER],
  },
  {
    label: 'Assignments',
    path: '/assignments',
    icon: faUserCheck,
    permissions: [RoleTypes.ADMIN, RoleTypes.RIDER],
  },
  {
    label: 'Payments',
    path: '/payments',
    icon: faCreditCard,
    permissions: [RoleTypes.ADMIN],
  },
  {
    label: 'Users',
    path: '/users',
    icon: faUserGroup,
    permissions: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS],
  },
  {
    label: 'Users Tracking',
    path: '/users/tracking',
    icon: faLocationDot,
    permissions: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS],
  },
  {
    label: 'Invite Organization',
    path: '/organizations/invite',
    icon: faBuilding,
    permissions: [RoleTypes.ADMIN],
  },
];
