import { Column, JoinColumn, ManyToOne, Entity } from 'typeorm';
import { AbstractEntity } from '.';
import { UUID } from '../types';
import { PaymentType } from '../constants/payment.constants';
import { User } from './user.entity';
import { KpayCurrency, KpayPaymentMethod, KpayPaymentStatus } from '../types/kpay.types';
import { PaymentProvider } from '../types/urubuto.types';

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
  })
  internalReferenceId?: string;

  @Column({ name: 'idempotency_key', type: 'varchar', length: 255, nullable: true, unique: true })
  idempotencyKey?: string | null;

  // AMOUNT
  @Column({
    name: 'amount',
    type: 'decimal',
    precision: 10,
    scale: 2,
    nullable: false,
  })
  amount: number;

  @Column({ name: 'customer_email', type: 'varchar', length: 255, nullable: true })
  customerEmail?: string;

  @Column({ name: 'customer_name', type: 'varchar', length: 255, nullable: true })
  customerName?: string;

  @Column({ name: 'customer_phone', type: 'varchar', length: 20, nullable: true })
  customerPhone?: string;

  // CURRENCY
  @Column({ name: 'currency', type: 'varchar', length: 3, nullable: false, default: KpayCurrency.RWF })
  currency: 'RWF' | 'USD';

  // EXTERNAL REFERENCE ID (Kpay Transaction ID)
  @Column({ name: 'external_reference_id', type: 'varchar', nullable: true })
  externalReferenceId?: string;

  // PAYMENT PROVIDER
  @Column({
    name: 'provider',
    type: 'varchar',
    nullable: false,
    default: PaymentProvider.URUBUTO,
  })
  provider: PaymentProvider;

  // CREATED BY ID
  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById?: UUID;

  // TYPE
  @Column({ name: 'type', type: 'enum', nullable: false, default: PaymentType.ORDER, enum: PaymentType })
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
    nullable: true,
    default: KpayPaymentMethod.MOBILE_MONEY,
  })
  method: string;

  paymentUrl?: string;

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
