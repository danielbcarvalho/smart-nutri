import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddConsultationIdToMeasurements1712600100000
  implements MigrationInterface
{
  name = 'AddConsultationIdToMeasurements1712600100000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Add consultation_id column to measurements table
    await queryRunner.query(`
      ALTER TABLE "measurements"
      ADD COLUMN "consultation_id" uuid
    `);

    // Add foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "measurements"
      ADD CONSTRAINT "FK_measurements_consultation"
      FOREIGN KEY ("consultation_id")
      REFERENCES "consultations"("id")
      ON DELETE SET NULL
      ON UPDATE NO ACTION
    `);

    // Add index for consultation_id
    await queryRunner.query(`
      CREATE INDEX "IDX_measurements_consultation_id" ON "measurements" ("consultation_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop index
    await queryRunner.query(`DROP INDEX "IDX_measurements_consultation_id"`);

    // Drop foreign key constraint
    await queryRunner.query(`
      ALTER TABLE "measurements" DROP CONSTRAINT "FK_measurements_consultation"
    `);

    // Drop column
    await queryRunner.query(`
      ALTER TABLE "measurements" DROP COLUMN "consultation_id"
    `);
  }
}
