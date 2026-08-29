import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { User } from './user.entity';
import { UUID } from '../types';
import {
  OrderPaymentStatus,
  OrderStatus,
  OrderType,
  PreferredContactMethod,
} from '../constants/order.constants';
import { Conversation } from './conversation.entity';
import { OrderAssignment } from './orderAssignment.entity';
import { OrderActivity } from './orderActivity.entity';
import { Organization } from './organization.entity';
import { OrganizationBilling } from './organizationBilling.entity';
import { Batch } from './batch.entity';

@Entity('orders')
export class Order extends AbstractEntity {
  // REFERENCE ID
  @Column({ name: 'reference_id', type: 'varchar', length: 255 })
  referenceId: string;

  // EXTERNAL REFERENCE ID (for integration with external systems)
  @Column({
    name: 'external_reference_id',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  externalReferenceId: string;

  // OTP (for delivery tracking)
  @Column({ name: 'tracking_id', type: 'varchar', length: 255, nullable: true })
  trackingId: string;

  // RECIPIENT ID
  @Column({ name: 'recipient_id', type: 'uuid', nullable: true })
  recipientId: UUID;

  // SENDER ID
  @Column({ name: 'sender_id', type: 'uuid', nullable: true })
  senderId: UUID;

  // CREATED BY ID
  @Column({ name: 'created_by_id', type: 'uuid', nullable: false })
  createdById: UUID;

  // INITIAL FEE
  @Column({ name: 'initial_fee', type: 'numeric', nullable: false })
  initialFee: number;

  // DESCRIPTION
  @Column({ name: 'description', type: 'text', nullable: true })
  description: string;

  // NOTES
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes: string;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: false,
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  // TYPE
  @Column({
    name: 'type',
    type: 'enum',
    nullable: false,
    enum: OrderType,
    default: OrderType.SEND,
  })
  type: OrderType;

  // DISCOUNT
  @Column({ name: 'discount', type: 'numeric', nullable: true, default: 0 })
  discount: number;

  // FINAL FEE
  @Column({ name: 'final_fee', type: 'numeric', nullable: true })
  finalFee: number;

  // PAYMENT STATUS
  @Column({
    name: 'payment_status',
    type: 'enum',
    enum: OrderPaymentStatus,
    nullable: true,
  })
  paymentStatus?: OrderPaymentStatus | null;

  // PREFERRED CONTACT METHOD
  @Column({
    name: 'preferred_contact_method',
    type: 'enum',
    enum: PreferredContactMethod,
    nullable: true,
  })
  preferredContactMethod?: PreferredContactMethod | null;

  // CONTACT EMAIL
  // The order carries its own address rather than writing to the linked User:
  // the public order endpoint is unauthenticated, so it must not be able to
  // mutate a user record. Only meaningful when preferredContactMethod is EMAIL.
  @Column({ name: 'contact_email', type: 'varchar', length: 255, nullable: true })
  contactEmail?: string | null;

  // CONVERSATION ID
  @Column({ name: 'conversation_id', type: 'uuid', nullable: true })
  conversationId: UUID;

  // LOCATION FROM
  // `name`/`formattedAddress`/`placeId` are the human friendly labels captured
  // when the place was picked, so the order can be described without a reverse
  // geocode lookup. They are absent on orders created from a raw map pin.
  @Column({ name: 'location_from', type: 'jsonb', nullable: true })
  locationFrom: {
    latitude: number;
    longitude: number;
    name?: string;
    formattedAddress?: string;
    placeId?: string;
  };

  // LOCATION TO
  @Column({ name: 'location_to', type: 'jsonb', nullable: true })
  locationTo: {
    latitude: number;
    longitude: number;
    name?: string;
    formattedAddress?: string;
    placeId?: string;
  };

  // ORGANIZATION ID (null for individual/B2C orders)
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  organizationId?: UUID;

  // ORGANIZATION BILLING ID (links order to billing period)
  @Column({ name: 'organization_billing_id', type: 'uuid', nullable: true })
  organizationBillingId?: UUID;

  // IS BUSINESS ORDER (quick flag to identify B2B orders)
  @Column({ name: 'is_business_order', type: 'boolean', default: false })
  isBusinessOrder: boolean;

  // BUSINESS PLAN PRICE (price locked at time of order creation)
  @Column({ name: 'business_plan_price', type: 'numeric', nullable: true })
  businessPlanPrice?: number;

  // BATCH ID (for batch deliveries)
  @Column({ name: 'batch_id', type: 'uuid', nullable: true })
  batchId?: UUID;

  // WhatsApp / maps pickup metadata (B2C flow)
  @Column({ name: 'pickup_provider', type: 'varchar', length: 32, nullable: true })
  pickupProvider?: string | null;

  @Column({
    name: 'pickup_provider_place_id',
    type: 'varchar',
    length: 512,
    nullable: true,
  })
  pickupProviderPlaceId?: string | null;

  @Column({ name: 'order_source', type: 'varchar', length: 64, nullable: true })
  orderSource?: string | null;

  /**
   * RELATIONS
   */

  // RECIPIENT
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'recipient_id' })
  recipient: User;

  // CREATED BY
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  // SENDER
  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'sender_id' })
  sender: User;

  // ORDER ACTIVITIES
  @OneToMany(() => OrderActivity, (orderActivity) => orderActivity.order)
  activities: OrderActivity[];

  // ASSIGNMENTS
  @OneToMany(() => OrderAssignment, (orderAssignment) => orderAssignment.order)
  assignments: OrderAssignment[];

  // CONVERSATION
  @ManyToOne(() => Conversation, (conversation) => conversation.id)
  @JoinColumn({ name: 'conversation_id' })
  conversation: Conversation;

  // ORGANIZATION
  @ManyToOne(() => Organization, (organization) => organization.orders)
  @JoinColumn({ name: 'organization_id' })
  organization?: Organization;

  // ORGANIZATION BILLING
  @ManyToOne(() => OrganizationBilling, (billing) => billing.orders)
  @JoinColumn({ name: 'organization_billing_id' })
  organizationBilling?: OrganizationBilling;

  // BATCH
  @ManyToOne(() => Batch, (batch) => batch.orders, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'batch_id' })
  batch?: Batch;
}
