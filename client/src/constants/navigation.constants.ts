import { RoleTypes } from '@/types/auth.type';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { faFileLines, faLayerGroup, faLocationDot } from '@fortawesome/free-solid-svg-icons';
import {
  faChartLine,
  faBuilding,
  faUserCheck,
  faUserGroup,
  faCreditCard,
  faTag,
} from '@fortawesome/free-solid-svg-icons';

export const NAVIGATION_LINKS = {
  HOME: '/',
  SERVICES: '/services',
  ABOUT: '/about',
  TRACK_ORDER: '/track',
  MY_ACCOUNT: '/auth/login',
};

export interface SidebarNav {
  label: string;
  path: string;
  icon: IconProp;
  roles: RoleTypes[];
  subCategories?: SidebarNav[];
}

export const SIDEBAR_NAV: SidebarNav[] = [
  {
    label: 'Dashboard',
    path: '/dashboard',
    icon: faChartLine,
    roles: Object.values(RoleTypes),
  },
  {
    label: 'Orders',
    path: '/orders',
    icon: faFileLines,
    roles: Object.values(RoleTypes),
  },
  {
    label: 'Batches',
    path: '/batches',
    icon: faLayerGroup,
    roles: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS],
  },
  {
    label: 'Riders',
    path: '/riders',
    icon: faUserCheck,
    roles: [RoleTypes.ADMIN, RoleTypes.RIDER],
    subCategories: [
      {
        label: 'Assignments',
        path: '/assignments',
        icon: faUserCheck,
        roles: [RoleTypes.ADMIN, RoleTypes.RIDER],
      },
      {
        label: 'Users Tracking',
        path: '/users/tracking',
        icon: faLocationDot,
        roles: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS],
      },
    ]
  },
  {
    label: 'Payments',
    path: '/payments',
    icon: faCreditCard,
    roles: [RoleTypes.ADMIN],
  },
  {
    label: 'Users',
    path: '/users',
    icon: faUserGroup,
    roles: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS],
  },
  {
    label: 'Business',
    path: '',
    icon: faBuilding,
    roles: [RoleTypes.ADMIN],
    subCategories: [
      {
        label: 'Organizations',
        path: '/organizations',
        icon: faBuilding,
        roles: [RoleTypes.ADMIN],
      },
      {
        label: 'Business Plans',
        path: '/business-plans',
        icon: faTag,
        roles: [RoleTypes.ADMIN],
      },
      {
        label: 'Billing & Payments',
        path: '/billing-payments',
        icon: faCreditCard,
        roles: [RoleTypes.ADMIN],
      },
    ]
  },
  {
    label: 'Billing & Payments',
    path: '/billing-payments',
    icon: faCreditCard,
    roles: [RoleTypes.BUSINESS],
    subCategories: [
      {
        label: 'Billing & Payments',
        path: '/billing-payments',
        icon: faCreditCard,
        roles: [RoleTypes.BUSINESS],
      },
      {
        label: 'Report',
        path: '/billing-payments/report',
        icon: faFileLines,
        roles: [RoleTypes.BUSINESS],
      },
    ],
  },
];
