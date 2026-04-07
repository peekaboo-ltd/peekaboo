import 'dotenv/config';
import path from 'path';
import fs from 'fs';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/userRole.entity';
import { UserStatus } from '../constants/user.constants';
import { RoleStatus, RoleTypes } from '../constants/role.constants';
import { hashPassword } from '../helpers/auth.helper';
import { uploadUserStatusProofToCloudinary } from '../integrations/cloudinary/cloudinary.service';
import logger from '../helpers/logger.helper';
import { UserStatusProof } from '../entities/userStatusProof.entity';

type RiderSeed = {
  name: string;
  phoneNumber: string;
  email: string;
  checkInProofPath: string;
  checkOutProofPath?: string;
  hasCheckOut: boolean;
};

const RIDERS: RiderSeed[] = [
  {
    name: 'rider 1 jado',
    phoneNumber: '0788462700',
    email: 'rider1.jado@peekaboo.co.rw',
    checkInProofPath: '/Users/remy/Downloads/WhatsApp Image 2026-03-30 at 15.36.22.jpeg',
    checkOutProofPath: '/Users/remy/Downloads/WhatsApp Image 2026-03-30 at 15.57.26.jpeg',
    hasCheckOut: true,
  },
  {
    name: 'claude',
    phoneNumber: '0782833933',
    email: 'claude@peekaboo.co.rw',
    checkInProofPath: '/Users/remy/Downloads/WhatsApp Image 2026-03-30 at 15.57.26.jpeg',
    hasCheckOut: false,
  },
  {
    name: 'philipe',
    phoneNumber: '0784884794',
    email: 'philipe@peekaboo.co.rw',
    checkInProofPath: '/Users/remy/Downloads/WhatsApp Image 2026-03-30 at 15.58.12.jpeg',
    checkOutProofPath: '/Users/remy/Downloads/WhatsApp Image 2026-03-30 at 15.36.22.jpeg',
    hasCheckOut: true,
  },
];

const now = new Date();
const todayDate = now.toISOString().slice(0, 10);

const toIsoAtToday = (hour: number, minute: number) => {
  const d = new Date(now);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

const ensureRiderRole = async () => {
  const roleRepo = AppDataSource.getRepository(Role);
  let riderRole = await roleRepo.findOne({ where: { name: RoleTypes.RIDER } });

  if (!riderRole) {
    riderRole = await roleRepo.save({
      name: RoleTypes.RIDER,
      label: 'Rider',
      description: 'Delivery rider who fulfills orders',
      status: RoleStatus.ACTIVE,
    });
    logger.success('[seed:rider-attendance] Created RIDER role');
  }

  return riderRole;
};

const ensureRiderUser = async (seed: RiderSeed) => {
  const userRepo = AppDataSource.getRepository(User);
  const userRoleRepo = AppDataSource.getRepository(UserRole);
  const riderRole = await ensureRiderRole();

  const existing =
    (await userRepo.findOne({
      where: [{ phoneNumber: seed.phoneNumber }, { email: seed.email }],
    })) ||
    (await userRepo.findOne({
      where: { name: seed.name },
    }));

  const passwordHash = await hashPassword('Rider123!');

  const user = await userRepo.save({
    ...(existing || {}),
    name: existing?.name || seed.name,
    phoneNumber: existing?.phoneNumber || seed.phoneNumber,
    email: existing?.email || seed.email,
    status: UserStatus.ACTIVE,
    passwordHash: existing?.passwordHash || passwordHash,
    currentLocation: existing?.currentLocation || {
      latitude: -1.9441,
      longitude: 30.0619,
      collectedAt: toIsoAtToday(9, 0),
    },
  });

  const existingUserRole = await userRoleRepo.findOne({
    where: {
      userId: user.id,
      roleId: riderRole.id,
    },
  });

  if (!existingUserRole) {
    await userRoleRepo.save({
      userId: user.id,
      roleId: riderRole.id,
    });
  }

  return user;
};

const uploadProofIfExists = async (
  filePath: string | undefined,
  userId: string,
  status: UserStatus
): Promise<string | undefined> => {
  if (!filePath) return undefined;

  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    logger.warn(`[seed:rider-attendance] Proof image not found: ${absolutePath}`);
    return undefined;
  }

  try {
    return await uploadUserStatusProofToCloudinary(absolutePath, {
      userId,
      status,
    });
  } catch (error) {
    logger.warn(`[seed:rider-attendance] Failed to upload proof: ${absolutePath}`);
    logger.warn(String(error));
    return undefined;
  }
};

const main = async () => {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const statusProofRepo = AppDataSource.getRepository(UserStatusProof);

  for (const [index, riderSeed] of RIDERS.entries()) {
    const user = await ensureRiderUser(riderSeed);
    const checkInIso = toIsoAtToday(8 + index, 10);
    const checkOutIso = toIsoAtToday(17 + index, 20);

    const checkInUrl = await uploadProofIfExists(
      riderSeed.checkInProofPath,
      user.id,
      UserStatus.ACTIVE
    );
    const checkOutUrl = riderSeed.hasCheckOut
      ? await uploadProofIfExists(
          riderSeed.checkOutProofPath,
          user.id,
          UserStatus.INACTIVE
        )
      : undefined;

    await statusProofRepo
      .createQueryBuilder()
      .delete()
      .from(UserStatusProof)
      .where('userId = :userId', { userId: user.id })
      .andWhere('capturedAt >= :startOfDay', { startOfDay: `${todayDate}T00:00:00.000Z` })
      .andWhere('capturedAt <= :endOfDay', { endOfDay: `${todayDate}T23:59:59.999Z` })
      .execute();

    const seededProofs: Array<Partial<UserStatusProof>> = [
      {
        userId: user.id,
        imageUrl: checkInUrl || '',
        status: UserStatus.ACTIVE,
        capturedAt: new Date(checkInIso),
        locationLabel: 'Kigali, Rwanda',
        latitude: -1.9441,
        longitude: 30.0619,
      },
    ];

    if (riderSeed.hasCheckOut) {
      seededProofs.push({
        userId: user.id,
        imageUrl: checkOutUrl || '',
        status: UserStatus.INACTIVE,
        capturedAt: new Date(checkOutIso),
        locationLabel: 'Kigali, Rwanda',
        latitude: -1.9441,
        longitude: 30.0619,
      });
    }

    await statusProofRepo.save(seededProofs);

    await userRepo.save({
      ...user,
      currentLocation: {
        latitude: -1.9441,
        longitude: 30.0619,
        collectedAt: riderSeed.hasCheckOut ? checkOutIso : checkInIso,
      },
    });

    logger.success('[seed:rider-attendance] Seeded rider attendance', {
      rider: user.name,
      phoneNumber: user.phoneNumber,
      hasCheckIn: true,
      hasCheckOut: riderSeed.hasCheckOut,
    });
  }

  await AppDataSource.destroy();
};

main().catch(async (error) => {
  logger.error('[seed:rider-attendance] Failed:', error);
  try {
    if (AppDataSource.isInitialized) await AppDataSource.destroy();
  } catch {
    logger.error('[seed:rider-attendance] Failed to destroy database connection');
  }
  process.exit(1);
});
