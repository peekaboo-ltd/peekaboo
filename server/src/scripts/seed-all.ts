import 'dotenv/config';
import { spawnSync } from 'child_process';
import path from 'path';

type SeedStep = {
  name: string;
  script: string;
  args?: string[];
};

const seedSteps: SeedStep[] = [
  { name: 'roles', script: 'seed-roles.ts' },
  { name: 'admin', script: 'seed-admin.ts' },
  { name: 'business plans', script: 'seed-business-plans.ts' },
  { name: 'rider attendance', script: 'seed-rider-attendance.ts' },
  {
    name: 'rider problem reports',
    script: 'seed-rider-problem-reports.ts',
  },
  {
    name: 'phone normalization and user deduplication',
    script: 'normalize-phone-numbers.ts',
    args: ['--apply'],
  },
];

const runStep = (step: SeedStep) => {
  console.log(`\n[seed:all] Running ${step.name}...`);

  const result = spawnSync(
    process.execPath,
    [
      '--require',
      require.resolve('ts-node/register'),
      path.resolve(__dirname, step.script),
      ...(step.args ?? []),
    ],
    {
      stdio: 'inherit',
      env: process.env,
    },
  );

  if (result.error) {
    throw result.error;
  }

  if (result.status !== 0) {
    const reason = result.signal
      ? `signal ${result.signal}`
      : `exit code ${result.status}`;
    throw new Error(`${step.name} failed with ${reason}`);
  }
};

try {
  for (const step of seedSteps) {
    runStep(step);
  }

  console.log('\n[seed:all] All seeds and deduplication completed successfully.');
} catch (error) {
  console.error(
    '\n[seed:all] Failed:',
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
}
