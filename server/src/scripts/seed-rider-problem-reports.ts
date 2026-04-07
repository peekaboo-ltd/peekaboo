import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { AppDataSource } from '../data-source';
import { User } from '../entities/user.entity';
import logger from '../helpers/logger.helper';
import { UserProblemReport } from '../entities/userProblemReport.entity';

type ProblemReportSeed = {
  mediaType: 'photo' | 'video';
  filePath: string;
  timestamp: string;
  description: string;
  locationLabel: string;
};

const TARGET_RIDER = {
  phoneNumber: '0788462700',
  email: 'rider1.jado@peekaboo.co.rw',
  name: 'rider 1 jado',
};

const PROBLEM_REPORT_SEEDS: ProblemReportSeed[] = [
  {
    mediaType: 'photo',
    filePath: '/Users/remy/Downloads/WhatsApp Image 2026-03-30 at 23.14.22.jpeg',
    timestamp: '2026-03-31T12:21:30+09:00',
    description:
      'Rear brake response dropped after sudden skid at an intersection. Rider stopped delivery and requested roadside check.',
    locationLabel:
      'Seolag-ro 4-gil 1, Goseong-eup, Goseong-gun, Gangwon-do 24764, South Korea',
  },
  {
    mediaType: 'video',
    filePath: '/Users/remy/Downloads/accident-report-video.mp4',
    timestamp: '2026-03-31T12:28:45+09:00',
    description:
      'Video evidence of a minor accident scene after avoiding a collision. Rider is safe and waiting for support instructions.',
    locationLabel:
      'Jungang-ro 49beon-gil 6, Goseong-eup, Goseong-gun, Gangwon-do 24735, South Korea',
  },
];

const resolveMediaReference = (seed: ProblemReportSeed): string => {
  const absolutePath = path.resolve(seed.filePath);
  if (fs.existsSync(absolutePath)) {
    return absolutePath;
  }

  logger.warning(
    `[seed:rider-problem-reports] File not found for ${seed.mediaType}; using placeholder reference`,
    absolutePath
  );

  return seed.mediaType === 'video'
    ? 'seed://problem-report/accident-video-2026-03-31.mp4'
    : 'seed://problem-report/accident-photo-2026-03-31.jpg';
};

const main = async () => {
  await AppDataSource.initialize();
  const userRepo = AppDataSource.getRepository(User);
  const problemReportRepo = AppDataSource.getRepository(UserProblemReport);

  const rider =
    (await userRepo.findOne({
      where: [{ phoneNumber: TARGET_RIDER.phoneNumber }, { email: TARGET_RIDER.email }],
    })) ||
    (await userRepo.findOne({
      where: { name: TARGET_RIDER.name },
    }));

  if (!rider) {
    throw new Error(
      'Target rider not found. Run seed:rider-attendance first or update TARGET_RIDER in seed-rider-problem-reports.ts.'
    );
  }

  await problemReportRepo.delete({
    userId: rider.id,
    source: 'seed:rider-problem-reports',
  });

  const problemReportProofs: Array<Partial<UserProblemReport>> = PROBLEM_REPORT_SEEDS.map((seed) => ({
    userId: rider.id,
    imageUrl: resolveMediaReference(seed),
    capturedAt: new Date(seed.timestamp),
    locationLabel: seed.locationLabel,
    description: seed.description,
    mediaType: seed.mediaType,
    source: 'seed:rider-problem-reports',
  }));

  await problemReportRepo.save(problemReportProofs);

  logger.success('[seed:rider-problem-reports] Seeded rider problem reports', {
    rider: rider.name,
    riderPhoneNumber: rider.phoneNumber,
    reportsCreated: problemReportProofs.length,
    mediaTypes: problemReportProofs.map((r) => r.mediaType),
  });

  await AppDataSource.destroy();
};

main().catch(async (error) => {
  logger.error('[seed:rider-problem-reports] Failed:', error);
  try {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  } catch {
    logger.error('[seed:rider-problem-reports] Failed to destroy database connection');
  }
  process.exit(1);
});
