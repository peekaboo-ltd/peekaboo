import type { UUID } from "./index";
import type { Order } from "./order.type";
import type { User } from "./user.type";

export const OrderAssignmentStatus = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED',
  COMPLETED: 'COMPLETED',
};

export interface OrderAssignment {
  id: UUID;
  orderId: UUID;
  assignedToId?: UUID;
  createdById?: UUID;
  status: (typeof OrderAssignmentStatus)[keyof typeof OrderAssignmentStatus];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  order: Order;
  assignedTo?: User;
  createdBy?: User;
}
