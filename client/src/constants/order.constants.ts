import {
  faClock,
  faMoneyBill1,
  faTruck,
  faBox,
  faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import type { IconProp } from "@fortawesome/fontawesome-svg-core";
import { OrderStatus } from '@/types/order.type';
import { faCheckCircle } from '@fortawesome/free-regular-svg-icons';

export enum OrderFee {
  PER_KM = 10,
  PER_KM_LOW = 8,
  PER_KM_HIGH = 15,
}

export const ORDER_FEE_RANGES = [
  { min: 0, max: 3, fee: 600 },
  { min: 4, max: 6, fee: 1000 },
  { min: 7, max: 10, fee: 1000 },
  { min: 11, max: 15, fee: 1500 },
  { min: 16, max: 20, fee: 2000 },
  { min: 21, max: Infinity, fee: 2500 },
];

export const workflowStatuses: {
    key: OrderStatus;
    label: string;
    description: string;
    icon: IconProp;
  }[] = [
    {
      key: OrderStatus.CREATED,
      label: 'Created',
      description: 'Your order has been placed',
      icon: faClock,
    },
    {
      key: OrderStatus.PAID,
      label: 'Paid',
      description: 'Payment has been processed successfully',
      icon: faMoneyBill1,
    },
    {
      key: OrderStatus.CONFIRMED,
      label: 'Confirmed',
      description: 'Order has been verified and confirmed',
      icon: faCheckCircle,
    },
    {
      key: OrderStatus.IN_TRANSIT,
      label: 'In Transit',
      description: 'Package is on its way to you',
      icon: faTruck,
    },
    {
      key: OrderStatus.DELIVERED,
      label: 'Delivered',
      description: 'Package has arrived at destination',
      icon: faBox,
    },
    {
      key: OrderStatus.COMPLETED,
      label: 'Completed',
      description: 'Order has been successfully completed',
      icon: faTrophy,
    },
  ];
