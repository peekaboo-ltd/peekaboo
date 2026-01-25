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
  orderId?: string;
  assignedToId?: string;
  page?: number;
  size?: number;
}

export interface AssignmentApiResponse {
  message: string;
  data: Assignment;
}

export interface AcceptAssignmentResponse extends AssignmentApiResponse {}

export interface RejectAssignmentResponse extends AssignmentApiResponse {}
