import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { AbstractEntity } from '.';
import { UUID } from '../types';
import { BatchStatus } from '../constants/batch.constants';
import { Order } from './order.entity';

@Entity('batches')
export class Batch extends AbstractEntity {
  // NAME
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  name: string;

  // REFERENCE ID
  @Column({ name: 'reference_id', type: 'varchar', length: 255, nullable: false })
  referenceId: string;

  // DESCRIPTION
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // CREATED BY ID
  @Column({ name: 'created_by_id', type: 'uuid', nullable: false })
  createdById: UUID;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: false,
    enum: BatchStatus,
    default: BatchStatus.PENDING,
  })
  status: BatchStatus;

  /**
   *  RELATIONS
   */

  // CREATED BY
  @ManyToOne(() => User, (user) => user.createdBatches, { nullable: false })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  // ORDERS
  @OneToMany(() => Order, (order) => order.batch)
  orders: Order[];
}
