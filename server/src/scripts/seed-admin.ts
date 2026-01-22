import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { UserStatus } from '../constants/user.constants';
import { hashPassword } from '../helpers/auth.helper';
import { UserRoleService } from '../services/userRole.service';
import { RoleTypes } from '../constants/role.constants';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'admin@peekaboo.local';
  const phoneNumber = process.env.SEED_ADMIN_PHONE || '0780000000';
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.SEED_ADMIN_NAME || 'Admin';
  const resetPassword = String(process.env.SEED_ADMIN_RESET_PASSWORD || 'false') === 'true';

  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const userRoleService = new UserRoleService();

  const existing = await userRepo.findOne({
    where: [{ email }, { phoneNumber }],
    relations: { userRoles: { role: true } },
  });

  if (!existing) {
    const passwordHash = await hashPassword(password);
    const created = await userRepo.save({
      name,
      email,
      phoneNumber,
      passwordHash,
      status: UserStatus.ACTIVE,
    });

    await userRoleService.assignRolesToUser(created.id, [RoleTypes.ADMIN]);

    // eslint-disable-next-line no-console
    console.log('[seed:admin] Created admin user:', { email, phoneNumber });
  } else {
    const hasAdminRole = existing.userRoles?.some((ur) => ur.role?.name === RoleTypes.ADMIN);
    if (!hasAdminRole) {
      await userRoleService.assignRolesToUser(existing.id, [RoleTypes.ADMIN]);
    }

    if (resetPassword || !existing.passwordHash) {
      existing.passwordHash = await hashPassword(password);
      await userRepo.save(existing);
    }

    // eslint-disable-next-line no-console
    console.log('[seed:admin] Admin user already exists:', { email, phoneNumber });
  }

  await AppDataSource.destroy();
}

main().catch(async (err) => {
  // eslint-disable-next-line no-console
  console.error('[seed:admin] Failed:', err);
  try {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  } catch {
    // ignore
  }
  process.exit(1);
});

