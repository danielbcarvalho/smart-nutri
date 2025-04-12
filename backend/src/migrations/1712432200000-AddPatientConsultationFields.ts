import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddPatientConsultationFields1712432200000
  implements MigrationInterface
{
  name = 'AddPatientConsultationFields1712432200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Criar os enums
    await queryRunner.query(`
      CREATE TYPE "public"."monitoring_status_enum" AS ENUM (
        'in_progress',
        'paused',
        'completed'
      )
    `);

    await queryRunner.query(`
      CREATE TYPE "public"."consultation_frequency_enum" AS ENUM (
        'weekly',
        'biweekly',
        'monthly',
        'custom'
      )
    `);

    // Adicionar as novas colunas
    await queryRunner.query(`
      ALTER TABLE "patients"
      ADD COLUMN "last_consultation_at" TIMESTAMP,
      ADD COLUMN "next_consultation_at" TIMESTAMP,
      ADD COLUMN "monitoring_status" "public"."monitoring_status_enum" NOT NULL DEFAULT 'in_progress',
      ADD COLUMN "consultation_frequency" "public"."consultation_frequency_enum" NOT NULL DEFAULT 'monthly',
      ADD COLUMN "custom_consultation_days" INTEGER
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remover as colunas
    await queryRunner.query(`
      ALTER TABLE "patients"
      DROP COLUMN "last_consultation_at",
      DROP COLUMN "next_consultation_at",
      DROP COLUMN "monitoring_status",
      DROP COLUMN "consultation_frequency",
      DROP COLUMN "custom_consultation_days"
    `);

    // Remover os enums
    await queryRunner.query(`DROP TYPE "public"."monitoring_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."consultation_frequency_enum"`);
  }
}
