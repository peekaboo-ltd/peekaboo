import { BaseDomain, UUID } from "./base";
import { Organization } from "./organization.type";
import { User } from "./user.type";
import { MembershipStatus, OrganizationRole } from './organization.type';

export interface OrganizationMembership extends BaseDomain {
    userId: UUID;
    organizationId: UUID;
    role?: OrganizationRole;
    status?: MembershipStatus;
    addedById?: UUID;
    organization?: Organization;
    user?: User
}
