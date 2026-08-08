import { AppDataSource } from '../data-source';
import { normalizePhoneNumber } from '../helpers/phone.helper';

type PhoneRow = {
  id: string;
  value: string | null;
  createdAt?: Date;
};

type PhoneUpdate = PhoneRow & { e164: string };

type InvalidPhoneRow = PhoneRow & { table: string; column: string };

type DuplicateUserGroup = {
  e164: string;
  survivorId: string;
  duplicateIds: string[];
};

export type NormalizationPlan = {
  users: PhoneUpdate[];
  organizations: PhoneUpdate[];
  payments: PhoneUpdate[];
  pendingWaPhones: PhoneUpdate[];
  pendingRecipientPhones: PhoneUpdate[];
  invalid: InvalidPhoneRow[];
  duplicateUsers: DuplicateUserGroup[];
};

const quoteIdentifier = (identifier: string) => {
  if (!/^[a-z_][a-z0-9_]*$/i.test(identifier)) {
    throw new Error(`Unsafe SQL identifier: ${identifier}`);
  }
  return `"${identifier}"`;
};

export const planRows = (
  rows: PhoneRow[],
  table: string,
  column: string,
): { updates: PhoneUpdate[]; invalid: InvalidPhoneRow[] } => {
  const updates: PhoneUpdate[] = [];
  const invalid: InvalidPhoneRow[] = [];

  for (const row of rows) {
    if (!row.value?.trim()) continue;
    const e164 = normalizePhoneNumber(row.value);
    if (!e164) {
      invalid.push({ ...row, table, column });
      continue;
    }
    if (row.value !== e164) updates.push({ ...row, e164 });
  }

  return { updates, invalid };
};

export const buildDuplicateUserGroups = (
  rows: PhoneRow[],
): DuplicateUserGroup[] => {
  const grouped = new Map<string, PhoneRow[]>();

  for (const row of rows) {
    const e164 = normalizePhoneNumber(row.value);
    if (!e164) continue;
    grouped.set(e164, [...(grouped.get(e164) ?? []), row]);
  }

  return Array.from(grouped.entries()).flatMap(([e164, group]) => {
    if (group.length < 2) return [];
    const sorted = [...group].sort((a, b) => {
      const createdDiff = new Date(a.createdAt ?? 0).getTime()
        - new Date(b.createdAt ?? 0).getTime();
      return createdDiff || a.id.localeCompare(b.id);
    });
    return [{
      e164,
      survivorId: sorted[0].id,
      duplicateIds: sorted.slice(1).map((row) => row.id),
    }];
  });
};

const loadPlan = async (): Promise<NormalizationPlan> => {
  const [users, organizations, payments, pendingSessions] = await Promise.all([
    AppDataSource.query(
      'SELECT id, phone_number AS value, created_at AS "createdAt" FROM users ORDER BY created_at, id',
    ) as Promise<PhoneRow[]>,
    AppDataSource.query(
      'SELECT id, phone_number AS value FROM organizations',
    ) as Promise<PhoneRow[]>,
    AppDataSource.query(
      'SELECT id, customer_phone AS value FROM payments',
    ) as Promise<PhoneRow[]>,
    AppDataSource.query(
      'SELECT id, wa_phone AS "waPhone", recipient_phone AS "recipientPhone" FROM pending_order_sessions',
    ) as Promise<Array<{ id: string; waPhone: string | null; recipientPhone: string | null }>>,
  ]);

  const userPlan = planRows(users, 'users', 'phone_number');
  const organizationPlan = planRows(
    organizations,
    'organizations',
    'phone_number',
  );
  const paymentPlan = planRows(payments, 'payments', 'customer_phone');
  const pendingWaPlan = planRows(
    pendingSessions.map((row) => ({ id: row.id, value: row.waPhone })),
    'pending_order_sessions',
    'wa_phone',
  );
  const pendingRecipientPlan = planRows(
    pendingSessions.map((row) => ({ id: row.id, value: row.recipientPhone })),
    'pending_order_sessions',
    'recipient_phone',
  );

  return {
    users: userPlan.updates,
    organizations: organizationPlan.updates,
    payments: paymentPlan.updates,
    pendingWaPhones: pendingWaPlan.updates,
    pendingRecipientPhones: pendingRecipientPlan.updates,
    invalid: [
      ...userPlan.invalid,
      ...organizationPlan.invalid,
      ...paymentPlan.invalid,
      ...pendingWaPlan.invalid,
      ...pendingRecipientPlan.invalid,
    ],
    duplicateUsers: buildDuplicateUserGroups(users),
  };
};

