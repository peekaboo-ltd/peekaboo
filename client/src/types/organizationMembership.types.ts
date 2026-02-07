import { BaseDomain, UUID } from "./base";
import { Organization } from "./organization.type";
import { User } from "./user.type";

export interface OrganizationMembership extends BaseDomain {
    userId: UUID;
    organizationId: UUID;
    organization?: Organization;
    user?: User
}