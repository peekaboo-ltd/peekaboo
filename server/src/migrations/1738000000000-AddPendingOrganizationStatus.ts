import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPendingOrganizationStatus1738000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get the actual enum type name used by the status column
    const enumTypeResult = await queryRunner.query(`
      SELECT udt_name FROM information_schema.columns
      WHERE table_name = 'organizations' AND column_name = 'status'
    `);

    if (enumTypeResult.length > 0) {
      const enumTypeName = enumTypeResult[0].udt_name;
      await queryRunner.query(
        `ALTER TYPE "${enumTypeName}" ADD VALUE IF NOT EXISTS 'PENDING' BEFORE 'ACTIVE'`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // PostgreSQL doesn't support removing enum values directly.
    // Update any PENDING orgs to INACTIVE before removing.
    await queryRunner.query(
      `UPDATE organizations SET status = 'INACTIVE' WHERE status = 'PENDING'`
    );
  }
}
