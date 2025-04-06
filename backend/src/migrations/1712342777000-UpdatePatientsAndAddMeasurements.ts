import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePatientsAndAddMeasurements1712342777000
  implements MigrationInterface {
  name = 'UpdatePatientsAndAddMeasurements1712342777000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Convertendo allergies para jsonb
    await queryRunner.query(
      `ALTER TABLE "patients" ALTER COLUMN "allergies" TYPE jsonb USING COALESCE(
        CASE 
          WHEN "allergies" IS NULL THEN '[]'::jsonb
          WHEN "allergies" = '' THEN '[]'::jsonb
          ELSE jsonb_build_array("allergies")
        END,
        '[]'::jsonb
      )`,
    );

    // Convertendo medicalConditions para health_conditions
    await queryRunner.query(
      `ALTER TABLE "patients" ADD COLUMN "health_conditions" jsonb`,
    );
    await queryRunner.query(`
      UPDATE "patients" 
      SET "health_conditions" = COALESCE(
        CASE 
          WHEN "medicalConditions" IS NULL THEN '[]'::jsonb
          WHEN "medicalConditions" = '' THEN '[]'::jsonb
          ELSE jsonb_build_array("medicalConditions")
        END,
        '[]'::jsonb
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "patients" DROP COLUMN "medicalConditions"`,
    );

    // Adicionando novas colunas
    await queryRunner.query(`ALTER TABLE "patients" ADD "goals" jsonb`);
    await queryRunner.query(`ALTER TABLE "patients" ADD "medications" jsonb`);
    await queryRunner.query(
      `ALTER TABLE "patients" ADD CONSTRAINT "UQ_patients_email" UNIQUE ("email")`,
    );

    // Criando enum para o gênero
    await queryRunner.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'gender_enum') THEN
          CREATE TYPE "public"."gender_enum" AS ENUM ('M', 'F', 'OTHER');
        END IF;
      END
      $$;
    `);

    // Adicionando coluna gender com tipo enum
    await queryRunner.query(
      `ALTER TABLE "patients" ADD "gender" "public"."gender_enum" NOT NULL DEFAULT 'OTHER'::gender_enum`,
    );

    // Criando tabela measurements
    await queryRunner.query(`
      CREATE TABLE "measurements" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "date" date NOT NULL,
        "weight" decimal(5,2) NOT NULL,
        "body_fat" decimal(5,2),
        "muscle_mass" decimal(5,2),
        "body_water" decimal(5,2),
        "visceral_fat" decimal(5,2),
        "measurements" jsonb NOT NULL,
        "patient_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_measurements" PRIMARY KEY ("id"),
        CONSTRAINT "FK_measurements_patient" FOREIGN KEY ("patient_id") REFERENCES "patients"("id") ON DELETE CASCADE
      )
    `);

    // Criando índices
    await queryRunner.query(`
      CREATE INDEX "IDX_measurements_patient_id" ON "measurements" ("patient_id")
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_measurements_date" ON "measurements" ("date")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Removendo índices
    await queryRunner.query(`DROP INDEX "IDX_measurements_date"`);
    await queryRunner.query(`DROP INDEX "IDX_measurements_patient_id"`);

    // Removendo tabela measurements
    await queryRunner.query(`DROP TABLE "measurements"`);

    // Removendo coluna gender e tipo enum
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "gender"`);
    await queryRunner.query(`DROP TYPE "public"."gender_enum"`);

    // Revertendo alterações na tabela patients
    await queryRunner.query(
      `ALTER TABLE "patients" DROP CONSTRAINT "UQ_patients_email"`,
    );
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "medications"`);
    await queryRunner.query(`ALTER TABLE "patients" DROP COLUMN "goals"`);

    // Revertendo health_conditions para medicalConditions
    await queryRunner.query(
      `ALTER TABLE "patients" ADD COLUMN "medicalConditions" character varying`,
    );
    await queryRunner.query(`
      UPDATE "patients" 
      SET "medicalConditions" = (
        SELECT array_to_string(array_agg(elem), ', ')
        FROM jsonb_array_elements_text("health_conditions") elem
      )
    `);
    await queryRunner.query(
      `ALTER TABLE "patients" DROP COLUMN "health_conditions"`,
    );

    // Revertendo allergies para text
    await queryRunner.query(`
      ALTER TABLE "patients" ALTER COLUMN "allergies" TYPE character varying USING (
        SELECT array_to_string(array_agg(elem), ', ')
        FROM jsonb_array_elements_text("allergies") elem
      )
    `);
  }
}
