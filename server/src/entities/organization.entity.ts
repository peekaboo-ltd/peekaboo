import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { AbstractEntity } from './index';
import { UUID } from '../types';
import { BusinessPlan } from './businessPlan.entity';
import { OrganizationMembership } from './organizationMembership.entity';
import { Order } from './order.entity';
import { OrganizationBilling } from './organizationBilling.entity';
import { OrganizationStatus } from '../constants/organization.constants';

@Entity('organizations')
export class Organization extends AbstractEntity {
  // NAME
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: false })
  name: string;

  // DESCRIPTION
  @Column({ name: 'description', type: 'text', nullable: true })
  description?: string;

  // EMAIL
  @Column({ name: 'email', type: 'varchar', length: 255, nullable: true })
  email?: string;

  // PHONE NUMBER
  @Column({ name: 'phone_number', type: 'varchar', length: 50, nullable: true })
  phoneNumber?: string;

  // ADDRESS
  @Column({ name: 'address', type: 'text', nullable: true })
  address?: string;

  // TIN (Tax Identification Number)
  @Column({
    name: 'tin',
    type: 'varchar',
    length: 50,
    nullable: true,
    unique: true,
  })
  tin?: string;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    enum: OrganizationStatus,
    default: OrganizationStatus.ACTIVE,
  })
  status: OrganizationStatus;

  // BUSINESS PLAN ID
  @Column({ name: 'business_plan_id', type: 'uuid', nullable: true })
  businessPlanId?: UUID;

  // CREATED BY ID (the user who created this organization)
  @Column({ name: 'created_by_id', type: 'uuid', nullable: false })
  createdById: UUID;

  // DEFAULT LOCATION
  @Column({
    name: 'default_location',
    type: 'jsonb',
    nullable: true,
  })
  defaultLocation?: {
    latitude: number;
    longitude: number;
  };

  /**
   * RELATIONS
   */

  // BUSINESS PLAN
  @ManyToOne(() => BusinessPlan, (businessPlan) => businessPlan.organizations)
  @JoinColumn({ name: 'business_plan_id' })
  businessPlan?: BusinessPlan;

  // MEMBERSHIPS
  @OneToMany(
    () => OrganizationMembership,
    (membership) => membership.organization,
  )
  memberships: OrganizationMembership[];

  // ORDERS
  @OneToMany(() => Order, (order) => order.organization)
  orders: Order[];

  // BILLING RECORDS
  @OneToMany(() => OrganizationBilling, (billing) => billing.organization)
  billingRecords: OrganizationBilling[];
}
