import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { AbstractEntity } from './index';
import { Order } from './order.entity';
import { User } from './user.entity';
import { UUID } from '../types';
import { OrderStatus } from '../constants/order.constants';

@Entity('order_activities')
export class OrderActivity extends AbstractEntity {
  // ORDER ID
  @Column({ name: 'order_id', type: 'uuid', nullable: false })
  orderId: UUID;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: false,
    enum: OrderStatus,
  })
  status: OrderStatus;

  // NOTES
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // CREATED BY ID
  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById: UUID;

  /**
   * RELATIONS
   */

  // ORDER
  @ManyToOne(() => Order, (order) => order.id)
  @JoinColumn({ name: 'order_id' })
  order: Order;

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;
}
