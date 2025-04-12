import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateConsultationsTable1712600000000
  implements MigrationInterface
{
  name = 'CreateConsultationsTable1712600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create consultation status enum
    await queryRunner.query(`
      CREATE TYPE "public"."consultation_status_enum" AS ENUM (
        'scheduled',
        'completed',
        'cancelled',
        'rescheduled'
      )
    `);

    // Create consultation type enum
    await queryRunner.query(`
      CREATE TYPE "public"."consultation_type_enum" AS ENUM (
        'initial',
        'follow_up',
        'assessment',
        'meal_plan_review',
        'other'
      )
    `);

    // Create consultations table
    await queryRunner.query(`
      CREATE TABLE "consultations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" TIMESTAMP NOT NULL,
        "patient_id" uuid NOT NULL,
        "nutritionist_id" uuid NOT NULL,
        "notes" TEXT,
        "status" "public"."consultation_status_enum" NOT NULL DEFAULT 'scheduled',
        "type" "public"."consultation_type_enum" NOT NULL DEFAULT 'follow_up',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_consultations" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "consultations"
      ADD CONSTRAINT "FK_consultations_patient"
      FOREIGN KEY ("patient_id")
      REFERENCES "patients"("id")
      ON DELETE CASCADE
      ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "consultations"
      ADD CONSTRAINT "FK_consultations_nutritionist"
      FOREIGN KEY ("nutritionist_id")
      REFERENCES "nutritionists"("id")
      ON DELETE NO ACTION
      ON UPDATE NO ACTION
    `);

    // Add index for common queries
    await queryRunner.query(`
      CREATE INDEX "IDX_consultations_patient_id" ON "consultations" ("patient_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_consultations_nutritionist_id" ON "consultations" ("nutritionist_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_consultations_date" ON "consultations" ("date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_consultations_date"`);
    await queryRunner.query(`DROP INDEX "IDX_consultations_nutritionist_id"`);
    await queryRunner.query(`DROP INDEX "IDX_consultations_patient_id"`);

    // Drop foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "consultations" DROP CONSTRAINT "FK_consultations_nutritionist"
    `);
    await queryRunner.query(`
      ALTER TABLE "consultations" DROP CONSTRAINT "FK_consultations_patient"
    `);

    // Drop table
    await queryRunner.query(`DROP TABLE "consultations"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."consultation_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."consultation_status_enum"`);
  }
}
