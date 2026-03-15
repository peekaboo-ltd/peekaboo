import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { Organization } from './organization.entity';
import { BusinessPlanStatus, PricingConfig } from '../constants/businessPlan.constants';
import { BillingPeriod } from '../constants/organization.constants';

@Entity('business_plans')
export class BusinessPlan extends AbstractEntity {
  // NAME
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  // DESCRIPTION
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // PRICE PER ORDER (in smallest currency unit — fallback for plans without tiers)
  @Column({ name: 'price_per_order', type: 'numeric', nullable: true })
  pricePerOrder?: number;

  // CURRENCY
  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'RWF' })
  currency: string;

  // FEATURES (array of feature bullet points)
  @Column({ name: 'features', type: 'jsonb', default: [] })
  features: string[];

  // PRICING TIERS (volume-based pricing configuration)
  @Column({ name: 'pricing_tiers', type: 'jsonb', nullable: true })
  pricingTiers?: PricingConfig;

  // BILLING PERIOD (plan's natural billing cycle)
  @Column({
    name: 'billing_period',
    type: 'enum',
    enum: BillingPeriod,
    default: BillingPeriod.MONTHLY,
  })
  billingPeriod: BillingPeriod;

  // BADGE (display badge e.g., "MOST POPULAR")
  @Column({ name: 'badge', type: 'varchar', length: 50, nullable: true })
  badge?: string;

  // IS CUSTOM PRICING (for negotiated/dedicated plans)
  @Column({ name: 'is_custom_pricing', type: 'boolean', default: false })
  isCustomPricing: boolean;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    enum: BusinessPlanStatus,
    default: BusinessPlanStatus.ACTIVE,
  })
  status: BusinessPlanStatus;

  // IS DEFAULT (used when org has no specific plan)
  @Column({ name: 'is_default', type: 'boolean', default: false })
  isDefault: boolean;

  /**
   * RELATIONS
   */

  // ORGANIZATIONS
  @OneToMany(() => Organization, (organization) => organization.businessPlan)
  organizations: Organization[];
}
