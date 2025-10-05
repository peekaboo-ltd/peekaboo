import { Column, JoinColumn, ManyToOne, Entity } from 'typeorm';
import { AbstractEntity } from '.';
import { UUID } from '../types';
import { PaymentType } from '../constants/payment.constants';
import { User } from './user.entity';
import { KpayPaymentStatus } from '../types/kpay.types';

@Entity('payments')
export class Payment extends AbstractEntity {
  // ENTITY ID
  @Column({ name: 'entity_id', type: 'uuid', nullable: false })
  entityId: UUID;

  // INTERNAL REFERENCE ID
  @Column({
    name: 'internal_reference_id',
    type: 'varchar',
    nullable: false,
    unique: true,
  })
  internalReferenceId: string;

  // AMOUNT
  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;

  // CURRENCY
  @Column({ name: 'currency', type: 'varchar', length: 3, nullable: false })
  currency: 'RWF' | 'USD';

  // EXTERNAL REFERENCE ID (Kpay Transaction ID)
  @Column({ name: 'external_reference_id', type: 'varchar', nullable: true })
  externalReferenceId: string;

  // CREATED BY ID
  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById?: UUID;

  // TYPE
  @Column({ name: 'type', type: 'enum', nullable: false, enum: PaymentType })
  type: PaymentType;

  // STATUS (Using Kpay status enum)
  @Column({
    name: 'status',
    type: 'enum',
    nullable: false,
    enum: KpayPaymentStatus,
    default: KpayPaymentStatus.PENDING,
  })
  status: KpayPaymentStatus;

  // DESCRIPTION
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // PAYMENT METHOD
  @Column({
    name: 'method',
    type: 'varchar',
    nullable: false,
    default: 'PENDING',
  })
  method: string;

  // PAYMENT TIMESTAMPS
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ name: 'failed_at', type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ name: 'cancelled_at', type: 'timestamp', nullable: true })
  cancelledAt: Date;

  // REFUND FIELDS
  @Column({ name: 'refund_id', type: 'varchar', nullable: true })
  refundId: string;

  @Column({
    name: 'refunded_amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: true,
  })
  refundedAmount: number;

  @Column({ name: 'refunded_at', type: 'timestamp', nullable: true })
  refundedAt: Date;

  @Column({ name: 'refund_reason', type: 'text', nullable: true })
  refundReason: string;

  // FAILURE REASON
  @Column({ name: 'failure_reason', type: 'text', nullable: true })
  failureReason: string;

  // METADATA
  @Column({ name: 'metadata', type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  /**
   * RELATIONS
   */

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;
}
