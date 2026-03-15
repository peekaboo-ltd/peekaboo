import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { UUID } from '../types';
import { Organization } from './organization.entity';
import { Order } from './order.entity';
import { User } from './user.entity';
import { BusinessPlan } from './businessPlan.entity';
import { BillingStatus, BillingPeriod } from '../constants/organization.constants';
import { PricingConfig, TierBreakdown } from '../constants/businessPlan.constants';

@Entity('organization_billings')
export class OrganizationBilling extends AbstractEntity {
  // ORGANIZATION ID
  @Column({ name: 'organization_id', type: 'uuid', nullable: false })
  organizationId: UUID;

  // BILLING PERIOD TYPE
  @Column({
    name: 'billing_period',
    type: 'enum',
    enum: BillingPeriod,
    default: BillingPeriod.MONTHLY,
  })
  billingPeriod: BillingPeriod;

  // PERIOD START DATE
  @Column({ name: 'period_start', type: 'timestamp', nullable: false })
  periodStart: Date;

  // PERIOD END DATE
  @Column({ name: 'period_end', type: 'timestamp', nullable: false })
  periodEnd: Date;

  // TOTAL ORDERS IN PERIOD
  @Column({ name: 'total_orders', type: 'integer', default: 0 })
  totalOrders: number;

  // TOTAL AMOUNT
  @Column({ name: 'total_amount', type: 'numeric', default: 0 })
  totalAmount: number;

  // CURRENCY
  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'RWF' })
  currency: string;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    enum: BillingStatus,
    default: BillingStatus.PENDING,
  })
  status: BillingStatus;

  // INVOICE NUMBER (generated when invoiced)
  @Column({ name: 'invoice_number', type: 'varchar', length: 50, nullable: true, unique: true })
  invoiceNumber?: string;

  // INVOICED AT
  @Column({ name: 'invoiced_at', type: 'timestamp', nullable: true })
  invoicedAt?: Date;

  // DUE DATE (set when invoice is generated based on payment terms)
  @Column({ name: 'due_date', type: 'timestamp', nullable: true })
  dueDate?: Date;

  // PAYMENT TERMS IN DAYS
  @Column({ name: 'payment_terms_days', type: 'integer', default: 30 })
  paymentTermsDays: number;

  // PAID AT
  @Column({ name: 'paid_at', type: 'timestamp', nullable: true })
  paidAt?: Date;

  // BUSINESS PLAN ID (plan active during this billing period)
  @Column({ name: 'business_plan_id', type: 'uuid', nullable: true })
  businessPlanId?: UUID;

  // PRICING SNAPSHOT (immutable copy of pricing tiers at period creation)
  @Column({ name: 'pricing_snapshot', type: 'jsonb', nullable: true })
  pricingSnapshot?: PricingConfig;

  // TIER BREAKDOWN (calculated breakdown of how total was computed)
  @Column({ name: 'tier_breakdown', type: 'jsonb', nullable: true })
  tierBreakdown?: TierBreakdown[];

  // NOTES
  @Column({ name: 'notes', type: 'text', nullable: true })
  notes?: string;

  // CREATED BY ID
  @Column({ name: 'created_by_id', type: 'uuid', nullable: true })
  createdById?: UUID;

  /**
   * RELATIONS
   */

  // ORGANIZATION
  @ManyToOne(() => Organization, (organization) => organization.billingRecords)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // ORDERS IN THIS BILLING PERIOD
  @OneToMany(() => Order, (order) => order.organizationBilling)
  orders: Order[];

  // BUSINESS PLAN
  @ManyToOne(() => BusinessPlan)
  @JoinColumn({ name: 'business_plan_id' })
  businessPlan?: BusinessPlan;

  // CREATED BY
  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by_id' })
  createdBy?: User;
}
