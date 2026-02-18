import { type UUID } from '../types';
import { type BaseDomain } from './base';
import { type Order } from './order.type';
import type { User } from './user.type';

export enum BatchStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export interface Batch extends BaseDomain {
  name?: string | null;
  referenceId: string;
  description?: string;
  createdById: UUID;
  status: BatchStatus;

  // Relations
  createdBy?: User;
  orders?: Order[];
}
