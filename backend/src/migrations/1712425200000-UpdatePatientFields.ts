import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePatientFields1712425200000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patients"
      ALTER COLUMN "email" DROP NOT NULL,
      ALTER COLUMN "phone" DROP NOT NULL,
      ALTER COLUMN "birthDate" DROP NOT NULL,
      ALTER COLUMN "gender" DROP NOT NULL,
      ALTER COLUMN "height" DROP NOT NULL,
      ALTER COLUMN "weight" DROP NOT NULL;
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "patients"
      ALTER COLUMN "email" SET NOT NULL,
      ALTER COLUMN "phone" SET NOT NULL,
      ALTER COLUMN "birthDate" SET NOT NULL,
      ALTER COLUMN "gender" SET NOT NULL,
      ALTER COLUMN "height" SET NOT NULL,
      ALTER COLUMN "weight" SET NOT NULL;
    `);
  }
}
