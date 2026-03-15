import 'dotenv/config';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { UserStatus } from '../constants/user.constants';
import { hashPassword } from '../helpers/auth.helper';
import { UserRoleService } from '../services/userRole.service';
import { RoleTypes } from '../constants/role.constants';
import logger from '../helpers/logger.helper';

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL || 'info@peekaboo.co.rw';
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

    logger.success('[seed:admin] Created admin user:', { email, phoneNumber });
  } else {
    const hasAdminRole = existing.userRoles?.some((ur) => ur.role?.name === RoleTypes.ADMIN);
    if (!hasAdminRole) {
      await userRoleService.assignRolesToUser(existing.id, [RoleTypes.ADMIN]);
    }

    if (resetPassword || !existing.passwordHash) {
      existing.passwordHash = await hashPassword(password);
      await userRepo.save(existing);
    }

    logger.success('[seed:admin] Admin user already exists:', { email, phoneNumber });
  }

  await AppDataSource.destroy();
}

main().catch(async (err) => {
  logger.error('[seed:admin] Failed:', err);
  try {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  } catch {
    logger.error('[seed:admin] Failed to destroy database:', err);
  }
  process.exit(1);
});

