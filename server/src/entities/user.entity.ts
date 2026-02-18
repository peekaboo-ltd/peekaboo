import { IsEmail, IsNotEmpty } from 'class-validator';
import { AbstractEntity } from './index';
import { Column, Entity, OneToMany, OneToOne } from 'typeorm';
import { COUNTRIES } from '../constants/countries.constants';
import { UserRole } from './userRole.entity';
import { Order } from './order.entity';
import { UserStatus } from '../constants/user.constants';
import { OrderAssignment } from './orderAssignment.entity';
import { OrganizationMembership } from './organizationMembership.entity';
import { Batch } from './batch.entity';

@Entity('users')
export class User extends AbstractEntity {
  // NAME
  @Column({ name: 'name', type: 'varchar', length: 255, nullable: true })
  @IsNotEmpty({ message: 'Name is required' })
  name?: string;

  // EMAIL
  @Column({
    name: 'email',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: false,
  })
  @IsEmail({}, { message: 'Invalid email address' })
  email?: string;

  // PHONE
  @Column({
    name: 'phone_number',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  phoneNumber?: string;

  // GOOGLE ID (for OAuth users)
  @Column({
    name: 'google_id',
    type: 'varchar',
    length: 255,
    nullable: true,
    unique: true,
  })
  googleId?: string;

  // DATE OF BIRTH
  @Column({
    name: 'date_of_birth',
    type: 'date',
    nullable: true,
  })
  dateOfBirth?: Date;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    nullable: true,
    default: UserStatus.ACTIVE,
    enum: UserStatus,
  })
  status: UserStatus;

  // NATIONALITY
  @Column({
    name: 'nationality',
    type: 'enum',
    nullable: true,
    default: 'RW',
    enum: COUNTRIES.map((country) => country.code),
  })
  nationality?: string;

  // PASSWORD HASH
  @Column({
    name: 'password_hash',
    type: 'varchar',
    length: 255,
    nullable: true,
    select: false,
  })
  passwordHash?: string;

  // DEFAULT LOCATION (for users)
  @Column({ name: 'default_location', type: 'jsonb', nullable: true })
  defaultLocation: {
    latitude: number;
    longitude: number;
  };

  // CURRENT LOCATION (for riders, can be used for order assignment and tracking)
  @Column({ name: 'current_location', type: 'jsonb', nullable: true })
  currentLocation: {
    latitude: number;
    longitude: number;
    collectedAt?: string;
  };

  /**
   * RELATIONS
   */

  // USER ROLES
  @OneToMany(() => UserRole, (userRole) => userRole.user)
  userRoles: UserRole[];

  // ASSIGNMENTS
  @OneToMany(
    () => OrderAssignment,
    (orderAssignment) => orderAssignment.assignedTo,
  )
  assignments: OrderAssignment[];

  // ORDERS
  @OneToMany(() => Order, (order) => order.createdBy)
  orders: Order[];

  // ORGANIZATION MEMBERSHIP (user can belong to at most one organization)
  @OneToMany(() => OrganizationMembership, (membership) => membership.user)
  organizationMembership?: OrganizationMembership[];

  // BATCHES
  @OneToMany(() => Batch, (batch) => batch.createdBy)
  createdBatches: Batch[];
}
