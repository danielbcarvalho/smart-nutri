import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCrnToPatients1712432200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patients" 
      ADD COLUMN "crn" character varying,
      ADD CONSTRAINT "UQ_patients_crn" UNIQUE ("crn")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patients" 
      DROP CONSTRAINT "UQ_patients_crn",
      DROP COLUMN "crn"
    `);
  }
}
