import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInstagramToPatient1712425200001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patients"
      ADD COLUMN "instagram" character varying;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patients"
      DROP COLUMN "instagram";
    `);
  }
}
