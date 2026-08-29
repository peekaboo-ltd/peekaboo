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
  labelKey: string;
  path: string;
  icon: IconProp;
  roles: RoleTypes[];
  subCategories?: SidebarNav[];
}

export const SIDEBAR_NAV: SidebarNav[] = [
  {
    label: 'Dashboard',
    labelKey: 'nav.sidebar.dashboard',
    path: '/dashboard',
    icon: faChartLine,
    roles: Object.values(RoleTypes),
  },
  {
    label: 'Orders',
    labelKey: 'nav.sidebar.orders',
    path: '/orders',
    icon: faFileLines,
    roles: Object.values(RoleTypes),
  },
  {
    label: 'Batches',
    labelKey: 'nav.sidebar.batches',
    path: '/batches',
    icon: faLayerGroup,
    roles: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS],
  },
  {
    label: 'Rider Management',
    labelKey: 'nav.sidebar.riderManagement',
    path: '/riders',
    icon: faUserCheck,
    roles: [RoleTypes.ADMIN, RoleTypes.RIDER],
    subCategories: [
      {
        label: 'Assignments',
        labelKey: 'nav.sidebar.assignments',
        path: '/assignments',
        icon: faUserCheck,
        roles: [RoleTypes.ADMIN, RoleTypes.RIDER],
      },
      {
        label: 'Rider Management',
        labelKey: 'nav.sidebar.riderManagement',
        path: '/rider-management',
        icon: faUserGroup,
        roles: [RoleTypes.ADMIN],
      },
      {
        label: 'Users Tracking',
        labelKey: 'nav.sidebar.userTracking',
        path: '/users/tracking',
        icon: faLocationDot,
        roles: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS],
      },
    ]
  },
  {
    label: 'Payments',
    labelKey: 'nav.sidebar.payments',
    path: '/payments',
    icon: faCreditCard,
    roles: [RoleTypes.ADMIN],
  },
  {
    label: 'Users',
    labelKey: 'nav.sidebar.users',
    path: '/users',
    icon: faUserGroup,
    roles: [RoleTypes.ADMIN, RoleTypes.STAFF, RoleTypes.BUSINESS],
  },
  {
    label: 'Business',
    labelKey: 'nav.sidebar.business',
    path: '',
    icon: faBuilding,
    roles: [RoleTypes.ADMIN],
    subCategories: [
      {
        label: 'Organizations',
        labelKey: 'nav.sidebar.organizations',
        path: '/organizations',
        icon: faBuilding,
        roles: [RoleTypes.ADMIN],
      },
      {
        label: 'Business Plans',
        labelKey: 'nav.sidebar.businessPlans',
        path: '/business-plans',
        icon: faTag,
        roles: [RoleTypes.ADMIN],
      },
      {
        label: 'Billing & Payments',
        labelKey: 'nav.sidebar.billingPayments',
        path: '/billing-payments',
        icon: faCreditCard,
        roles: [RoleTypes.ADMIN],
      },
    ]
  },
  {
    label: 'Billing & Payments',
    labelKey: 'nav.sidebar.billingPayments',
    path: '/billing-payments',
    icon: faCreditCard,
    roles: [RoleTypes.BUSINESS],
    subCategories: [
      {
        label: 'Billing & Payments',
        labelKey: 'nav.sidebar.billingPayments',
        path: '/billing-payments',
        icon: faCreditCard,
        roles: [RoleTypes.BUSINESS],
      },
      {
        label: 'Report',
        labelKey: 'nav.sidebar.report',
        path: '/billing-payments/report',
        icon: faFileLines,
        roles: [RoleTypes.BUSINESS],
      },
    ],
  },
];
