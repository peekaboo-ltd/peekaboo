import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddBusinessRole1737552000000 implements MigrationInterface {
  name = 'AddBusinessRole1737552000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Find the enum type actually backing roles.name, then add BUSINESS to it.
    const enumTypeRows: Array<{ enum_name: string }> = await queryRunner.query(`
      SELECT t.typname AS enum_name
      FROM pg_type t
      JOIN pg_attribute a ON a.atttypid = t.oid
      JOIN pg_class c ON c.oid = a.attrelid
      WHERE c.relname = 'roles'
        AND a.attname = 'name'
        AND t.typtype = 'e'
      LIMIT 1
    `);

    const enumName = enumTypeRows?.[0]?.enum_name;
    if (enumName) {
      await queryRunner.query(
        `ALTER TYPE "${enumName}" ADD VALUE IF NOT EXISTS 'BUSINESS'`
      );
    }

    // Insert BUSINESS role row if it doesn't exist (let DB defaults generate id/timestamps)
    await queryRunner.query(`
      INSERT INTO roles (name, description, label, status)
      VALUES ('BUSINESS', 'Business/B2B customer account', 'Business', 'ACTIVE')
      ON CONFLICT (name) DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DELETE FROM roles WHERE name = 'BUSINESS'`);
    // Note: enum values cannot be removed safely in Postgres.
  }
}

