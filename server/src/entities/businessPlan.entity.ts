import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { Organization } from './organization.entity';
import { BusinessPlanStatus } from '../constants/businessPlan.constants';

@Entity('business_plans')
export class BusinessPlan extends AbstractEntity {
  // NAME
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  // DESCRIPTION
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // PRICE PER ORDER (in smallest currency unit, e.g., cents)
  @Column({ name: 'price_per_order', type: 'numeric', nullable: false })
  pricePerOrder: number;

  // CURRENCY
  @Column({ name: 'currency', type: 'varchar', length: 3, default: 'RWF' })
  currency: string;

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
