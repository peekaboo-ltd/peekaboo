import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { Role } from '../entities/role.entity';
import { RoleTypes, RoleStatus } from '../constants/role.constants';

// Role descriptions and labels for better UX
const roleMetadata: Record<RoleTypes, { description: string; label: string }> = {
  [RoleTypes.ADMIN]: {
    description: 'Full system administrator with access to all features',
    label: 'Administrator',
  },
  [RoleTypes.STAFF]: {
    description: 'Internal staff member with operational access',
    label: 'Staff',
  },
  [RoleTypes.BUSINESS]: {
    description: 'Business account user for B2B organization members',
    label: 'Business User',
  },
  [RoleTypes.CUSTOMER]: {
    description: 'Regular customer who can place delivery orders',
    label: 'Customer',
  },
  [RoleTypes.RIDER]: {
    description: 'Delivery rider who fulfills orders',
    label: 'Rider',
  },
  [RoleTypes.GUEST]: {
    description: 'Guest user who can view the website and the app',
    label: 'Guest User',
  },
};

async function main() {
  await AppDataSource.initialize();

  const roleRepo = AppDataSource.getRepository(Role);

  // Get all role types from the enum
  const allRoleTypes = Object.values(RoleTypes);

  // Get existing roles from database
  const existingRoles = await roleRepo.find();
  const existingRoleNames = new Set(existingRoles.map((role) => role.name));

  // Find missing roles
  const missingRoleTypes = allRoleTypes.filter(
    (roleType) => !existingRoleNames.has(roleType)
  );

  if (missingRoleTypes.length === 0) {
    // eslint-disable-next-line no-console
    console.log('[seed:roles] All roles already exist in database:', allRoleTypes);
  } else {
    // Create missing roles
    const rolesToCreate = missingRoleTypes.map((roleType) => {
      const metadata = roleMetadata[roleType];
      return roleRepo.create({
        name: roleType,
        description: metadata.description,
        label: metadata.label,
        status: RoleStatus.ACTIVE,
      });
    });

    await roleRepo.save(rolesToCreate);

    // eslint-disable-next-line no-console
    console.log('[seed:roles] Created missing roles:', missingRoleTypes);
  }

  // Log final state
  const finalRoles = await roleRepo.find();
  // eslint-disable-next-line no-console
  console.log(
    '[seed:roles] Current roles in database:',
    finalRoles.map((r) => ({ name: r.name, label: r.label, status: r.status }))
  );

  await AppDataSource.destroy();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('[seed:roles] Failed:', err);
  try {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  } catch {
    // ignore
  }
  process.exit(1);
});
