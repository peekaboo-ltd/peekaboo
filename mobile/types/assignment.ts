import { Order } from './order';
import { User } from './auth';

export enum OrderAssignmentStatus {
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
}

export interface Assignment {
  id: string;
  orderId: string;
  assignedToId?: string;
  createdById?: string;
  status: OrderAssignmentStatus;
  description?: string;
  order?: Order;
  assignedTo?: User;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface AssignmentListParams {
  status?: OrderAssignmentStatus;
  page?: number;
  limit?: number;
}

export interface AcceptAssignmentResponse {
  success: boolean;
  assignment: Assignment;
  message?: string;
}

export interface RejectAssignmentResponse {
  success: boolean;
  assignment: Assignment;
  message?: string;
}
