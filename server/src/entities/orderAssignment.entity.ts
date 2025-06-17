import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { AbstractEntity } from "./index";
import { UUID } from "../types";
import { Order } from "./order.entity";
import { User } from "./user.entity";
import { OrderAssignmentStatus } from "../constants/order.constants";
@Entity("order_assignments")
export class OrderAssignment extends AbstractEntity {
  // ORDER ID
  @Column({ name: "order_id", type: "uuid", nullable: false })
  orderId: UUID;

  // ASSIGNED TO ID
  @Column({ name: "assigned_to_id", type: "uuid", nullable: true })
  assignedToId?: UUID;

  // CREATED BY ID
  @Column({ name: "created_by_id", type: "uuid", nullable: true })
  createdById?: UUID;

  // STATUS
  @Column({
    name: "status",
    type: "enum",
    enum: OrderAssignmentStatus,
    nullable: false,
    default: OrderAssignmentStatus.PENDING,
  })
  status: OrderAssignmentStatus;

  // DESCRIPTION
  @Column({ name: "description", type: "text", nullable: true })
  description?: string;

  /**
   * RELATIONS
   */

  // ORDER
  @ManyToOne(() => Order, (order) => order.id)
  @JoinColumn({ name: "order_id" })
  order: Order;

  // ASSIGNED TO
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "assigned_to_id" })
  assignedTo: User;

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "created_by_id" })
  createdBy: User;
}
