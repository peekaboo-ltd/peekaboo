import { Column, Entity, JoinColumn, ManyToOne, Unique } from 'typeorm';
import { AbstractEntity } from './index';
import { UUID } from '../types';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { OrganizationRole, MembershipStatus } from '../constants/organization.constants';

@Entity('organization_memberships')
@Unique(['userId']) // User can only belong to one organization
export class OrganizationMembership extends AbstractEntity {
  // USER ID
  @Column({ name: 'user_id', type: 'uuid', nullable: false })
  userId: UUID;

  // ORGANIZATION ID
  @Column({ name: 'organization_id', type: 'uuid', nullable: false })
  organizationId: UUID;

  // ROLE WITHIN ORGANIZATION
  @Column({
    name: 'role',
    type: 'enum',
    enum: OrganizationRole,
    default: OrganizationRole.MEMBER,
  })
  role: OrganizationRole;

  // STATUS
  @Column({
    name: 'status',
    type: 'enum',
    enum: MembershipStatus,
    default: MembershipStatus.ACTIVE,
  })
  status: MembershipStatus;

  // ADDED BY ID
  @Column({ name: 'added_by_id', type: 'uuid', nullable: true })
  addedById?: UUID;

  /**
   * RELATIONS
   */

  // USER
  @ManyToOne(() => User, (user) => user.organizationMembership)
  @JoinColumn({ name: 'user_id' })
  user: User;

  // ORGANIZATION
  @ManyToOne(() => Organization, (organization) => organization.memberships)
  @JoinColumn({ name: 'organization_id' })
  organization: Organization;

  // ADDED BY
  @ManyToOne(() => User)
  @JoinColumn({ name: 'added_by_id' })
  addedBy?: User;
}