const printPlan = (plan: NormalizationPlan, apply: boolean) => {
  console.log(`Phone normalization ${apply ? 'apply' : 'dry run'}`);
  console.table({
    usersToNormalize: plan.users.length,
    organizationsToNormalize: plan.organizations.length,
    paymentsToNormalize: plan.payments.length,
    pendingWaPhonesToNormalize: plan.pendingWaPhones.length,
    pendingRecipientPhonesToNormalize: plan.pendingRecipientPhones.length,
    duplicateUserGroups: plan.duplicateUsers.length,
    invalidValues: plan.invalid.length,
  });

  const proposedChanges = [
    ...plan.users.map((row) => ({ table: 'users', column: 'phone_number', ...row })),
    ...plan.organizations.map((row) => ({ table: 'organizations', column: 'phone_number', ...row })),
    ...plan.payments.map((row) => ({ table: 'payments', column: 'customer_phone', ...row })),
    ...plan.pendingWaPhones.map((row) => ({ table: 'pending_order_sessions', column: 'wa_phone', ...row })),
    ...plan.pendingRecipientPhones.map((row) => ({ table: 'pending_order_sessions', column: 'recipient_phone', ...row })),
  ];
  if (proposedChanges.length > 0) {
    console.table(proposedChanges.map((row) => ({
      table: row.table,
      column: row.column,
      id: row.id,
      from: row.value,
      to: row.e164,
    })));
  }

  if (plan.duplicateUsers.length > 0) {
    console.table(plan.duplicateUsers.map((group) => ({
      phone: group.e164,
      survivorId: group.survivorId,
      duplicateIds: group.duplicateIds.join(', '),
    })));
  }
  if (plan.invalid.length > 0) {
    console.table(plan.invalid.map((row) => ({
      table: row.table,
      column: row.column,
      id: row.id,
      value: row.value,
    })));
  }
};

const mergeDuplicateUser = async (
  queryRunner: ReturnType<typeof AppDataSource.createQueryRunner>,
  group: DuplicateUserGroup,
) => {
  for (const duplicateId of group.duplicateIds) {
    await queryRunner.query(
      `DELETE FROM user_roles duplicate_role
       WHERE duplicate_role.user_id = $1
         AND EXISTS (
           SELECT 1 FROM user_roles survivor_role
           WHERE survivor_role.user_id = $2
             AND survivor_role.role_id = duplicate_role.role_id
         )`,
      [duplicateId, group.survivorId],
    );
    await queryRunner.query(
      'UPDATE user_roles SET user_id = $1 WHERE user_id = $2',
      [group.survivorId, duplicateId],
    );

    const survivorMembership = await queryRunner.query(
      'SELECT id FROM organization_memberships WHERE user_id = $1 LIMIT 1',
      [group.survivorId],
    ) as Array<{ id: string }>;
    if (survivorMembership.length > 0) {
      await queryRunner.query(
        'DELETE FROM organization_memberships WHERE user_id = $1',
        [duplicateId],
      );
    } else {
      await queryRunner.query(
        'UPDATE organization_memberships SET user_id = $1 WHERE user_id = $2',
        [group.survivorId, duplicateId],
      );
    }

    const foreignKeys = await queryRunner.query(
      `SELECT DISTINCT tc.table_name AS "tableName", kcu.column_name AS "columnName"
       FROM information_schema.table_constraints tc
       JOIN information_schema.key_column_usage kcu
         ON tc.constraint_name = kcu.constraint_name
        AND tc.constraint_schema = kcu.constraint_schema
       JOIN information_schema.constraint_column_usage ccu
         ON ccu.constraint_name = tc.constraint_name
        AND ccu.constraint_schema = tc.constraint_schema
       WHERE tc.constraint_type = 'FOREIGN KEY'
         AND ccu.table_name = 'users'
         AND ccu.column_name = 'id'
         AND tc.table_schema = current_schema()`,
    ) as Array<{ tableName: string; columnName: string }>;

    for (const foreignKey of foreignKeys) {
      if (
        foreignKey.tableName === 'user_roles'
        || (
          foreignKey.tableName === 'organization_memberships'
          && foreignKey.columnName === 'user_id'
        )
      ) {
        continue;
      }

      await queryRunner.query(
        `UPDATE ${quoteIdentifier(foreignKey.tableName)}
         SET ${quoteIdentifier(foreignKey.columnName)} = $1
         WHERE ${quoteIdentifier(foreignKey.columnName)} = $2`,
        [group.survivorId, duplicateId],
      );
    }

    await queryRunner.query(
      `UPDATE audit_logs
       SET entity_id = $1
       WHERE entity_type = 'USER' AND entity_id = $2`,
      [group.survivorId, duplicateId],
    );
    await queryRunner.query('DELETE FROM users WHERE id = $1', [duplicateId]);
  }

  await queryRunner.query(
    'UPDATE users SET phone_number = $1 WHERE id = $2',
    [group.e164, group.survivorId],
  );
};

export const applyPhoneNormalizationPlan = async (plan: NormalizationPlan) => {
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const duplicateIds = new Set(
      plan.duplicateUsers.flatMap((group) => group.duplicateIds),
    );

    for (const group of plan.duplicateUsers) {
      await mergeDuplicateUser(queryRunner, group);
    }

    const updates: Array<{
      table: string;
      column: string;
      rows: PhoneUpdate[];
    }> = [
      { table: 'users', column: 'phone_number', rows: plan.users },
      { table: 'organizations', column: 'phone_number', rows: plan.organizations },
      { table: 'payments', column: 'customer_phone', rows: plan.payments },
      {
        table: 'pending_order_sessions',
        column: 'wa_phone',
        rows: plan.pendingWaPhones,
      },
      {
        table: 'pending_order_sessions',
        column: 'recipient_phone',
        rows: plan.pendingRecipientPhones,
      },
    ];

    for (const update of updates) {
      for (const row of update.rows) {
        if (duplicateIds.has(row.id)) continue;
        await queryRunner.query(
          `UPDATE ${quoteIdentifier(update.table)}
           SET ${quoteIdentifier(update.column)} = $1
           WHERE id = $2`,
          [row.e164, row.id],
        );
      }
    }

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
};

export const runPhoneNormalization = async (apply: boolean) => {
  await AppDataSource.initialize();
  try {
    const plan = await loadPlan();
    printPlan(plan, apply);

    if (apply && plan.invalid.length > 0) {
      throw new Error('Invalid stored phone values must be resolved before apply');
    }
    if (!apply) {
      console.log('Dry run complete. Re-run with --apply to persist these changes.');
      return;
    }

    await applyPhoneNormalizationPlan(plan);
    const finalPlan = await loadPlan();
    console.table({
      remainingChanges:
        finalPlan.users.length
        + finalPlan.organizations.length
        + finalPlan.payments.length
        + finalPlan.pendingWaPhones.length
        + finalPlan.pendingRecipientPhones.length,
      remainingDuplicateUserGroups: finalPlan.duplicateUsers.length,
      remainingInvalidValues: finalPlan.invalid.length,
    });
    console.log('Phone normalization committed successfully. Re-running will produce no changes.');
  } finally {
    await AppDataSource.destroy();
  }
};

if (require.main === module) {
  runPhoneNormalization(process.argv.includes('--apply')).catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });
}
